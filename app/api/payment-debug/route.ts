import { NextRequest, NextResponse } from 'next/server';
import {
  createPaymentRequirements,
  verifyPayment,
  create402Response,
  getPaymentHeader,
} from '@/lib/payment-verification';

export async function POST(request: NextRequest) {
  const paymentHeader = getPaymentHeader(request);
  const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}`;

  const paymentRequirements = await createPaymentRequirements('$0.001', 'eip155:8453'); // Base mainnet (CAIP-2)
  const paymentResource = { url: requestUrl, description: 'Payment debug test' };

  const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);

  if (!verificationResult.isValid) {
    return create402Response(paymentRequirements, paymentResource, verificationResult.error, verificationResult.payer);
  }

  return NextResponse.json({
    success: true,
    message: 'Payment verified successfully',
    payer: verificationResult.payer,
    amount: '$0.001 USDC',
  });
}
