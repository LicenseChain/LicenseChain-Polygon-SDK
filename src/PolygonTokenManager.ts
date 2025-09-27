import { ethers } from 'ethers';
import { PolygonConfig, PolygonToken, PolygonTokenTransfer } from './types';
import { PolygonError, PolygonNetworkError, PolygonRPCError } from './errors';
import { validateAddress, parseUnits, formatUnits, retry } from './utils';

export class PolygonTokenManager {
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

  async getTokenInfo(tokenAddress: string): Promise<PolygonToken> {
    try {
      const validatedAddress = validateAddress(tokenAddress);
      if (!validatedAddress) {
        throw new PolygonError('Invalid token address', 'INVALID_ADDRESS');
      }

      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)',
          'function balanceOf(address) view returns (uint256)',
          'function allowance(address,address) view returns (uint256)'
        ],
        this.provider
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        type: 'ERC20'
      };
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to get token info', error);
    }
  }

  async getTokenBalance(tokenAddress: string, ownerAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );

      const balance = await contract.balanceOf(ownerAddress);
      return balance.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token balance', error);
    }
  }

  async getTokenAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function allowance(address,address) view returns (uint256)'],
        this.provider
      );

      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      return allowance.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token allowance', error);
    }
  }

  async transferToken(
    tokenAddress: string,
    toAddress: string,
    amount: string,
    gasLimit?: number
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new PolygonError('Signer required for token transfer', 'SIGNER_REQUIRED');
      }

      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function transfer(address,uint256) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        this.signer
      );

      const decimals = await contract.decimals();
      const transferAmount = parseUnits(amount, decimals);

      const tx = await retry(async () => {
        return await contract.transfer(toAddress, transferAmount, {
          gasLimit: gasLimit
        });
      });

      return tx.hash;
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to transfer token', error);
    }
  }

  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    gasLimit?: number
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new PolygonError('Signer required for token approval', 'SIGNER_REQUIRED');
      }

      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function approve(address,uint256) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        this.signer
      );

      const decimals = await contract.decimals();
      const approveAmount = parseUnits(amount, decimals);

      const tx = await retry(async () => {
        return await contract.approve(spenderAddress, approveAmount, {
          gasLimit: gasLimit
        });
      });

      return tx.hash;
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to approve token', error);
    }
  }

  async transferFromToken(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: string,
    gasLimit?: number
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new PolygonError('Signer required for transferFrom', 'SIGNER_REQUIRED');
      }

      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function transferFrom(address,address,uint256) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        this.signer
      );

      const decimals = await contract.decimals();
      const transferAmount = parseUnits(amount, decimals);

      const tx = await retry(async () => {
        return await contract.transferFrom(fromAddress, toAddress, transferAmount, {
          gasLimit: gasLimit
        });
      });

      return tx.hash;
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonNetworkError('Failed to transferFrom token', error);
    }
  }

  async getTokenTransfers(
    tokenAddress: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<PolygonTokenTransfer[]> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['event Transfer(address indexed from, address indexed to, uint256 value)'],
        this.provider
      );

      const filter = contract.filters.Transfer();
      const events = await contract.queryFilter(filter, fromBlock, toBlock);

      return events.map(event => ({
        from: event.args.from,
        to: event.args.to,
        value: event.args.value.toString(),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      }));
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token transfers', error);
    }
  }

  async getTokenTransfersByAddress(
    tokenAddress: string,
    address: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<PolygonTokenTransfer[]> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['event Transfer(address indexed from, address indexed to, uint256 value)'],
        this.provider
      );

      const filter = contract.filters.Transfer(address, address);
      const events = await contract.queryFilter(filter, fromBlock, toBlock);

      return events.map(event => ({
        from: event.args.from,
        to: event.args.to,
        value: event.args.value.toString(),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      }));
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token transfers by address', error);
    }
  }

  async getTokenHolders(
    tokenAddress: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<{ [address: string]: string }> {
    try {
      const transfers = await this.getTokenTransfers(tokenAddress, fromBlock, toBlock);
      const balances: { [address: string]: bigint } = {};

      for (const transfer of transfers) {
        const value = BigInt(transfer.value);
        
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
          balances[transfer.from] = (balances[transfer.from] || 0n) - value;
        }
        
        if (transfer.to !== '0x0000000000000000000000000000000000000000') {
          balances[transfer.to] = (balances[transfer.to] || 0n) + value;
        }
      }

      const result: { [address: string]: string } = {};
      for (const [address, balance] of Object.entries(balances)) {
        if (balance > 0n) {
          result[address] = balance.toString();
        }
      }

      return result;
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token holders', error);
    }
  }

  async getTokenSupply(tokenAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function totalSupply() view returns (uint256)'],
        this.provider
      );

      const totalSupply = await contract.totalSupply();
      return totalSupply.toString();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token supply', error);
    }
  }

  async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function decimals() view returns (uint8)'],
        this.provider
      );

      const decimals = await contract.decimals();
      return Number(decimals);
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token decimals', error);
    }
  }

  async formatTokenAmount(tokenAddress: string, amount: string): Promise<string> {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      return formatUnits(amount, decimals);
    } catch (error) {
      throw new PolygonNetworkError('Failed to format token amount', error);
    }
  }

  async parseTokenAmount(tokenAddress: string, amount: string): Promise<string> {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      return parseUnits(amount, decimals);
    } catch (error) {
      throw new PolygonNetworkError('Failed to parse token amount', error);
    }
  }

  async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function symbol() view returns (string)'],
        this.provider
      );

      return await contract.symbol();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token symbol', error);
    }
  }

  async getTokenName(tokenAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function name() view returns (string)'],
        this.provider
      );

      return await contract.name();
    } catch (error) {
      throw new PolygonNetworkError('Failed to get token name', error);
    }
  }

  async disconnect(): Promise<void> {
    // Cleanup any connections
  }
}
