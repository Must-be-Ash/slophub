// x402 Network Configuration
export const X402_CONFIG = {
  facilitatorUrl: process.env.FACILITATOR_URL ?? 'https://x402.org/facilitator',
  network: process.env.NEXT_PUBLIC_NETWORK ?? 'base',
  usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

// Cost Configuration (in USDC - 6 decimals)
export const COST_CONFIG = {
  landingPageGeneration: 0.01, // $0.01 per landing page
  maxPaymentAmount: 0.1,       // Max for x402-fetch wrapper
};

// Payment Configuration (for backend x402 protection)
export const PAYMENT_CONFIG = {
  landingPagePrice: '$0.01',
  network: (process.env.NEXT_PUBLIC_NETWORK || 'base') as 'base' | 'base-sepolia',
  receivingAddress: process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS as `0x${string}`,
  usdcContract: process.env.USDC_CONTRACT_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402.org/facilitator',
  maxPaymentAmount: 0.1, // Max USDC user can authorize
};

// Validate required config on startup
if (!PAYMENT_CONFIG.receivingAddress) {
  console.warn('⚠️  NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS not set - payment protection disabled');
}

// Environment Variables Required:
// - NEXT_PUBLIC_CDP_PROJECT_ID
// - NEXT_PUBLIC_NETWORK=base
// - USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// - FACILITATOR_URL=https://api.x402.org/facilitator
// - NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0xYourWalletAddress (REQUIRED for backend payment protection)
// - CDP_API_KEY_ID=your-api-key-id (REQUIRED for CDP facilitator)
// - CDP_API_KEY_SECRET=your-api-key-secret (REQUIRED for CDP facilitator)
