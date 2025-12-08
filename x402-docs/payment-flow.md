 Payment Flow Diagram

 Without Protection (Current - Vulnerable)

 ┌─────────┐                                ┌────────────┐
 │  User   │──POST /api/workflows/untitled-4│   Server   │
 │         │  (no payment check)            │            │
 └─────────┘                                └────────────┘
                                                   │
                                                   ▼
                                            Process immediately
                                            (FREE - exploitable)

 With Protection (After Implementation)

 ┌─────────┐                                ┌────────────┐
 │  User   │──1. POST /workflows/untitled-4 │   Server   │
 │         │                                │            │
 └─────────┘                                └────────────┘
     │                                             │
     │                                      2. Check X-PAYMENT
     │                                             │
     │                                      3. No payment?
     │                                             │
     │                   ┌─────────────────────────┘
     │                   ▼
     │           4. Return 402 + requirements
     │◄──────────────────────────────────────
     │
     │       5. x402-fetch creates payment
     │          signature using wallet
     │
     │       6. Retry with X-PAYMENT header
     ├──────────────────────────────────────►
     │                                             │
     │                                      7. Verify payment
     │                                         with facilitator
     │                                             │
     │                                      8. Valid? Settle
     │                                             │
     │                                      9. Process workflow
     │                                             │
     │        10. Return success + tx hash         │
     │◄────────────────────────────────────────────┘
