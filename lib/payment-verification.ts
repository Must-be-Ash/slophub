import { exact } from 'x402/schemes';
import { useFacilitator } from 'x402/verify';
import {
  PaymentPayload,
  PaymentRequirements,
  Resource,
  Network,
} from 'x402/types';
import { processPriceToAtomicAmount } from 'x402/shared';
import { facilitator } from '@coinbase/x402';

// CDP Facilitator - Required for Base mainnet
const { verify, settle } = useFacilitator(facilitator);
const x402Version = 1;

export function createPaymentRequirements(
  price: string, // e.g. "$0.01"
  network: Network,
  resource: Resource,
  description: string
): PaymentRequirements {
  const atomicAmountForAsset = processPriceToAtomicAmount(price, network);

  if ('error' in atomicAmountForAsset) {
    throw new Error(atomicAmountForAsset.error);
  }

  const { maxAmountRequired, asset } = atomicAmountForAsset;

  // Type guard: EVM assets have eip712 property
  const extra = 'eip712' in asset ? {
    name: asset.eip712.name,
    version: asset.eip712.version,
  } : undefined;

  return {
    scheme: 'exact',
    network,
    maxAmountRequired,
    resource,
    description,
    mimeType: 'application/json',
    payTo: process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS as `0x${string}`,
    maxTimeoutSeconds: 120,
    asset: asset.address,
    outputSchema: undefined,
    extra,
  };
}

export async function verifyPayment(
  paymentHeader: string | null,
  paymentRequirements: PaymentRequirements
): Promise<{
  isValid: boolean;
  error?: string;
  payer?: string;
}> {
  // No payment header - return 402
  if (!paymentHeader) {
    return {
      isValid: false,
      error: 'X-PAYMENT header is required',
    };
  }

  // Decode payment
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;
  } catch (error) {
    console.error('[x402] Failed to decode payment:', error);
    return {
      isValid: false,
      error: 'Invalid or malformed payment header',
    };
  }

  // Log payment details
  console.log('[x402] Payment received:');
  // Type guard: EVM payloads have authorization, Solana has transaction
  if (decodedPayment.payload && 'authorization' in decodedPayment.payload) {
    console.log('  From:', decodedPayment.payload.authorization.from);
    console.log('  To:', decodedPayment.payload.authorization.to);
    console.log('  Amount:', decodedPayment.payload.authorization.value);
  }
  console.log('  Network:', decodedPayment.network);

  // Verify with CDP facilitator
  try {
    const response = await verify(decodedPayment, paymentRequirements);

    if (!response.isValid) {
      console.error('[x402] Payment verification failed:', response.invalidReason);
      return {
        isValid: false,
        error: response.invalidReason || 'Payment verification failed',
        payer: response.payer,
      };
    }

    console.log('[x402] ✓ Payment verified for:', response.payer);
    return {
      isValid: true,
      payer: response.payer,
    };
  } catch (error) {
    console.error('[x402] Facilitator error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown verification error',
    };
  }
}

export async function settlePayment(
  paymentHeader: string,
  paymentRequirements: PaymentRequirements
): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    const decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;

    const settleResponse = await settle(decodedPayment, paymentRequirements);

    if (!settleResponse.success) {
      console.error('[x402] Payment settlement failed');
      return {
        success: false,
        error: 'Settlement failed',
      };
    }

    console.log('[x402] ✓ Payment settled:', settleResponse.transaction);
    return {
      success: true,
      txHash: settleResponse.transaction,
    };
  } catch (error) {
    console.error('[x402] Settlement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown settlement error',
    };
  }
}

export function create402Response(
  paymentRequirements: PaymentRequirements,
  error?: string,
  payer?: string
) {
  return {
    x402Version,
    error: error || 'Payment required',
    accepts: [paymentRequirements],
    ...(payer && { payer }),
  };
}

export function createPaymentResponseHeader(txHash: string): string {
  return `tx_hash:${txHash}`;
}
