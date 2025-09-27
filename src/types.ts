export interface PolygonConfig {
  rpcUrl: string;
  privateKey?: string;
  networkId: number;
  gasPrice?: string;
  gasLimit?: number;
}

export interface PolygonTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  timestamp: number;
}

export interface PolygonLicense {
  id: string;
  owner: string;
  productId: string;
  licenseType: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: number;
  expiresAt?: number;
  metadata: Record<string, any>;
}

export interface PolygonNFT {
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  royalty: {
    recipient: string;
    percentage: number;
  };
}

export interface PolygonDeFiPool {
  address: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  fee: number;
}

export interface PolygonError extends Error {
  code: string;
  data?: any;
}
