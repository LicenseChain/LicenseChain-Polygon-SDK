import { ethers } from 'ethers';

export function validateAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

export function validatePrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

export function validateTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

export function validateBlockNumber(blockNumber: string | number): boolean {
  const num = typeof blockNumber === 'string' ? parseInt(blockNumber) : blockNumber;
  return Number.isInteger(num) && num >= 0;
}

export function formatAddress(address: string): string {
  return ethers.utils.getAddress(address);
}

export function formatTxHash(txHash: string): string {
  return txHash.toLowerCase();
}

export function parseUnits(value: string, decimals: number = 18): string {
  return ethers.utils.parseUnits(value, decimals).toString();
}

export function formatUnits(value: string | number, decimals: number = 18): string {
  return ethers.utils.formatUnits(value, decimals);
}

export function toWei(value: string): string {
  return ethers.utils.parseEther(value).toString();
}

export function fromWei(value: string | number): string {
  return ethers.utils.formatEther(value);
}

export function keccak256(data: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
}

export function sha256(data: string): string {
  return ethers.utils.sha256(ethers.utils.toUtf8Bytes(data));
}

export function toUtf8String(hex: string): string {
  return ethers.utils.toUtf8String(hex);
}

export function toUtf8Bytes(str: string): string {
  return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(str));
}

export function hexlify(data: string | number): string {
  return ethers.utils.hexlify(data);
}

export function hexZeroPad(value: string, length: number): string {
  return ethers.utils.hexZeroPad(value, length);
}

export function isHexString(value: string): boolean {
  return ethers.utils.isHexString(value);
}

export function stripZeros(value: string): string {
  return ethers.utils.stripZeros(value);
}

export function getContractAddress(tx: { from: string; nonce: number }): string {
  return ethers.utils.getContractAddress(tx);
}

export function getCreate2Address(
  from: string,
  salt: string,
  initCodeHash: string
): string {
  return ethers.utils.getCreate2Address(from, salt, initCodeHash);
}

export function computeAddress(publicKey: string): string {
  return ethers.utils.computeAddress(publicKey);
}

export function recoverAddress(digest: string, signature: string): string {
  return ethers.utils.recoverAddress(digest, signature);
}

export function verifyMessage(message: string, signature: string): string {
  return ethers.utils.verifyMessage(message, signature);
}

export function id(text: string): string {
  return ethers.utils.id(text);
}

export function namehash(name: string): string {
  return ethers.utils.namehash(name);
}

export function isValidName(name: string): boolean {
  return ethers.utils.isValidName(name);
}

export function parseEther(value: string): string {
  return ethers.utils.parseEther(value).toString();
}

export function formatEther(value: string | number): string {
  return ethers.utils.formatEther(value);
}

export function parseGwei(value: string): string {
  return ethers.utils.parseUnits(value, 'gwei').toString();
}

export function formatGwei(value: string | number): string {
  return ethers.utils.formatUnits(value, 'gwei');
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          reject(error);
        } else {
          setTimeout(attempt, delay * Math.pow(2, attempts - 1));
        }
      }
    };
    
    attempt();
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
}

export function truncateAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function truncateHash(hash: string, startLength: number = 10, endLength: number = 6): string {
  if (hash.length <= startLength + endLength) {
    return hash;
  }
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function generateRandomBytes(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return ethers.utils.hexlify(bytes);
}

export function generateRandomAddress(): string {
  const privateKey = generateRandomBytes(32);
  return new ethers.Wallet(privateKey).address;
}

export function calculateGasPrice(gasPrice: string, gasLimit: string): string {
  const price = BigInt(gasPrice);
  const limit = BigInt(gasLimit);
  return (price * limit).toString();
}

export function calculateGasCost(gasUsed: string, gasPrice: string): string {
  const used = BigInt(gasUsed);
  const price = BigInt(gasPrice);
  return (used * price).toString();
}

export function formatTokenAmount(amount: string, decimals: number, symbol: string = ''): string {
  const formatted = formatUnits(amount, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function parseTokenAmount(amount: string, decimals: number): string {
  return parseUnits(amount, decimals);
}

export function isContractAddress(address: string, provider: ethers.providers.Provider): Promise<boolean> {
  return provider.getCode(address).then(code => code !== '0x');
}

export function getBlockExplorerUrl(txHash: string, network: string = 'polygon'): string {
  const explorers: { [key: string]: string } = {
    polygon: 'https://polygonscan.com/tx/',
    mumbai: 'https://mumbai.polygonscan.com/tx/',
    mainnet: 'https://polygonscan.com/tx/',
    testnet: 'https://mumbai.polygonscan.com/tx/'
  };
  
  const baseUrl = explorers[network.toLowerCase()] || explorers.polygon;
  return `${baseUrl}${txHash}`;
}

export function getAddressExplorerUrl(address: string, network: string = 'polygon'): string {
  const explorers: { [key: string]: string } = {
    polygon: 'https://polygonscan.com/address/',
    mumbai: 'https://mumbai.polygonscan.com/address/',
    mainnet: 'https://polygonscan.com/address/',
    testnet: 'https://mumbai.polygonscan.com/address/'
  };
  
  const baseUrl = explorers[network.toLowerCase()] || explorers.polygon;
  return `${baseUrl}${address}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLicenseKey(licenseKey: string): boolean {
  return licenseKey.length === 32 && /^[A-Z0-9]+$/.test(licenseKey);
}

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createWebhookSignature(payload: string, secret: string): string {
  return ethers.utils.sha256(ethers.utils.toUtf8Bytes(payload + secret));
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createWebhookSignature(payload, secret);
  return signature === expectedSignature;
}

export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
