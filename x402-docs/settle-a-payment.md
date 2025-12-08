# Settle a payment

> Settle an x402 protocol payment with a specific scheme and network.

## OpenAPI

````yaml post /v2/x402/settle
paths:
  path: /v2/x402/settle
  method: post
  servers:
    - url: https://api.cdp.coinbase.com/platform
      description: The production server of the CDP APIs.
  request:
    security:
      - title: apiKeyAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                A JWT signed using your CDP API Key Secret, encoded in base64.
                Refer to the [Generate Bearer
                Token](https://docs.cdp.coinbase.com/api-reference/v2/authentication#2-generate-bearer-token)
                section of our Authentication docs for information on how to
                generate your Bearer Token.
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              x402Version:
                allOf:
                  - $ref: '#/components/schemas/X402Version'
              paymentPayload:
                allOf:
                  - $ref: '#/components/schemas/x402PaymentPayload'
              paymentRequirements:
                allOf:
                  - $ref: '#/components/schemas/x402PaymentRequirements'
            required: true
            requiredProperties:
              - x402Version
              - paymentPayload
              - paymentRequirements
        examples:
          example:
            value:
              x402Version: 1
              paymentPayload:
                x402Version: 1
                scheme: exact
                network: base
                payload:
                  signature: >-
                    0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480
                  authorization:
                    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    value: '1000000000000000000'
                    validAfter: '1716150000'
                    validBefore: '1716150000'
                    nonce: '0x1234567890abcdef1234567890abcdef12345678'
              paymentRequirements:
                scheme: exact
                network: base
                maxAmountRequired: '1000000'
                resource: https://api.example.com/premium/resource/123
                description: Premium API access for data analysis
                mimeType: application/json
                outputSchema:
                  data: string
                payTo: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                maxTimeoutSeconds: 10
                asset: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                extra:
                  gasLimit: '1000000'
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
                    description: Indicates whether the payment settlement is successful.
                    example: false
              errorReason:
                allOf:
                  - $ref: '#/components/schemas/x402SettleErrorReason'
              payer:
                allOf:
                  - type: string
                    description: >-
                      The onchain address of the client that is paying for the
                      resource.


                      For EVM networks, the payer will be a 0x-prefixed,
                      checksum EVM address.


                      For Solana-based networks, the payer will be a
                      base58-encoded Solana address.
                    pattern: >-
                      ^0x[a-fA-F0-9]{40}|[A-Za-z0-9][A-Za-z0-9-]{0,34}[A-Za-z0-9]$
                    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              transaction:
                allOf:
                  - type: string
                    description: >-
                      The transaction of the settlement.

                      For EVM networks, the transaction will be a 0x-prefixed,
                      EVM transaction hash.

                      For Solana-based networks, the transaction will be a
                      base58-encoded Solana signature.
                    pattern: >-
                      ^0x[a-fA-F0-9]{40}|[A-Za-z0-9][A-Za-z0-9-]{0,34}[A-Za-z0-9]$
                    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              network:
                allOf:
                  - type: string
                    description: The network where the settlement occurred.
                    example: base
            requiredProperties:
              - success
              - payer
              - transaction
              - network
        examples:
          example:
            value:
              success: false
              errorReason: insufficient_funds
              payer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              transaction: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              network: base
        description: Successfully settled payment on the x402 protocol.
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              errorType:
                allOf:
                  - &ref_0
                    $ref: '#/components/schemas/ErrorType'
              errorMessage:
                allOf:
                  - &ref_1
                    description: The error message.
                    type: string
                    example: Unable to create EVM account
              correlationId:
                allOf:
                  - &ref_2
                    description: >-
                      A unique identifier for the request that generated the
                      error. This can be used to help debug issues with the API.
                    type: string
                    example: 41deb8d59a9dc9a7-IAD
              errorLink:
                allOf:
                  - &ref_3
                    allOf:
                      - $ref: '#/components/schemas/Url'
                    description: A link to the corresponding error documentation.
                    example: >-
                      https://docs.cdp.coinbase.com/api-reference/v2/errors#invalid-request
            description: >-
              An error response including the code for the type of error and a
              human-readable message describing the error.
            refIdentifier: '#/components/schemas/Error'
            requiredProperties: &ref_4
              - errorType
              - errorMessage
            example: &ref_5
              errorType: invalid_request
              errorMessage: Invalid request.
              correlationId: 41deb8d59a9dc9a7-IAD
              errorLink: >-
                https://docs.cdp.coinbase.com/api-reference/v2/errors#invalid-request
        examples:
          invalid_request:
            value:
              errorType: invalid_request
              errorMessage: Invalid request. Please check the request body and parameters.
        description: Invalid request.
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              errorType:
                allOf:
                  - *ref_0
              errorMessage:
                allOf:
                  - *ref_1
              correlationId:
                allOf:
                  - *ref_2
              errorLink:
                allOf:
                  - *ref_3
            description: >-
              An error response including the code for the type of error and a
              human-readable message describing the error.
            refIdentifier: '#/components/schemas/Error'
            requiredProperties: *ref_4
            example: *ref_5
        examples:
          internal_server_error:
            value:
              errorType: internal_server_error
              errorMessage: An internal server error occurred. Please try again later.
        description: Internal server error.
    '502':
      application/json:
        schemaArray:
          - type: object
            properties:
              errorType:
                allOf:
                  - *ref_0
              errorMessage:
                allOf:
                  - *ref_1
              correlationId:
                allOf:
                  - *ref_2
              errorLink:
                allOf:
                  - *ref_3
            description: >-
              An error response including the code for the type of error and a
              human-readable message describing the error.
            refIdentifier: '#/components/schemas/Error'
            requiredProperties: *ref_4
            example: *ref_5
        examples:
          bad_gateway:
            value:
              errorType: bad_gateway
              errorMessage: Bad gateway. Please try again later.
        description: Bad gateway.
    '503':
      application/json:
        schemaArray:
          - type: object
            properties:
              errorType:
                allOf:
                  - *ref_0
              errorMessage:
                allOf:
                  - *ref_1
              correlationId:
                allOf:
                  - *ref_2
              errorLink:
                allOf:
                  - *ref_3
            description: >-
              An error response including the code for the type of error and a
              human-readable message describing the error.
            refIdentifier: '#/components/schemas/Error'
            requiredProperties: *ref_4
            example: *ref_5
        examples:
          service_unavailable:
            value:
              errorType: service_unavailable
              errorMessage: Service unavailable. Please try again later.
        description: Service unavailable.
  deprecated: false
  type: path
components:
  schemas:
    ErrorType:
      description: >-
        The code that indicates the type of error that occurred. These error
        codes can be used to determine how to handle the error.
      type: string
      example: invalid_request
      enum:
        - already_exists
        - bad_gateway
        - faucet_limit_exceeded
        - forbidden
        - idempotency_error
        - internal_server_error
        - invalid_request
        - invalid_sql_query
        - invalid_signature
        - malformed_transaction
        - not_found
        - payment_method_required
        - rate_limit_exceeded
        - request_canceled
        - service_unavailable
        - timed_out
        - unauthorized
        - policy_violation
        - policy_in_use
        - account_limit_exceeded
        - network_not_tradable
        - guest_permission_denied
        - guest_region_forbidden
        - guest_transaction_limit
        - guest_transaction_count
        - phone_number_verification_expired
        - document_verification_failed
        - recipient_allowlist_violation
        - recipient_allowlist_pending
        - travel_rules_recipient_violation
        - transfer_amount_out_of_bounds
        - transfer_recipient_address_invalid
        - transfer_quote_expired
        - mfa_already_enrolled
        - mfa_invalid_code
        - mfa_flow_expired
        - mfa_required
        - mfa_not_enrolled
      x-error-instructions:
        already_exists: >-
          This error occurs when trying to create a resource that already
          exists.


          **Steps to resolve:**

          1. Check if the resource exists before creation

          2. Use GET endpoints to verify resource state

          3. Use unique identifiers/names for resources
        bad_gateway: >-
          This error occurs when the CDP API is unable to connect to the backend
          service.


          **Steps to resolve:**

          1. Retry your request after a short delay

          2. If persistent, contact CDP support with:
             - The timestamp of the error
             - Request details
          3. Consider implementing retry logic with an exponential backoff


          **Note:** These errors are automatically logged and monitored by CDP.
        faucet_limit_exceeded: >-
          This error occurs when you've exceeded the faucet request limits.


          **Steps to resolve:**

          1. Wait for the time window to reset

          2. Use funds more efficiently in your testing


          For more information on faucet limits, please visit the [EVM Faucet
          endpoint](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/faucets/request-funds-on-evm-test-networks)
          or the [Solana Faucet
          endpoint](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/faucets/request-funds-on-solana-devnet).
        forbidden: >-
          This error occurs when you don't have permission to access the
          resource.


          **Steps to resolve:**

          1. Verify your permissions to access the resource

          2. Ensure that you are the owner of the requested resource
        idempotency_error: >-
          This error occurs when an idempotency key is reused with different
          parameters.


          **Steps to resolve:**

          1. Generate a new UUID v4 for each unique request

          2. Only reuse idempotency keys for exact request duplicates

          3. Track used keys within your application


          **Example idempotency key implementation:**

          ```typescript lines wrap

          import { v4 as uuidv4 } from 'uuid';


          function createIdempotencyKey() {
            return uuidv4();
          }

          ```
        internal_server_error: >-
          This indicates an unexpected error that occurred on the CDP servers.


          **Important**: If you encounter this error, please note that your
          operation's status should be treated as unknown by your application,
          as it could have been a success within the CDP back-end.


          **Steps to resolve:**

          1. Retry your request after a short delay

          2. If persistent, contact CDP support with:
             - Your correlation ID
             - Timestamp of the error
             - Request details
          3. Consider implementing retry logic with an exponential backoff


          **Note:** These errors are automatically logged and monitored by CDP.
        invalid_request: >-
          This error occurs when the request is malformed or contains invalid
          data, including issues with the request body, query parameters, path
          parameters, or headers.


          **Steps to resolve:**

          1. Check all required fields and parameters are present

          2. Ensure request body (if applicable) follows the correct schema

          3. Verify all parameter formats match the API specification:
             - Query parameters
             - Path parameters
             - Request headers
          4. Validate any addresses, IDs, or other formatted strings meet
          requirements


          **Common validation issues:**

          - Missing required parameters

          - Invalid parameter types or formats

          - Malformed JSON in request body

          - Invalid enum values
        invalid_sql_query: |-
          This error occurs when the SQL query is invalid or not allowed.

          **Common causes:**
          - Using non-SELECT SQL statements (INSERT, UPDATE, DELETE, etc.)
          - Invalid table or column names
          - Syntax errors in SQL query
          - Query exceeds character limit
          - Too many JOIN operations
        invalid_signature: >-
          This error occurs when the signature provided for the given user
          operation is invalid.


          **Steps to resolve:**

          1. Verify the signature was generated by the correct owner account

          2. Ensure the signature corresponds to the exact user operation hash

          3. Check that the signature format matches the expected format

          4. Confirm you're using the correct network for the Smart Account


          **Common causes:**

          - Using wrong owner account to sign

          - Signing modified/incorrect user operation data

          - Malformed signature encoding

          - Network mismatch between signature and broadcast
        malformed_transaction: >-
          This error occurs when the transaction data provided is not properly
          formatted or is invalid.


          **Steps to resolve:**

          1. Verify transaction encoding:
             - **EVM networks**: Check RLP encoding is correct
             - **Solana**: Validate base64 encoding
          2. Ensure all required transaction fields are present

          3. Validate transaction parameters are within acceptable ranges

          4. Check that the transaction type is supported on the target network
          (see our [Supported
          Networks](https://docs.cdp.coinbase.com/get-started/supported-networks)
          page for more details)


          **Common causes:**

          - Invalid hex encoding for EVM transactions

          - Missing required transaction fields

          - Incorrect parameter formats

          - Unsupported transaction types

          - Network-specific transaction format mismatches
        not_found: >-
          This error occurs when the resource specified in your request doesn't
          exist or you don't have access to it.


          **Steps to resolve:**

          1. Verify the resource ID/address/account exists

          2. Check your permissions to access the resource

          3. Ensure you're using the correct network/environment

          4. Confirm the resource hasn't been deleted


          **Common causes:**

          - Mistyped addresses

          - Accessing resources from the wrong CDP project

          - Resource was deleted or hasn't been created yet
        payment_method_required: >-
          This error occurs when a payment method is required to complete the
          requested operation but none is configured or available.


          **Steps to resolve:**

          1. Add a valid payment method to your account using the [CDP
          Portal](https://portal.cdp.coinbase.com)

          2. Ensure your payment method is valid and not expired


          **Common causes:**

          - No payment method configured on the account

          - Payment method is expired
        rate_limit_exceeded: |-
          This error occurs when you've exceeded the API rate limits.

          **Steps to resolve:**
          1. Implement exponential backoff
          2. Cache responses where possible
          3. Wait for rate limit window to reset

          **Best practices:**
          ```typescript lines wrap
          async function withRetry(fn: () => Promise<any>) {
            let delay = 1000;
            while (true) {
              try {
                return await fn();
              } catch (e) {
                if (e.errorType === "rate_limit_exceeded") {
                  await sleep(delay);
                  delay *= 2;
                  continue;
                }
                throw e;
              }
            }
          }
          ```
        request_canceled: >-
          This error occurs when the client cancels an in-progress request
          before it completes.


          **Steps to resolve:**

          1. Check client-side timeout configurations

          2. Review request cancellation logic in your code

          3. Consider increasing timeout thresholds for long-running operations

          4. Implement request tracking to identify premature cancellations


          **Best practices:**

          ```typescript lines wrap

          async function withTimeout<T>(promise: Promise<T>, timeoutMs: number):
          Promise<T> {
            const timeout = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error("Operation timed out"));
              }, timeoutMs);
            });

            try {
              return await Promise.race([promise, timeout]);
            } catch (error) {
              // Handle timeout or cancellation
              throw error;
            }
          }

          ```
        service_unavailable: >-
          This error occurs when the CDP API is temporarily unable to handle
          requests due to maintenance or high load.


          **Steps to resolve:**

          1. Retry your request after a short delay

          2. If persistent, contact CDP support with:
             - The timestamp of the error
             - Request details
          3. Consider implementing retry logic with an exponential backoff


          **Note:** These errors are automatically logged and monitored by CDP.
        timed_out: >-
          This error occurs when a request exceeds the maximum allowed
          processing time.


          **Steps to resolve:**

          1. Break down large requests into smaller chunks (if applicable)

          2. Implement retry logic with exponential backoff

          3. Use streaming endpoints for large data sets


          **Example retry implementation:**

          ```typescript lines wrap

          async function withRetryAndTimeout<T>(
            operation: () => Promise<T>,
            maxRetries = 3,
            timeout = 30000,
          ): Promise<T> {
            let attempts = 0;
            while (attempts < maxRetries) {
              try {
                return await Promise.race([
                  operation(),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), timeout)
                  ),
                ]);
              } catch (error) {
                attempts++;
                if (attempts === maxRetries) throw error;
                // Exponential backoff
                await new Promise(resolve =>
                  setTimeout(resolve, Math.pow(2, attempts) * 1000)
                );
              }
            }
            throw new Error("Max retries exceeded");
          }

          ```
        unauthorized: |-
          This error occurs when authentication fails.

          **Steps to resolve:**
          1. Verify your CDP API credentials:
             - Check that your API key is valid
             - Check that your Wallet Secret is properly configured
          2. Validate JWT token:
             - Not expired
             - Properly signed
             - Contains required claims
          3. Check request headers:
             - Authorization header present
             - X-Wallet-Auth header included when required

          **Security note:** Never share your Wallet Secret or API keys.
        policy_in_use: >-
          This error occurs when trying to delete a Policy that is currently in
          use by at least one project or account.


          **Steps to resolve:**

          1. Update project or accounts to remove references to the Policy in
          question.

          2. Retry your delete request.
        network_not_tradable: >-
          This error occurs when the selected asset cannot be purchased on the
          selected network in the user's location.


          **Steps to resolve:**

          1. Verify the asset is tradable on the selected network

          2. Check the user's location to ensure it is allowed to purchase the
          asset on the selected network


          **Common causes:**

          - Users in NY are not allowed to purchase USDC on any network other
          than Ethereum
        guest_permission_denied: >-
          This error occurs when the user is not allowed to complete onramp
          transactions as a guest.


          **Steps to resolve:**

          1. Redirect the user to create a Coinbase account to buy and send
          crypto.
        guest_region_forbidden: >-
          This error occurs when guest onramp transactions are not allowed in
          the user's region.


          **Steps to resolve:**

          1. Redirect the user to create a Coinbase account to buy and send
          crypto.
        guest_transaction_limit: >-
          This error occurs when the user has reached the weekly guest onramp
          transaction limit.


          **Steps to resolve:**

          1. Inform the user they have reached their weekly limit and will have
          to wait until next week.
        guest_transaction_count: >-
          This error occurs when the user has reached the lifetime guest onramp
          transaction count limit.


          **Steps to resolve:**

          1. Redirect the user to create a Coinbase account to buy and send
          crypto.
        phone_number_verification_expired: >-
          This error occurs when the user's phone number verification has
          expired. Use of guest Onramp requires the user's

          phone number to be verified every 60 days.


          **Steps to resolve:**

          1. Re-verify the user's phone number via OTP.

          2. Retry the request with the phoneNumberVerifiedAt field set to new
          verification timestamp.
        document_verification_failed: >-
          This error occurs when the user has not verified their identity for
          their coinbase.com account.

          **Steps to resolve:**

          1. Verify your coinbase account identity with valid documents at
          https://www.coinbase.com/settings/account-levels.
        recipient_allowlist_violation: >-
          This error occurs when the user is not allowed to receive funds at
          this address, according to their coinbase account allowlist.

          **Steps to resolve:**

          1. Either disable the allowlist or add the wallet address at
          https://www.coinbase.com/settings/allowlist

          2. Wait approximately 2 days for updates to take effect.
        recipient_allowlist_pending: >-
          This error occurs when the user is not allowed to receive funds at
          this address, because changes to their coinbase account allowlist are
          pending.

          **Steps to resolve:**

          1. Wait approximately 2 days for updates to take effect.
        travel_rules_recipient_violation: >-
          This error occurs when the user is not allowed to receive funds at
          this address, because it violates travel rules.

          **Steps to resolve:**

          1. Ensure your desired transfer is not blocked by local travel
          regulations.
        transfer_amount_out_of_bounds: >-
          This error occurs when the transfer amount is less than $1 USD
          equivalent amount or greater than the maximum transfer amount for the
          account.


          **Steps to resolve:**

          1. Verify the transfer amount is greater than $1 USD equivalent
          amount.

          2. Confirm that the account has sufficient funds to cover the transfer
          amount.
        transfer_recipient_address_invalid: >-
          This error occurs when the recipient address is invalid for the
          specified network.

          **Steps to resolve:**

          1. Verify the network is supported for the transfer.

          2. Confirm that the recipient address is valid for the specified
          network.
        transfer_quote_expired: |-
          This error occurs when the transfer quote has expired.
          **Steps to resolve:**
          1. Create a new quoted transfer and retry the request.
        mfa_already_enrolled: >-
          This error occurs when attempting to enroll in an MFA method that the
          user has already enrolled in.


          **Steps to resolve:**

          1. Check if the user is already enrolled in the MFA method before
          initiating enrollment

          2. To update or reset MFA, remove the existing enrollment first (if
          supported)

          3. Use a different MFA method if multiple options are available
        mfa_invalid_code: >-
          This error occurs when the MFA code provided is incorrect or has
          already been used.


          **Steps to resolve:**

          1. Verify the user entered the correct code from their authenticator
          app

          2. Ensure the code is current (TOTP codes expire after 30 seconds)

          3. Check that the device time is synchronized correctly

          4. Ask the user to generate a new code and try again


          **Common causes:**

          - Typing errors in the 6-digit code

          - Using an expired TOTP code

          - Device clock drift on user's authenticator app

          - Attempting to reuse a previously submitted code
        mfa_flow_expired: >-
          This error occurs when the MFA enrollment or verification session has
          expired.


          **Steps to resolve:**

          1. Restart the MFA enrollment or verification flow

          2. Complete the flow within the allowed time window (typically 5
          minutes)

          3. Ensure the user doesn't leave the flow idle for extended periods


          **Note:** MFA sessions expire automatically for security purposes.
        mfa_required: >-
          This error occurs when attempting to perform a sensitive operation
          that requires MFA verification, but the user has not completed MFA
          verification.


          **Steps to resolve:**

          1. Initiate the MFA verification flow using the
          `/mfa/verify/{mfaMethod}/init` endpoint

          2. Prompt the user to enter their MFA code

          3. Submit the verification using the `/mfa/verify/{mfaMethod}/submit`
          endpoint

          4. Use the returned access token with MFA claim for the sensitive
          operation

          5. Retry the original request with the new MFA-verified token


          **Operations requiring MFA:**

          - Transactions Sign/Send

          - Key export

          - Account management actions (when configured)
        mfa_not_enrolled: >-
          This error occurs when attempting to verify MFA for a user who has not
          enrolled in any MFA method.


          **Steps to resolve:**

          1. Check if the user has enrolled in MFA before attempting
          verification

          2. Guide the user through MFA enrollment first using the
          `/mfa/enroll/{mfaMethod}/init` endpoint

          3. Complete enrollment before requiring MFA verification
    Url:
      type: string
      format: uri
      minLength: 11
      maxLength: 2048
      pattern: ^https?://.*$
      description: A valid HTTP or HTTPS URL.
      example: https://example.com
    X402Version:
      type: integer
      description: The version of the x402 protocol.
      enum:
        - 1
      example: 1
    x402ExactEvmPayload:
      type: object
      title: x402ExactEvmPayload
      description: >-
        The x402 protocol exact scheme payload for EVM networks. The scheme is
        implemented using ERC-3009. For more details, please see [EVM Exact
        Scheme
        Details](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md).
      properties:
        signature:
          type: string
          description: >-
            The EIP-712 hex-encoded signature of the ERC-3009 authorization
            message.
          example: '0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480'
        authorization:
          type: object
          description: The authorization data for the ERC-3009 authorization message.
          properties:
            from:
              type: string
              pattern: ^0x[0-9a-fA-F]{40}$
              description: >-
                The 0x-prefixed, checksum EVM address of the sender of the
                payment.
              example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            to:
              type: string
              pattern: ^0x[0-9a-fA-F]{40}$
              description: >-
                The 0x-prefixed, checksum EVM address of the recipient of the
                payment.
              example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            value:
              type: string
              description: The value of the payment, in atomic units of the payment asset.
              example: '1000000000000000000'
            validAfter:
              type: string
              description: The unix timestamp after which the payment is valid.
              example: '1716150000'
            validBefore:
              type: string
              description: The unix timestamp before which the payment is valid.
              example: '1716150000'
            nonce:
              type: string
              description: The hex-encoded nonce of the payment.
              example: '0x1234567890abcdef1234567890abcdef12345678'
          example:
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            value: '1000000000000000000'
            validAfter: '1716150000'
            validBefore: '1716150000'
            nonce: '0x1234567890abcdef1234567890abcdef12345678'
          required:
            - from
            - to
            - value
            - validAfter
            - validBefore
            - nonce
      example:
        signature: '0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480'
        authorization:
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          value: '1000000000000000000'
          validAfter: '1716150000'
          validBefore: '1716150000'
          nonce: '0x1234567890abcdef1234567890abcdef12345678'
      required:
        - signature
        - authorization
    x402ExactSolanaPayload:
      type: object
      title: x402ExactSolanaPayload
      description: >-
        The x402 protocol exact scheme payload for Solana networks. For more
        details, please see [Solana Exact Scheme
        Details](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md).
      properties:
        transaction:
          type: string
          description: The base64-encoded Solana transaction.
          example: >-
            AQABAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8CBgMBAQAAAAIBAwQAAAAABgIAAAAAAAYDBQEBAAAGBAgAAAAABgUAAAAA6AMAAAAAAAAGBgUBAQEBBgcEAQAAAAYICgMBAQIDBgkCBgAAAAYKAwABAQEGCwMGAQEBBgwDAAABAQAAAAA=
      example:
        transaction: >-
          AQABAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8CBgMBAQAAAAIBAwQAAAAABgIAAAAAAAYDBQEBAAAGBAgAAAAABgUAAAAA6AMAAAAAAAAGBgUBAQEBBgcEAQAAAAYICgMBAQIDBgkCBgAAAAYKAwABAQEGCwMGAQEBBgwDAAABAQAAAAA=
      required:
        - transaction
    x402PaymentPayload:
      type: object
      description: >-
        The x402 protocol payment payload that the client attaches to x402-paid
        API requests to the resource server in the X-PAYMENT header.
      properties:
        x402Version:
          $ref: '#/components/schemas/X402Version'
        scheme:
          type: string
          description: >-
            The scheme of the payment protocol to use. Currently, the only
            supported scheme is `exact`.
          enum:
            - exact
          example: exact
        network:
          type: string
          description: The network of the blockchain to send payment on.
          enum:
            - base-sepolia
            - base
            - solana-devnet
            - solana
          example: base
        payload:
          type: object
          description: >-
            The payload of the payment depending on the x402Version, scheme, and
            network.
          oneOf:
            - $ref: '#/components/schemas/x402ExactEvmPayload'
            - $ref: '#/components/schemas/x402ExactSolanaPayload'
          example:
            signature: '0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480'
            authorization:
              from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
              value: '1000000000000000000'
              validAfter: '1716150000'
              validBefore: '1716150000'
              nonce: '0x1234567890abcdef1234567890abcdef12345678'
      example:
        x402Version: 1
        scheme: exact
        network: base
        payload:
          signature: '0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480'
          authorization:
            from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            value: '1000000000000000000'
            validAfter: '1716150000'
            validBefore: '1716150000'
            nonce: '0x1234567890abcdef1234567890abcdef12345678'
      required:
        - x402Version
        - scheme
        - network
        - payload
    x402PaymentRequirements:
      type: object
      description: >-
        The x402 protocol payment requirements that the resource server expects
        the client's payment payload to meet.
      properties:
        scheme:
          type: string
          description: >-
            The scheme of the payment protocol to use. Currently, the only
            supported scheme is `exact`.
          enum:
            - exact
          example: exact
        network:
          type: string
          description: The network of the blockchain to send payment on.
          enum:
            - base-sepolia
            - base
            - solana-devnet
            - solana
          example: base
        maxAmountRequired:
          type: string
          description: >-
            The maximum amount required to pay for the resource in atomic units
            of the payment asset.
          example: '1000000'
        resource:
          allOf:
            - $ref: '#/components/schemas/Url'
          description: The URL of the resource to pay for.
          example: https://api.example.com/premium/resource/123
        description:
          type: string
          description: The description of the resource.
          example: Premium API access for data analysis
        mimeType:
          type: string
          description: The MIME type of the resource response.
          example: application/json
        outputSchema:
          type: object
          description: The optional JSON schema describing the resource output.
          additionalProperties: true
          example:
            data: string
        payTo:
          type: string
          description: >-
            The destination to pay value to.


            For EVM networks, payTo will be a 0x-prefixed, checksum EVM address.


            For Solana-based networks, payTo will be a base58-encoded Solana
            address.
          pattern: ^0x[a-fA-F0-9]{40}|[A-Za-z0-9][A-Za-z0-9-]{0,34}[A-Za-z0-9]$
          example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
        maxTimeoutSeconds:
          type: integer
          description: The maximum time in seconds for the resource server to respond.
          example: 10
        asset:
          type: string
          description: >-
            The asset to pay with.


            For EVM networks, the asset will be a 0x-prefixed, checksum EVM
            address.


            For Solana-based networks, the asset will be a base58-encoded Solana
            address.
          pattern: ^0x[a-fA-F0-9]{40}|[A-Za-z0-9][A-Za-z0-9-]{0,34}[A-Za-z0-9]$
          example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
        extra:
          type: object
          description: The optional additional scheme-specific payment info.
          additionalProperties: true
          example:
            gasLimit: '1000000'
      required:
        - scheme
        - network
        - maxAmountRequired
        - resource
        - description
        - mimeType
        - payTo
        - asset
        - maxTimeoutSeconds
    x402SettleErrorReason:
      type: string
      description: The reason the payment settlement errored on the x402 protocol.
      enum:
        - insufficient_funds
        - invalid_scheme
        - invalid_network
        - invalid_x402_version
        - invalid_payment_requirements
        - invalid_payload
        - invalid_exact_evm_payload_authorization_value
        - invalid_exact_evm_payload_authorization_valid_after
        - invalid_exact_evm_payload_authorization_valid_before
        - invalid_exact_evm_payload_authorization_typed_data_message
        - invalid_exact_evm_payload_authorization_from_address_kyt
        - invalid_exact_evm_payload_authorization_to_address_kyt
        - invalid_exact_evm_payload_signature_address
        - settle_exact_svm_block_height_exceeded
        - settle_exact_svm_transaction_confirmation_timed_out
      example: insufficient_funds

````

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.cdp.coinbase.com/llms.txt