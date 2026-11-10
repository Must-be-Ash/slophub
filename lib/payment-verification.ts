import { NextResponse } from 'next/server';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from '@x402/core/http';
import type { Network, PaymentPayload, PaymentRequirements, SettleResponse } from '@x402/core/types';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { facilitator } from '@coinbase/x402';

// CDP Facilitator - Required for Base mainnet (x402 v2)
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient(facilitator))
  .register('eip155:8453', new ExactEvmScheme());

let initPromise: Promise<void> | null = null;
function ensureInitialized() {
  initPromise ??= resourceServer.initialize().catch((error) => {
    initPromise = null;
    throw error;
  });
  return initPromise;
}

export interface PaymentResource {
  url: string;
  description: string;
}

export async function createPaymentRequirements(
  price: string, // e.g. "$0.01"
  network: Network // CAIP-2, e.g. "eip155:8453"
): Promise<PaymentRequirements> {
  await ensureInitialized();
  const [requirements] = await resourceServer.buildPaymentRequirements({
    scheme: 'exact',
    price,
    network,
    payTo: process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS as `0x${string}`,
    maxTimeoutSeconds: 120,
  });

  if (!requirements) {
    throw new Error(`Facilitator does not support exact payments on ${network}`);
  }
  return requirements;
}

// Reads the v2 PAYMENT-SIGNATURE header (falls back to the legacy v1 X-PAYMENT header name)
export function getPaymentHeader(request: Request): string | null {
  return request.headers.get('PAYMENT-SIGNATURE') ?? request.headers.get('X-PAYMENT');
}

function decodePayment(
  paymentHeader: string,
  paymentRequirements: PaymentRequirements
): PaymentPayload {
  const decodedPayment = decodePaymentSignatureHeader(paymentHeader);
  if (!resourceServer.findMatchingRequirements([paymentRequirements], decodedPayment)) {
    throw new Error('Payment does not match the payment requirements');
  }
  return decodedPayment;
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
      error: 'PAYMENT-SIGNATURE header is required',
    };
  }

  // Decode payment
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = decodePayment(paymentHeader, paymentRequirements);
  } catch (error) {
    console.error('[x402] Failed to decode payment:', error);
    return {
      isValid: false,
      error: 'Invalid or malformed payment header',
    };
  }

  // Log payment details
  console.log('[x402] Payment received:');
  const authorization = (decodedPayment.payload as { authorization?: Record<string, string> }).authorization;
  if (authorization) {
    console.log('  From:', authorization.from);
    console.log('  To:', authorization.to);
    console.log('  Amount:', authorization.value);
  }
  console.log('  Network:', decodedPayment.accepted.network);

  // Verify with CDP facilitator
  try {
    const response = await resourceServer.verifyPayment(decodedPayment, paymentRequirements);

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
  settleResponse?: SettleResponse;
  error?: string;
}> {
  try {
    const decodedPayment = decodePayment(paymentHeader, paymentRequirements);

    const settleResponse = await resourceServer.settlePayment(decodedPayment, paymentRequirements);

    if (!settleResponse.success) {
      console.error('[x402] Payment settlement failed:', settleResponse.errorReason);
      return {
        success: false,
        error: settleResponse.errorReason || 'Settlement failed',
      };
    }

    console.log('[x402] ✓ Payment settled:', settleResponse.transaction);
    return {
      success: true,
      txHash: settleResponse.transaction,
      settleResponse,
    };
  } catch (error) {
    console.error('[x402] Settlement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown settlement error',
    };
  }
}

// Builds a v2 402 response: requirements in the PAYMENT-REQUIRED header (and mirrored in the body)
export async function create402Response(
  paymentRequirements: PaymentRequirements,
  resource: PaymentResource,
  error?: string,
  payer?: string
): Promise<NextResponse> {
  const paymentRequired = await resourceServer.createPaymentRequiredResponse(
    [paymentRequirements],
    { url: resource.url, description: resource.description, mimeType: 'application/json' },
    error || 'Payment required'
  );

  return NextResponse.json(
    { ...paymentRequired, ...(payer && { payer }) },
    {
      status: 402,
      headers: {
        'PAYMENT-REQUIRED': encodePaymentRequiredHeader(paymentRequired),
        'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED',
      },
    }
  );
}

export function createPaymentResponseHeader(settleResponse: SettleResponse): string {
  return encodePaymentResponseHeader(settleResponse);
}
