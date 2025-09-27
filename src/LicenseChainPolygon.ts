import { PolygonConfig, PolygonTransaction } from './types';
import { PolygonError, NetworkError } from './errors';
import { PolygonLicenseManager } from './PolygonLicenseManager';
import { PolygonNFTManager } from './PolygonNFTManager';
import { PolygonDeFiManager } from './PolygonDeFiManager';

export class LicenseChainPolygon {
  private config: PolygonConfig;
  private licenseManager: PolygonLicenseManager;
  private nftManager: PolygonNFTManager;
  private deFiManager: PolygonDeFiManager;

  constructor(config: PolygonConfig) {
    this.config = config;
    this.licenseManager = new PolygonLicenseManager(config);
    this.nftManager = new PolygonNFTManager(config);
    this.deFiManager = new PolygonDeFiManager(config);
  }

  // License management methods
  async createLicense(productId: string, licenseType: string, metadata: Record<string, any>) {
    return this.licenseManager.createLicense(productId, licenseType, metadata);
  }

  async getLicense(licenseId: string) {
    return this.licenseManager.getLicense(licenseId);
  }

  async updateLicense(licenseId: string, updates: Partial<Record<string, any>>) {
    return this.licenseManager.updateLicense(licenseId, updates);
  }

  async revokeLicense(licenseId: string) {
    return this.licenseManager.revokeLicense(licenseId);
  }

  async getLicensesByOwner(ownerAddress: string) {
    return this.licenseManager.getLicensesByOwner(ownerAddress);
  }

  // NFT management methods
  async mintNFT(contractAddress: string, to: string, metadata: Record<string, any>) {
    return this.nftManager.mint(contractAddress, to, metadata);
  }

  async getNFT(tokenId: string, contractAddress: string) {
    return this.nftManager.getNFT(tokenId, contractAddress);
  }

  async transferNFT(contractAddress: string, tokenId: string, from: string, to: string) {
    return this.nftManager.transfer(contractAddress, tokenId, from, to);
  }

  async getNFTsByOwner(contractAddress: string, ownerAddress: string) {
    return this.nftManager.getNFTsByOwner(contractAddress, ownerAddress);
  }

  // DeFi methods
  async getPools() {
    return this.deFiManager.getPools();
  }

  async addLiquidity(tokenA: string, tokenB: string, amountA: string, amountB: string) {
    return this.deFiManager.addLiquidity(tokenA, tokenB, amountA, amountB);
  }

  async removeLiquidity(tokenA: string, tokenB: string, lpTokenAmount: string) {
    return this.deFiManager.removeLiquidity(tokenA, tokenB, lpTokenAmount);
  }

  async swap(tokenIn: string, tokenOut: string, amountIn: string, amountOutMin: string) {
    return this.deFiManager.swap(tokenIn, tokenOut, amountIn, amountOutMin);
  }

  // Utility methods
  async getTransactionStatus(hash: string): Promise<PolygonTransaction> {
    try {
      // Implementation would depend on Polygon-specific RPC calls
      throw new Error('Not implemented');
    } catch (error) {
      throw new NetworkError(`Failed to get transaction status: ${error.message}`);
    }
  }

  async waitForTransaction(hash: string, confirmations: number = 1): Promise<PolygonTransaction> {
    try {
      // Implementation would depend on Polygon-specific RPC calls
      throw new Error('Not implemented');
    } catch (error) {
      throw new NetworkError(`Failed to wait for transaction: ${error.message}`);
    }
  }

  getConfig(): PolygonConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PolygonConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Update all managers with new config
    this.licenseManager.updateConfig(this.config);
    this.nftManager.updateConfig(this.config);
    this.deFiManager.updateConfig(this.config);
  }
}
