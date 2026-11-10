export interface PaymentSettlement {
  service: 'Landing Page Generation';
  txHash: string;
  amount: number; // in USDC
  timestamp: number;
  baseScanUrl: string;
}

// Extract transaction hash from PAYMENT-RESPONSE header (base64 JSON settle response)
export function extractTxHashFromPaymentResponse(
  paymentResponseHeader: string | null
): string | null {
  if (!paymentResponseHeader) return null;
  try {
    const decoded = JSON.parse(atob(paymentResponseHeader));
    if (typeof decoded?.transaction === 'string' && decoded.transaction) return decoded.transaction;
  } catch {}
  // Legacy "tx_hash:0x..." format
  const match = paymentResponseHeader.match(/tx_hash:([0-9a-fA-Fx]+)/);
  return match ? match[1] : null;
}

// Log payment with BaseScan link
export function logPaymentSettlement(
  service: 'Landing Page Generation',
  txHash: string,
  amount: number
): PaymentSettlement {
  const baseScanUrl = `https://basescan.org/tx/${txHash}`;
  console.log(`✅ Payment settled: ${service}`);
  console.log(`   Amount: $${amount.toFixed(4)} USDC`);
  console.log(`   View on BaseScan: ${baseScanUrl}`);

  return {
    service,
    txHash,
    amount,
    timestamp: Date.now(),
    baseScanUrl,
  };
}

// Log payment initiation
export function logPaymentInitiation(
  service: 'Landing Page Generation',
  amount: number
): void {
  console.log(`💳 Initiating payment: ${service}`);
  console.log(`   Amount: $${amount.toFixed(4)} USDC`);
}
