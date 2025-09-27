import { PolygonConfig, PolygonAccount, PolygonTransaction, PolygonBlock, PolygonNetworkInfo } from './types';
import { PolygonError, PolygonNetworkError, PolygonRPCError, PolygonTransactionError, PolygonAccountError } from './errors';
import { PolygonLicenseManager } from './PolygonLicenseManager';
import { PolygonNFTManager } from './PolygonNFTManager';
import { PolygonDeFiManager } from './PolygonDeFiManager';
import { PolygonContractManager } from './PolygonContractManager';
import { PolygonTokenManager } from './PolygonTokenManager';
import { PolygonWalletManager } from './PolygonWalletManager';
import { validateAddress, formatAddress, parseUnits, formatUnits, retry } from './utils';

export class LicenseChainPolygon {
  private config: PolygonConfig;
  private licenseManager: PolygonLicenseManager;
  private nftManager: PolygonNFTManager;
  private defiManager: PolygonDeFiManager;
  private contractManager: PolygonContractManager;
  private tokenManager: PolygonTokenManager;
  private walletManager: PolygonWalletManager;

  constructor(config: PolygonConfig) {
    this.config = {
      baseUrl: 'https://api.licensechain.app',
      rpcUrl: 'https://polygon-rpc.com',
      timeout: 30000,
      retries: 3,
      ...config
    };
    
    this.licenseManager = new PolygonLicenseManager(this.config);
    this.nftManager = new PolygonNFTManager(this.config);
    this.defiManager = new PolygonDeFiManager(this.config);
    this.contractManager = new PolygonContractManager(this.config);
    this.tokenManager = new PolygonTokenManager(this.config);
    this.walletManager = new PolygonWalletManager(this.config);
  }

  // Account Management
  async getAccount(address: string): Promise<PolygonAccount> {
    try {
      const validatedAddress = formatAddress(address);
      
      const [balance, transactionCount, code] = await Promise.all([
        this.contractManager.getContractBalance(validatedAddress),
        this.contractManager.getTransactionCount(validatedAddress),
        this.contractManager.getContractCode(validatedAddress)
      ]);
      
      return {
        address: validatedAddress,
        balance: balance,
        transactionCount: transactionCount,
        isContract: code !== '0x'
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonAccountError('Failed to get account', address, error);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const validatedAddress = formatAddress(address);
      return await this.contractManager.getContractBalance(validatedAddress);
    } catch (error) {
      throw new PolygonAccountError('Failed to get balance', address, error);
    }
  }

  // Transaction Management
  async getTransaction(txHash: string): Promise<PolygonTransaction | null> {
    try {
      return await this.contractManager.getTransaction(txHash);
    } catch (error) {
      throw new PolygonTransactionError('Failed to get transaction', txHash, error);
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<PolygonTransaction> {
    try {
      return await this.contractManager.waitForTransaction(txHash, confirmations);
    } catch (error) {
      throw new PolygonTransactionError('Failed to wait for transaction', txHash, error);
    }
  }

  // Block Management
  async getBlock(blockNumber: number): Promise<PolygonBlock> {
    try {
      const block = await this.contractManager.getBlock(blockNumber);
      
      return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        transactions: block.transactions,
        size: block.size
      };
    } catch (error) {
      throw new PolygonError('Failed to get block', 'BLOCK_ERROR', error);
    }
  }

  async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.contractManager.getCurrentBlockNumber();
    } catch (error) {
      throw new PolygonError('Failed to get current block number', 'BLOCK_ERROR', error);
    }
  }

  // Network Information
  async getNetworkInfo(): Promise<PolygonNetworkInfo> {
    try {
      const network = await this.contractManager.getNetwork();
      const gasPrice = await this.contractManager.getGasPrice();
      
      return {
        name: 'Polygon',
        chainId: network.chainId,
        rpcUrl: this.config.rpcUrl!,
        explorerUrl: 'https://polygonscan.com',
        gasPrice: gasPrice,
        isTestnet: network.chainId !== 137
      };
    } catch (error) {
      throw new PolygonError('Failed to get network info', 'NETWORK_ERROR', error);
    }
  }

  // Contract Management
  async deployContract(bytecode: string, abi: any[], constructorArgs: any[] = [], gasLimit?: number) {
    return this.contractManager.deployContract(bytecode, abi, constructorArgs, gasLimit);
  }

  async getContract(address: string, abi: any[]) {
    return this.contractManager.getContract(address, abi);
  }

  async callContractMethod(contractAddress: string, abi: any[], methodName: string, args: any[] = []) {
    return this.contractManager.callContractMethod(contractAddress, abi, methodName, args);
  }

  async sendContractTransaction(contractAddress: string, abi: any[], methodName: string, args: any[] = [], options: any = {}) {
    return this.contractManager.sendContractTransaction(contractAddress, abi, methodName, args, options);
  }

  async getContractEvents(contractAddress: string, abi: any[], eventName: string, fromBlock?: number, toBlock?: number) {
    return this.contractManager.getContractEvents(contractAddress, abi, eventName, fromBlock, toBlock);
  }

  // Token Management
  async getTokenInfo(tokenAddress: string) {
    return this.tokenManager.getTokenInfo(tokenAddress);
  }

  async getTokenBalance(tokenAddress: string, ownerAddress: string) {
    return this.tokenManager.getTokenBalance(tokenAddress, ownerAddress);
  }

  async transferToken(tokenAddress: string, toAddress: string, amount: string, gasLimit?: number) {
    return this.tokenManager.transferToken(tokenAddress, toAddress, amount, gasLimit);
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string, gasLimit?: number) {
    return this.tokenManager.approveToken(tokenAddress, spenderAddress, amount, gasLimit);
  }

  async getTokenTransfers(tokenAddress: string, fromBlock?: number, toBlock?: number) {
    return this.tokenManager.getTokenTransfers(tokenAddress, fromBlock, toBlock);
  }

  // Wallet Management
  createWallet() {
    return this.walletManager.createWallet();
  }

  createWalletFromMnemonic(mnemonic: string, index: number = 0) {
    return this.walletManager.createWalletFromMnemonic(mnemonic, index);
  }

  createWalletFromPrivateKey(privateKey: string) {
    return this.walletManager.createWalletFromPrivateKey(privateKey);
  }

  async getWalletBalance(address: string) {
    return this.walletManager.getWalletBalance(address);
  }

  async sendTransaction(to: string, value: string, gasLimit?: number, gasPrice?: string) {
    return this.walletManager.sendTransaction(to, value, gasLimit, gasPrice);
  }

  async signMessage(message: string) {
    return this.walletManager.signMessage(message);
  }

  async verifyMessage(message: string, signature: string) {
    return this.walletManager.verifyMessage(message, signature);
  }

  // License Management (delegated to license manager)
  async createLicense(userId: string, productId: string, metadata?: Record<string, any>) {
    return this.licenseManager.createLicense(userId, productId, metadata);
  }

  async validateLicense(licenseKey: string) {
    return this.licenseManager.validateLicense(licenseKey);
  }

  async getLicense(licenseId: string) {
    return this.licenseManager.getLicense(licenseId);
  }

  async updateLicense(licenseId: string, updates: any) {
    return this.licenseManager.updateLicense(licenseId, updates);
  }

  async revokeLicense(licenseId: string) {
    return this.licenseManager.revokeLicense(licenseId);
  }

  // NFT Management (delegated to NFT manager)
  async createNFT(metadata: any, owner: string) {
    return this.nftManager.createNFT(metadata, owner);
  }

  async getNFT(tokenId: string) {
    return this.nftManager.getNFT(tokenId);
  }

  async transferNFT(tokenId: string, from: string, to: string) {
    return this.nftManager.transferNFT(tokenId, from, to);
  }

  // DeFi Management (delegated to DeFi manager)
  async getDeFiPositions(owner: string) {
    return this.defiManager.getPositions(owner);
  }

  async addLiquidity(poolAddress: string, amount: string, owner: string) {
    return this.defiManager.addLiquidity(poolAddress, amount, owner);
  }

  async removeLiquidity(poolAddress: string, amount: string, owner: string) {
    return this.defiManager.removeLiquidity(poolAddress, amount, owner);
  }

  // Utility Methods
  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new PolygonNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Ping failed', error);
    }
  }

  async health(): Promise<{ status: string; services: any }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new PolygonNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        services: data
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Health check failed', error);
    }
  }

  // Cleanup
  async disconnect(): Promise<void> {
    await Promise.all([
      this.licenseManager.disconnect(),
      this.nftManager.disconnect(),
      this.defiManager.disconnect(),
      this.contractManager.disconnect(),
      this.tokenManager.disconnect(),
      this.walletManager.disconnect()
    ]);
  }
}