# x402 Facilitator

The x402 payment protocol is an HTTP-based payment protocol that enables developers running resource servers to accept payments from users using a variety of payment methods.
For more details on the x402 payment protocol, please see the [x402 specification](https://www.x402.org/).
The x402 Facilitator APIs enable you to facilitate payments using the x402 payment protocol by exposing two APIs:

* `POST /v2/x402/verify`: Verify a payment with a supported scheme and network.
* `POST /v2/x402/settle`: Settle a payment with a supported scheme and network.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.cdp.coinbase.com/llms.txt