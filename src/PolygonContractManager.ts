import { ethers } from 'ethers';
import { PolygonConfig, PolygonContract, PolygonTransaction } from './types';
import { PolygonError, PolygonNetworkError, PolygonRPCError } from './errors';
import { validateAddress, validateTxHash, retry } from './utils';

export class PolygonContractManager {
  private config: PolygonConfig;
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;

  constructor(config: PolygonConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  async deployContract(
    bytecode: string,
    abi: any[],
    constructorArgs: any[] = [],
    gasLimit?: number
  ): Promise<PolygonContract> {
    try {
      if (!this.signer) {
        throw new PolygonError('Signer required for contract deployment', 'SIGNER_REQUIRED');
      }

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
      
      const contract = await retry(async () => {
        const gasEstimate = await factory.getDeployTransaction(...constructorArgs).then(tx => 
          this.provider.estimateGas(tx)
        );
        
        const deployTx = await factory.deploy(...constructorArgs, {
          gasLimit: gasLimit || gasEstimate.mul(120).div(100) // 20% buffer
        });
        
        return deployTx;
      });

      await contract.deployed();

      return {
        address: contract.address,
        abi: abi,
        bytecode: bytecode,
        deployedAt: new Date().toISOString(),
        transactionHash: contract.deployTransaction.hash,
        gasUsed: contract.deployTransaction.gasLimit?.toString() || '0',
        gasPrice: contract.deployTransaction.gasPrice?.toString() || '0'
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to deploy contract', error);
    }
  }

  async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    try {
      const validatedAddress = validateAddress(address);
      if (!validatedAddress) {
        throw new PolygonError('Invalid contract address', 'INVALID_ADDRESS');
      }

      return new ethers.Contract(address, abi, this.signer || this.provider);
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to get contract', error);
    }
  }

  async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = []
  ): Promise<any> {
    try {
      const contract = await this.getContract(contractAddress, abi);
      return await contract[methodName](...args);
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError(`Failed to call contract method ${methodName}`, error);
    }
  }

  async sendContractTransaction(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    options: {
      value?: string;
      gasLimit?: number;
      gasPrice?: string;
    } = {}
  ): Promise<PolygonTransaction> {
    try {
      if (!this.signer) {
        throw new PolygonError('Signer required for contract transactions', 'SIGNER_REQUIRED');
      }

      const contract = await this.getContract(contractAddress, abi);
      
      const tx = await retry(async () => {
        const gasEstimate = await contract.estimateGas[methodName](...args, options);
        
        return await contract[methodName](...args, {
          ...options,
          gasLimit: options.gasLimit || gasEstimate.mul(120).div(100) // 20% buffer
        });
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || contractAddress,
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.transactionIndex,
        status: receipt.status === 1 ? 'success' : 'failed',
        logs: receipt.logs,
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || '0'
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError(`Failed to send contract transaction ${methodName}`, error);
    }
  }

  async getContractEvents(
    contractAddress: string,
    abi: any[],
    eventName: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    try {
      const contract = await this.getContract(contractAddress, abi);
      
      const filter = contract.filters[eventName]();
      const events = await contract.queryFilter(filter, fromBlock, toBlock);
      
      return events.map(event => ({
        address: event.address,
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        transactionHash: event.transactionHash,
        transactionIndex: event.transactionIndex,
        logIndex: event.logIndex,
        removed: event.removed,
        args: event.args,
        topics: event.topics,
        data: event.data
      }));
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError(`Failed to get contract events ${eventName}`, error);
    }
  }

  async getContractBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get contract balance', error);
    }
  }

  async getContractCode(address: string): Promise<string> {
    try {
      return await this.provider.getCode(address);
    } catch (error) {
      throw new PolygonNetworkError('Failed to get contract code', error);
    }
  }

  async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.getContractCode(address);
      return code !== '0x';
    } catch (error) {
      throw new PolygonNetworkError('Failed to check if address is contract', error);
    }
  }

  async getContractStorageAt(
    address: string,
    position: string
  ): Promise<string> {
    try {
      return await this.provider.getStorageAt(address, position);
    } catch (error) {
      throw new PolygonNetworkError('Failed to get contract storage', error);
    }
  }

  async estimateGas(
    to: string,
    data: string,
    value?: string
  ): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        value: value ? ethers.utils.parseEther(value) : undefined
      });
      return gasEstimate.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to estimate gas', error);
    }
  }

  async getTransactionCount(address: string): Promise<number> {
    try {
      return await this.provider.getTransactionCount(address);
    } catch (error) {
      throw new PolygonNetworkError('Failed to get transaction count', error);
    }
  }

  async getTransaction(txHash: string): Promise<PolygonTransaction | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return null;

      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        gasUsed: receipt?.gasUsed.toString() || '0',
        blockNumber: receipt?.blockNumber || 0,
        blockHash: receipt?.blockHash || '',
        transactionIndex: receipt?.transactionIndex || 0,
        status: receipt?.status === 1 ? 'success' : 'failed',
        logs: receipt?.logs || [],
        effectiveGasPrice: receipt?.effectiveGasPrice?.toString() || '0'
      };
    } catch (error) {
      throw new PolygonNetworkError('Failed to get transaction', error);
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<PolygonTransaction> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      
      return {
        hash: receipt.transactionHash,
        from: receipt.from,
        to: receipt.to || '',
        value: '0', // Not available in receipt
        gasLimit: '0', // Not available in receipt
        gasPrice: '0', // Not available in receipt
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.transactionIndex,
        status: receipt.status === 1 ? 'success' : 'failed',
        logs: receipt.logs,
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || '0'
      };
    } catch (error) {
      throw new PolygonNetworkError('Failed to wait for transaction', error);
    }
  }

  async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get current block number', error);
    }
  }

  async getBlock(blockNumber: number): Promise<any> {
    try {
      return await this.provider.getBlock(blockNumber);
    } catch (error) {
      throw new PolygonNetworkError('Failed to get block', error);
    }
  }

  async getNetwork(): Promise<any> {
    try {
      return await this.provider.getNetwork();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get network', error);
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get gas price', error);
    }
  }

  async getFeeData(): Promise<any> {
    try {
      return await this.provider.getFeeData();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get fee data', error);
    }
  }

  async disconnect(): Promise<void> {
    // Cleanup any connections
  }
}
