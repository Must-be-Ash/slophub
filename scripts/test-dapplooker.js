#!/usr/bin/env node
/**
 * Test script to call the dapplooker crypto-market endpoint
 * This should return a 402 payment request when called without an API key
 */

import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { PaymentHandler } from './dist/payment/PaymentHandler.js';

// Test endpoint configuration
const endpoint = {
  id: 'dapplooker_crypto_market',
  name: 'Unified Token Intelligence API',
  url: 'https://api.dapplooker.com/v1/crypto-market',
  method: 'GET',
  description: 'Access consolidated token data through a single endpoint',
  parameters: {
    type: 'object',
    properties: {
      chain: { type: 'string', description: 'The network chain to query (base, solana)' },
      token_tickers: { type: 'string', description: 'Comma-separated token tickers' },
      token_addresses: { type: 'string', description: 'Comma-separated token addresses' },
      token_ids: { type: 'string', description: 'Comma-separated token IDs' },
      ecosystem: { type: 'string', description: 'Specific ecosystem tokens to query' },
      page: { type: 'integer', description: 'Page number' }
    },
    required: ['chain']
  }
};

async function testRaw402() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Testing raw HTTP call (should return 402)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const url = 'https://api.dapplooker.com/v1/crypto-market?chain=base&token_tickers=AIXBT';
    console.log('📡 Making raw HTTP GET request (without API key)...');
    console.log('   URL:', url);
    console.log('');
    
    const response = await fetch(url);
    
    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:');
    try {
      const json = JSON.parse(responseText);
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log(responseText);
    }
    
    if (response.status === 402) {
      console.log('\n✅ SUCCESS! Received 402 Payment Required response as expected!');
    } else {
      console.log(`\n⚠️  Received status ${response.status} instead of 402`);
    }
    
  } catch (error) {
    console.error('❌ Error making raw request:', error.message);
  }
}

async function testX402Call() {
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Testing x402 payment protocol call');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Check for private key
  const privateKey = process.env.X402_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('⚠️  X402_WALLET_PRIVATE_KEY not set. Skipping x402 call test.');
    console.log('\nTo test x402 payment handling, set X402_WALLET_PRIVATE_KEY:');
    console.log('   export X402_WALLET_PRIVATE_KEY="0x..."');
    console.log('   node test-dapplooker.js');
    return;
  }

  try {
    console.log('📝 Endpoint:', endpoint.url);
    console.log('📝 Method:', endpoint.method);
    console.log('📝 Parameters: { chain: "base", token_tickers: "AIXBT" }\n');

    // Initialize wallet
    console.log('🔐 Initializing wallet...');
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
    console.log('✅ Wallet initialized:', account.address);

    // Initialize payment handler
    console.log('💳 Initializing payment handler...');
    const paymentHandler = await PaymentHandler.create(
      walletClient,
      'base',
      privateKey
    );
    console.log('✅ Payment handler initialized\n');

    // Make the call
    console.log('📡 Making x402-protected request...');
    console.log('   (x402-fetch will automatically handle 402 payment)\n');
    
    const params = {
      chain: 'base',
      token_tickers: 'AIXBT'
    };

    const result = await paymentHandler.callEndpoint(endpoint, params);

    console.log('\n✅ Request completed successfully!');
    console.log('\n📊 Response Data:');
    console.log(JSON.stringify(result.data, null, 2));

    if (result.txHash) {
      console.log('\n💸 Payment Transaction Details:');
      console.log('   TX Hash:', result.txHash);
      console.log('   Amount:', result.amount || 'N/A');
      console.log('   Payment Made:', result.paymentMade);
      console.log('   BaseScan:', `https://basescan.org/tx/${result.txHash}`);
    } else {
      console.log('\n⚠️  No payment transaction detected in response');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    // Check if it's a 402 response
    if (error.message.includes('402') || error.message.includes('Payment Required')) {
      console.log('\n✅ Success! Received 402 Payment Required response.');
      console.log('   The x402-fetch library should handle this automatically.');
    }
  }
}

async function main() {
  // First test: raw HTTP call to see 402 response
  await testRaw402();
  
  // Second test: x402-protected call
  await testX402Call();
  
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the test
main();

