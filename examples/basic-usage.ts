import { LicenseChainPolygon } from '@licensechain/polygon-sdk';

/**
 * Basic usage example for LicenseChain Polygon SDK
 */
async function basicUsageExample() {
  // Initialize the SDK
  const licenseChain = new LicenseChainPolygon({
    network: 'mumbai', // Use testnet for development
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.POLYGON_RPC_URL
  });

  try {
    // Deploy a license contract
    console.log('Deploying license contract on Polygon...');
    const contract = await licenseChain.deployLicenseContract({
      name: 'My Software License',
      symbol: 'MSL',
      baseURI: 'https://api.myapp.com/licenses/',
      maxSupply: 10000,
      royaltyRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      royaltyFee: 250 // 2.5%
    });

    console.log('Contract deployed at:', contract.getAddress());

    // Mint a license (ultra-low fees on Polygon)
    console.log('Minting license...');
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

    console.log('License minted:', license);
    console.log('Gas used:', license.gasUsed); // Very low on Polygon

    // Verify the license
    console.log('Verifying license...');
    const isValid = await contract.verifyLicense(1);
    console.log('License valid:', isValid);

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Bridge example - Bridge license from Ethereum to Polygon
 */
async function bridgeExample() {
  const licenseChain = new LicenseChainPolygon({
    network: 'mainnet',
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.POLYGON_RPC_URL,
    bridgeEnabled: true
  });

  try {
    // Bridge license from Ethereum to Polygon
    const bridgeResult = await licenseChain.bridgeFromEthereum(
      '0x...', // Ethereum contract address
      '0x...'  // Polygon contract address
    );

    console.log('Bridge transaction:', bridgeResult.txHash);
    console.log('Bridge status:', bridgeResult.status);

  } catch (error) {
    console.error('Bridge error:', error);
  }
}

/**
 * Batch minting example - Efficient on Polygon
 */
async function batchMintingExample() {
  const licenseChain = new LicenseChainPolygon({
    network: 'mumbai',
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.POLYGON_RPC_URL
  });

  try {
    const contract = await licenseChain.deployLicenseContract({
      name: 'Batch License Contract',
      symbol: 'BLC',
      baseURI: 'https://api.myapp.com/licenses/',
      maxSupply: 1000
    });

    // Batch mint multiple licenses (very cost-effective on Polygon)
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

    console.log('Batch minting completed:', licenses);
    console.log('Total gas used:', licenses.gasUsed);

  } catch (error) {
    console.error('Batch minting error:', error);
  }
}

/**
 * Gas estimation example - Show low costs on Polygon
 */
async function gasEstimationExample() {
  const licenseChain = new LicenseChainPolygon({
    network: 'mumbai',
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: process.env.POLYGON_RPC_URL
  });

  try {
    const contract = await licenseChain.deployLicenseContract({
      name: 'Gas Estimation License',
      symbol: 'GEL',
      baseURI: 'https://api.myapp.com/licenses/',
      maxSupply: 1000
    });

    // Estimate gas for minting (very low on Polygon)
    const gasEstimate = await contract.estimateGasMintLicense({
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenId: 1,
      metadata: {
        software: 'MyApp',
        version: '1.0.0',
        features: ['basic']
      }
    });

    console.log('Gas estimate:', gasEstimate);
    console.log('Total cost (MATIC):', gasEstimate.totalCost);

    // Get current MATIC price
    const maticPrice = await licenseChain.getMaticPrice();
    console.log('MATIC price (USD):', maticPrice);

  } catch (error) {
    console.error('Gas estimation error:', error);
  }
}

// Run examples
if (require.main === module) {
  basicUsageExample()
    .then(() => console.log('Basic usage example completed'))
    .catch(console.error);
}

export {
  basicUsageExample,
  bridgeExample,
  batchMintingExample,
  gasEstimationExample
};
