# 🔷 LicenseChain Polygon SDK

[![npm version](https://badge.fury.io/js/@licensechain%2Fpolygon-sdk.svg)](https://badge.fury.io/js/@licensechain%2Fpolygon-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **High-performance Layer 2 integration for LicenseChain** - Deploy, manage, and verify software licenses on Polygon with ultra-low fees and fast transactions.

## 🌟 Features

### ⚡ **Layer 2 Performance**
- **Ultra-Low Fees** - 99%+ cheaper than Ethereum mainnet
- **Fast Transactions** - 2-3 second confirmation times
- **High Throughput** - 7,000+ transactions per second
- **EVM Compatibility** - Full Ethereum compatibility

### 🔐 **Advanced Licensing**
- **Smart Contract Licenses** - Deploy license contracts on Polygon
- **NFT Licenses** - Create license tokens as NFTs
- **Batch Operations** - Efficient batch minting and transfers
- **Gas Optimization** - Optimized for Polygon's low fees

### 🌐 **Ecosystem Integration**
- **Polygon Bridge** - Seamless Ethereum ↔ Polygon transfers
- **QuickSwap Integration** - DEX integration for license trading
- **Aave Integration** - DeFi lending for license collateral
- **Chainlink Integration** - Oracle price feeds

### 🔒 **Security Features**
- **Multi-signature Support** - Require multiple signatures
- **Role-based Access** - Granular permission management
- **Upgradeable Contracts** - Proxy pattern implementation
- **Emergency Pause** - Circuit breaker functionality

## 🚀 Quick Start

### Installation

```bash
npm install @licensechain/polygon-sdk
# or
yarn add @licensechain/polygon-sdk
# or
pnpm add @licensechain/polygon-sdk
```

### Basic Usage

```typescript
import { LicenseChainPolygon } from '@licensechain/polygon-sdk';

// Initialize the SDK
const licenseChain = new LicenseChainPolygon({
  network: 'mainnet', // or 'mumbai' for testnet
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.POLYGON_RPC_URL
});

// Deploy a license contract
const contract = await licenseChain.deployLicenseContract({
  name: 'My Software License',
  symbol: 'MSL',
  baseURI: 'https://api.myapp.com/licenses/',
  maxSupply: 10000,
  royaltyRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  royaltyFee: 250 // 2.5%
});

// Mint a license
const license = await contract.mintLicense({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  tokenId: 1,
  metadata: {
    software: 'MyApp Pro',
    version: '2.0.0',
    features: ['premium', 'unlimited'],
    expiresAt: 1735689600
  }
});

// Verify a license
const isValid = await contract.verifyLicense(1);
console.log('License valid:', isValid);
```

## 📚 API Reference

### LicenseChainPolygon

#### Constructor Options

```typescript
interface PolygonConfig {
  network: 'mainnet' | 'mumbai';
  privateKey?: string;
  walletProvider?: any;
  rpcUrl?: string;
  gasPrice?: string;
  gasLimit?: number;
  confirmations?: number;
  bridgeEnabled?: boolean;
}

const licenseChain = new LicenseChainPolygon({
  network: 'mainnet',
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
  bridgeEnabled: true
});
```

#### Methods

##### `deployLicenseContract(options)`
Deploy a new license contract on Polygon.

```typescript
interface DeployOptions {
  name: string;
  symbol: string;
  baseURI: string;
  maxSupply?: number;
  royaltyRecipient?: string;
  royaltyFee?: number;
  bridgeToEthereum?: boolean;
}

const contract = await licenseChain.deployLicenseContract({
  name: 'My Software License',
  symbol: 'MSL',
  baseURI: 'https://api.myapp.com/licenses/',
  maxSupply: 10000,
  royaltyRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  royaltyFee: 250,
  bridgeToEthereum: true
});
```

##### `bridgeFromEthereum(ethereumContract, polygonContract)`
Bridge a license contract from Ethereum to Polygon.

```typescript
const bridgeResult = await licenseChain.bridgeFromEthereum(
  '0x...', // Ethereum contract address
  '0x...'  // Polygon contract address
);
```

##### `bridgeToEthereum(polygonContract, ethereumContract)`
Bridge a license contract from Polygon to Ethereum.

```typescript
const bridgeResult = await licenseChain.bridgeToEthereum(
  '0x...', // Polygon contract address
  '0x...'  // Ethereum contract address
);
```

### LicenseContract

#### Methods

##### `mintLicense(options)`
Mint a new license with ultra-low fees.

```typescript
const license = await contract.mintLicense({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  tokenId: 1,
  metadata: {
    software: 'MyApp Pro',
    version: '2.0.0',
    features: ['premium', 'unlimited'],
    expiresAt: 1735689600
  }
});
```

##### `batchMintLicenses(licenses)`
Mint multiple licenses in a single transaction.

```typescript
const licenses = await contract.batchMintLicenses([
  {
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    tokenId: 1,
    metadata: { software: 'MyApp Basic', version: '1.0.0', features: ['basic'] }
  },
  {
    to: '0x8ba1f109551bD432803012645Hac136c4c8c4c8c',
    tokenId: 2,
    metadata: { software: 'MyApp Pro', version: '2.0.0', features: ['premium', 'unlimited'] }
  }
]);
```

##### `estimateGasMintLicense(options)`
Estimate gas cost for minting (typically very low on Polygon).

```typescript
const gasEstimate = await contract.estimateGasMintLicense({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  tokenId: 1,
  metadata: { software: 'MyApp', version: '1.0.0', features: ['basic'] }
});

console.log('Gas cost:', gasEstimate.totalCost); // Usually < $0.01
```

## 🔧 Advanced Features

### Polygon Bridge Integration

```typescript
// Bridge license from Ethereum to Polygon
const bridgeResult = await licenseChain.bridgeLicense({
  fromChain: 'ethereum',
  toChain: 'polygon',
  contractAddress: '0x...',
  tokenId: 1,
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
});

// Monitor bridge status
const status = await licenseChain.getBridgeStatus(bridgeResult.txHash);
```

### QuickSwap Integration

```typescript
// List license for trading on QuickSwap
const listing = await contract.listOnQuickSwap({
  tokenId: 1,
  price: '0.1', // MATIC
  duration: 7 // days
});

// Buy license from QuickSwap
const purchase = await contract.buyFromQuickSwap({
  tokenId: 1,
  price: '0.1'
});
```

### Aave Integration

```typescript
// Use license as collateral for lending
const collateralResult = await contract.useAsCollateral({
  tokenId: 1,
  lendingPool: '0x...', // Aave lending pool
  amount: '100' // USDC
});

// Borrow against license
const borrowResult = await contract.borrowAgainstLicense({
  tokenId: 1,
  asset: 'USDC',
  amount: '50'
});
```

### Chainlink Integration

```typescript
// Get real-time MATIC price
const maticPrice = await licenseChain.getMaticPrice();

// Get real-time ETH price
const ethPrice = await licenseChain.getEthPrice();

// Convert license price to USD
const licensePriceUSD = await licenseChain.convertToUSD('0.1', 'MATIC');
```

## 🌐 Network Configuration

### Supported Networks

| Network | Chain ID | RPC URL | Explorer | Bridge |
|---------|----------|---------|----------|--------|
| Polygon Mainnet | 137 | https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY | https://polygonscan.com | ✅ |
| Mumbai Testnet | 80001 | https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY | https://mumbai.polygonscan.com | ✅ |

### Custom Network

```typescript
const licenseChain = new LicenseChainPolygon({
  network: 'custom',
  rpcUrl: 'https://your-custom-rpc.com',
  chainId: 12345,
  bridgeEnabled: false
});
```

## 🔒 Security Best Practices

### Private Key Management

```typescript
// Use environment variables
const licenseChain = new LicenseChainPolygon({
  network: 'mainnet',
  privateKey: process.env.PRIVATE_KEY
});

// Use wallet provider
const licenseChain = new LicenseChainPolygon({
  network: 'mainnet',
  walletProvider: window.ethereum
});
```

### Gas Optimization

```typescript
// Set optimal gas price for Polygon
const licenseChain = new LicenseChainPolygon({
  network: 'mainnet',
  privateKey: process.env.PRIVATE_KEY,
  gasPrice: '30' // gwei (Polygon optimal)
});

// Use gas estimation
const gasEstimate = await contract.estimateGasMintLicense(options);
```

## 📊 Error Handling

```typescript
import { LicenseChainError, ErrorCodes } from '@licensechain/polygon-sdk';

try {
  const license = await contract.mintLicense(options);
} catch (error) {
  if (error instanceof LicenseChainError) {
    switch (error.code) {
      case ErrorCodes.INSUFFICIENT_FUNDS:
        console.error('Insufficient MATIC for gas');
        break;
      case ErrorCodes.BRIDGE_FAILED:
        console.error('Bridge operation failed:', error.details);
        break;
      case ErrorCodes.CONTRACT_NOT_DEPLOYED:
        console.error('Contract not deployed on Polygon');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## 🧪 Testing

```typescript
import { LicenseChainPolygon } from '@licensechain/polygon-sdk';

describe('LicenseChain Polygon SDK', () => {
  let licenseChain: LicenseChainPolygon;
  let contract: LicenseContract;

  beforeEach(async () => {
    licenseChain = new LicenseChainPolygon({
      network: 'mumbai',
      privateKey: process.env.TEST_PRIVATE_KEY
    });

    contract = await licenseChain.deployLicenseContract({
      name: 'Test License',
      symbol: 'TL',
      baseURI: 'https://test.com/'
    });
  });

  it('should mint a license with low fees', async () => {
    const license = await contract.mintLicense({
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenId: 1,
      metadata: { software: 'Test App', version: '1.0.0', features: ['basic'] }
    });

    expect(license.tokenId).toBe(1);
    expect(license.gasUsed).toBeLessThan('100000'); // Very low gas usage
  });
});
```

## 📦 Package Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "deploy:mumbai": "ts-node scripts/deploy-mumbai.ts",
    "deploy:mainnet": "ts-node scripts/deploy-mainnet.ts",
    "bridge:ethereum": "ts-node scripts/bridge-ethereum.ts"
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/LicenseChain/LicenseChain-Polygon-SDK.git
cd LicenseChain-Polygon-SDK
npm install
npm run build
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://docs.licensechain.app/polygon-sdk)
- [GitHub Repository](https://github.com/LicenseChain/LicenseChain-Polygon-SDK)
- [NPM Package](https://www.npmjs.com/package/@licensechain/polygon-sdk)
- [Discord Community](https://discord.gg/licensechain)
- [Twitter](https://twitter.com/licensechain)

## 🆘 Support

- 📧 Email: support@licensechain.app
- 💬 Discord: [LicenseChain Community](https://discord.gg/licensechain)
- 📖 Documentation: [docs.licensechain.app](https://docs.licensechain.app)
- 🐛 Issues: [GitHub Issues](https://github.com/LicenseChain/LicenseChain-Polygon-SDK/issues)

---

**Built with ❤️ by the LicenseChain Team**
