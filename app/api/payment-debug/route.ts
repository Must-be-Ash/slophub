import { NextRequest, NextResponse } from 'next/server';
import {
  createPaymentRequirements,
  verifyPayment,
  create402Response,
} from '@/lib/payment-verification';
import type { Resource } from 'x402/types';

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get('X-PAYMENT');
  const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}` as Resource;

  const paymentRequirements = createPaymentRequirements(
    '$0.001', // Small amount for testing
    'base',
    requestUrl,
    'Payment debug test'
  );

  const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);

  if (!verificationResult.isValid) {
    return NextResponse.json(
      create402Response(paymentRequirements, verificationResult.error, verificationResult.payer),
      { status: 402 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Payment verified successfully',
    payer: verificationResult.payer,
    amount: '$0.001 USDC',
  });
}
