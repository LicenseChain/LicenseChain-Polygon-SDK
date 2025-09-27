import { ethers } from 'ethers';
import { PolygonConfig, PolygonWallet, PolygonTransaction } from './types';
import { PolygonError, PolygonNetworkError, PolygonRPCError } from './errors';
import { validateAddress, validatePrivateKey, retry } from './utils';

export class PolygonWalletManager {
  private config: PolygonConfig;
  private provider: ethers.providers.Provider;
  private wallet?: ethers.Wallet;

  constructor(config: PolygonConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  createWallet(): PolygonWallet {
    try {
      const wallet = ethers.Wallet.createRandom();
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        publicKey: wallet.publicKey,
        index: 0
      };
    } catch (error) {
      throw new PolygonError('Failed to create wallet', 'WALLET_CREATION_FAILED', error);
    }
  }

  createWalletFromMnemonic(mnemonic: string, index: number = 0): PolygonWallet {
    try {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        publicKey: wallet.publicKey,
        index: index
      };
    } catch (error) {
      throw new PolygonError('Failed to create wallet from mnemonic', 'WALLET_CREATION_FAILED', error);
    }
  }

  createWalletFromPrivateKey(privateKey: string): PolygonWallet {
    try {
      const validatedKey = validatePrivateKey(privateKey);
      if (!validatedKey) {
        throw new PolygonError('Invalid private key', 'INVALID_PRIVATE_KEY');
      }

      const wallet = new ethers.Wallet(privateKey);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: '', // Not available from private key
        publicKey: wallet.publicKey,
        index: 0
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonError('Failed to create wallet from private key', 'WALLET_CREATION_FAILED', error);
    }
  }

  async getWalletBalance(address: string): Promise<string> {
    try {
      const validatedAddress = validateAddress(address);
      if (!validatedAddress) {
        throw new PolygonError('Invalid address', 'INVALID_ADDRESS');
      }

      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to get wallet balance', error);
    }
  }

  async getWalletTransactionCount(address: string): Promise<number> {
    try {
      const validatedAddress = validateAddress(address);
      if (!validatedAddress) {
        throw new PolygonError('Invalid address', 'INVALID_ADDRESS');
      }

      return await this.provider.getTransactionCount(address);
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to get transaction count', error);
    }
  }

  async sendTransaction(
    to: string,
    value: string,
    gasLimit?: number,
    gasPrice?: string
  ): Promise<PolygonTransaction> {
    try {
      if (!this.wallet) {
        throw new PolygonError('Wallet not initialized', 'WALLET_NOT_INITIALIZED');
      }

      const validatedTo = validateAddress(to);
      if (!validatedTo) {
        throw new PolygonError('Invalid recipient address', 'INVALID_ADDRESS');
      }

      const tx = await retry(async () => {
        const txRequest = {
          to,
          value: ethers.utils.parseEther(value),
          gasLimit: gasLimit,
          gasPrice: gasPrice ? ethers.utils.parseUnits(gasPrice, 'gwei') : undefined
        };

        return await this.wallet!.sendTransaction(txRequest);
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
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
      throw new PolygonNetworkError('Failed to send transaction', error);
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      if (!this.wallet) {
        throw new PolygonError('Wallet not initialized', 'WALLET_NOT_INITIALIZED');
      }

      return await this.wallet.signMessage(message);
    } catch (error) {
      throw new PolygonError('Failed to sign message', 'SIGNING_FAILED', error);
    }
  }

  async signTransaction(transaction: any): Promise<string> {
    try {
      if (!this.wallet) {
        throw new PolygonError('Wallet not initialized', 'WALLET_NOT_INITIALIZED');
      }

      return await this.wallet.signTransaction(transaction);
    } catch (error) {
      throw new PolygonError('Failed to sign transaction', 'SIGNING_FAILED', error);
    }
  }

  async verifyMessage(message: string, signature: string): Promise<string> {
    try {
      return ethers.utils.verifyMessage(message, signature);
    } catch (error) {
      throw new PolygonError('Failed to verify message', 'VERIFICATION_FAILED', error);
    }
  }

  async getWalletInfo(address: string): Promise<{
    address: string;
    balance: string;
    transactionCount: number;
    isContract: boolean;
  }> {
    try {
      const validatedAddress = validateAddress(address);
      if (!validatedAddress) {
        throw new PolygonError('Invalid address', 'INVALID_ADDRESS');
      }

      const [balance, transactionCount, code] = await Promise.all([
        this.getWalletBalance(address),
        this.getWalletTransactionCount(address),
        this.provider.getCode(address)
      ]);

      return {
        address,
        balance,
        transactionCount,
        isContract: code !== '0x'
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to get wallet info', error);
    }
  }

  async estimateGas(
    to: string,
    value?: string,
    data?: string
  ): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: value ? ethers.utils.parseEther(value) : undefined,
        data
      });

      return gasEstimate.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to estimate gas', error);
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

  async getFeeData(): Promise<{
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      
      return {
        gasPrice: feeData.gasPrice?.toString() || '0',
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      };
    } catch (error) {
      throw new PolygonNetworkError('Failed to get fee data', error);
    }
  }

  async getCurrentWallet(): Promise<PolygonWallet | null> {
    if (!this.wallet) {
      return null;
    }

    return {
      address: this.wallet.address,
      privateKey: this.wallet.privateKey,
      mnemonic: '', // Not available from existing wallet
      publicKey: this.wallet.publicKey,
      index: 0
    };
  }

  async setWallet(privateKey: string): Promise<void> {
    try {
      const validatedKey = validatePrivateKey(privateKey);
      if (!validatedKey) {
        throw new PolygonError('Invalid private key', 'INVALID_PRIVATE_KEY');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonError('Failed to set wallet', 'WALLET_SET_FAILED', error);
    }
  }

  async disconnect(): Promise<void> {
    this.wallet = undefined;
  }
}
