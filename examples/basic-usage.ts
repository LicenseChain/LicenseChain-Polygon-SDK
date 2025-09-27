import { LicenseChainPolygon } from '../src/LicenseChainPolygon';
import { PolygonConfig } from '../src/types';

// Example configuration
const config: PolygonConfig = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.licensechain.app',
  rpcUrl: 'https://polygon-rpc.com',
  timeout: 30000,
  retries: 3,
  privateKey: 'your-private-key-here' // Optional
};

// Initialize the SDK
const polygon = new LicenseChainPolygon(config);

async function basicUsageExample() {
  try {
    console.log('🚀 LicenseChain Polygon SDK - Basic Usage Example\n');

    // 1. Account Management
    console.log('📊 Account Management:');
    const address = '0x742d35Cc6634C0532925a3b8D0C0E4C8C8C8C8C8';
    
    // Get account information
    const account = await polygon.getAccount(address);
    console.log('Account Info:', account);
    
    // Get account balance
    const balance = await polygon.getBalance(address);
    console.log('Balance (MATIC):', balance);
    
    // Get current block number
    const blockNumber = await polygon.getCurrentBlockNumber();
    console.log('Current Block Number:', blockNumber);

    // 2. License Management
    console.log('\n🔑 License Management:');
    
    // Create a license
    const license = await polygon.createLicense('user123', 'product456', {
      platform: 'polygon',
      features: ['nft_minting', 'defi_trading']
    });
    console.log('Created License:', license);
    
    // Validate a license
    const isValid = await polygon.validateLicense(license.licenseKey);
    console.log('License Valid:', isValid);
    
    // Get license details
    const licenseDetails = await polygon.getLicense(license.id);
    console.log('License Details:', licenseDetails);

    // 3. NFT Management
    console.log('\n🎨 NFT Management:');
    
    // Create an NFT
    const nft = await polygon.createNFT({
      name: 'My Polygon NFT',
      symbol: 'MPN',
      description: 'A sample NFT created with LicenseChain',
      image: 'https://example.com/image.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Common' },
        { trait_type: 'Color', value: 'Blue' }
      ]
    }, address);
    console.log('Created NFT:', nft);
    
    // Get NFT details
    const nftDetails = await polygon.getNFT(nft.tokenId);
    console.log('NFT Details:', nftDetails);
    
    // Transfer NFT
    const transferTx = await polygon.transferNFT(nft.tokenId, address, '0xRecipientAddress');
    console.log('NFT Transfer Transaction:', transferTx);

    // 4. DeFi Management
    console.log('\n💰 DeFi Management:');
    
    // Get DeFi positions
    const positions = await polygon.getDeFiPositions(address);
    console.log('DeFi Positions:', positions);
    
    // Add liquidity to a pool
    const poolAddress = '0xPoolAddressHere';
    const liquidityTx = await polygon.addLiquidity(poolAddress, '1000000', address);
    console.log('Liquidity Transaction:', liquidityTx);

    // 5. Contract Management
    console.log('\n📝 Contract Management:');
    
    // Deploy a simple contract
    const bytecode = '0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063f2c9ecd814610057575b600080fd5b610055600480360381019061005091906100a3565b610075565b005b61005f61007f565b60405161006c91906100df565b60405180910390f35b8060008190555050565b60008054905090565b60008135905061009881610131565b92915050565b6000602082840312156100b4576100b361012c565b5b60006100c284828501610089565b91505092915050565b6100d481610122565b82525050565b60006020820190506100ef60008301846100cb565b92915050565b600061010082610122565b9050919050565b61011081610122565b811461011b57600080fd5b50565b60008135905061012d81610107565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061017a57607f821691505b6020821081141561018e5761018d610133565b5b5091905056fea2646970667358221220...';
    const abi = [
      {
        "inputs": [],
        "name": "getValue",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_value", "type": "uint256"}],
        "name": "setValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    const contract = await polygon.deployContract(bytecode, abi);
    console.log('Deployed Contract:', contract);
    
    // Call contract method
    const value = await polygon.callContractMethod(contract.address, abi, 'getValue');
    console.log('Contract Value:', value);

    // 6. Token Management
    console.log('\n🪙 Token Management:');
    
    // Get token info (example with USDC on Polygon)
    const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const tokenInfo = await polygon.getTokenInfo(usdcAddress);
    console.log('Token Info:', tokenInfo);
    
    // Get token balance
    const tokenBalance = await polygon.getTokenBalance(usdcAddress, address);
    console.log('Token Balance:', tokenBalance);
    
    // Transfer tokens
    const transferTx = await polygon.transferToken(usdcAddress, '0xRecipientAddress', '1000000');
    console.log('Token Transfer Transaction:', transferTx);

    // 7. Wallet Management
    console.log('\n👛 Wallet Management:');
    
    // Create a new wallet
    const newWallet = polygon.createWallet();
    console.log('New Wallet:', newWallet);
    
    // Create wallet from mnemonic
    const mnemonicWallet = polygon.createWalletFromMnemonic('your twelve word mnemonic phrase here');
    console.log('Mnemonic Wallet:', mnemonicWallet);
    
    // Sign a message
    const signature = await polygon.signMessage('Hello Polygon!');
    console.log('Message Signature:', signature);
    
    // Verify message
    const verifiedAddress = await polygon.verifyMessage('Hello Polygon!', signature);
    console.log('Verified Address:', verifiedAddress);

    // 8. Network Information
    console.log('\n🌐 Network Information:');
    
    // Get network info
    const networkInfo = await polygon.getNetworkInfo();
    console.log('Network Info:', networkInfo);
    
    // Get block information
    const block = await polygon.getBlock(blockNumber);
    console.log('Block Info:', block);

    // 9. Transaction Management
    console.log('\n📋 Transaction Management:');
    
    // Send a transaction
    const tx = await polygon.sendTransaction('0xRecipientAddress', '0.1');
    console.log('Transaction:', tx);
    
    // Wait for transaction confirmation
    const confirmedTx = await polygon.waitForTransaction(tx.hash);
    console.log('Confirmed Transaction:', confirmedTx);
    
    // Get transaction details
    const txDetails = await polygon.getTransaction(tx.hash);
    console.log('Transaction Details:', txDetails);

    // 10. Error Handling
    console.log('\n🛡️ Error Handling:');
    try {
      await polygon.getAccount('invalid-address');
    } catch (error) {
      console.log('Caught expected error:', error.message);
    }

    console.log('\n✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error);
  }
}

async function advancedUsageExample() {
  try {
    console.log('\n🔧 LicenseChain Polygon SDK - Advanced Usage Example\n');

    // 1. Batch Operations
    console.log('📦 Batch Operations:');
    const addresses = [
      '0x742d35Cc6634C0532925a3b8D0C0E4C8C8C8C8C8',
      '0x842d35Cc6634C0532925a3b8D0C0E4C8C8C8C8C8',
      '0x942d35Cc6634C0532925a3b8D0C0E4C8C8C8C8C8'
    ];
    
    const balances = await Promise.allSettled(
      addresses.map(addr => polygon.getBalance(addr))
    );
    console.log('Batch Balance Results:', balances);

    // 2. Event Monitoring
    console.log('\n👁️ Event Monitoring:');
    
    // Get contract events
    const contractAddress = '0xContractAddress';
    const abi = [
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
          {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
          {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
      }
    ];
    
    const events = await polygon.getContractEvents(contractAddress, abi, 'Transfer');
    console.log('Contract Events:', events);

    // 3. Token Analytics
    console.log('\n📈 Token Analytics:');
    
    const tokenAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const transfers = await polygon.getTokenTransfers(tokenAddress);
    console.log('Token Transfers Count:', transfers.length);
    
    // Get token holders
    const holders = await polygon.getTokenHolders(tokenAddress);
    console.log('Token Holders Count:', Object.keys(holders).length);

    // 4. DeFi Analytics
    console.log('\n🏊 DeFi Analytics:');
    
    // Get DeFi positions
    const positions = await polygon.getDeFiPositions('0xOwnerAddress');
    console.log('DeFi Positions:', positions);
    
    // Add liquidity
    const addLiquidityTx = await polygon.addLiquidity('0xPoolAddress', '1000000', '0xOwnerAddress');
    console.log('Add Liquidity Transaction:', addLiquidityTx);

    console.log('\n✅ Advanced usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error in advanced usage example:', error);
  }
}

// Run examples
async function runExamples() {
  await basicUsageExample();
  await advancedUsageExample();
  
  // Cleanup
  await polygon.disconnect();
  console.log('\n🔌 Disconnected from LicenseChain Polygon SDK');
}

// Execute examples
runExamples().catch(console.error);