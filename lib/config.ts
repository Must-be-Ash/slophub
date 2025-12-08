// x402 Network Configuration
export const X402_CONFIG = {
  facilitatorUrl: process.env.FACILITATOR_URL ?? 'https://api.x402.org/facilitator',
  network: process.env.NEXT_PUBLIC_NETWORK ?? 'base',
  usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

// Cost Configuration (in USDC - 6 decimals)
export const COST_CONFIG = {
  landingPageGeneration: 0.01, // $0.01 per landing page
  maxPaymentAmount: 0.1,       // Max for x402-fetch wrapper
};

// Environment Variables Required:
// - NEXT_PUBLIC_CDP_PROJECT_ID
// - NEXT_PUBLIC_NETWORK=base
// - USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// - FACILITATOR_URL=https://api.x402.org/facilitator
