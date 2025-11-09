# HMAC Wrapper

The `HmacWrapper` provides a set of functions for creating and verifying Hash-based Message Authentication Codes (HMAC). HMAC is a cryptographic tool used to verify both the **data integrity** and the **authenticity** of a message. It proves that a message has not been altered and that it came from a sender who possesses a shared secret key.

This implementation uses the **HMAC-SHA256** algorithm, a strong and widely-accepted standard.

This utility is located at `src/core/shared/utils/helpers/hmac/index.ts`.

## What is HMAC?

HMAC combines a message (payload) with a secret key using a cryptographic hash function (in this case, SHA256). The output is a signature.

- A sender generates a signature for a request payload and sends both the payload and the signature to the receiver.
- The receiver, who already knows the secret key, independently generates its own signature from the received payload.
- The receiver then compares its generated signature to the one received. If they match, the receiver can be confident the message is authentic and has not been tampered with.

## Namespace: `HmacWrapper`

### `generate(payload: string, secret: string)`

Generates an HMAC-SHA256 signature for a given payload.

- **Parameters:**
    - `payload` (`string`): The message or data to be signed. This is typically the raw request body.
    - `secret` (`string`): The shared secret key. This should be a long, random, and securely stored string.
- **Returns:** `Result<string, ResultError>`
    - `Ok<string>`: On success, contains the HMAC signature as a lowercase hexadecimal string.
    - `Err<ResultError>`: If the payload or secret is missing.

### `compare(payload: string, secret: string, receivedSignature: string)`

Verifies a received HMAC signature. This function securely compares signatures by re-generating the signature from the payload and secret, then checking for equality.

- **Parameters:**
    - `payload` (`string`): The message payload that was signed.
    - `secret` (`string`): The shared secret key.
    - `receivedSignature` (`string`): The HMAC signature that was received with the message.
- **Returns:** `Result<boolean, ResultError>`
    - `Ok<true>`: If the generated signature matches the received signature.
    - `Err<ResultError>`: If the signatures do not match (with a `401 Unauthorized` status code) or if any inputs are invalid.

## Usage Example

This is a common pattern for securing webhooks or internal service-to-service API calls.

### Sender: Generating and Sending the Signature

```typescript
import { HmacWrapper } from './hmac';
import axios from 'axios';

const secretKey = 'my-super-secret-and-long-key'; // Should be loaded from a secure config
const payload = {
	userId: 'user-123',
	action: 'update-profile',
	timestamp: Date.now(),
};
const payloadString = JSON.stringify(payload);

// 1. Generate the signature
const signatureResult = HmacWrapper.generate(payloadString, secretKey);

if (signatureResult.isErr()) {
	console.error('Could not generate signature:', signatureResult.error.message);
} else {
	const signature = signatureResult.value;
	console.log('Generated Signature:', signature);

	// 2. Send the payload and the signature in a header
	axios.post('https://api.example.com/webhook', payload, {
		headers: {
			'X-Signature-256': signature,
			'Content-Type': 'application/json',
		},
	});
}
```

### Receiver: Verifying the Signature

```typescript
import { HmacWrapper } from './hmac';
import express from 'express';

const app = express();
const secretKey = 'my-super-secret-and-long-key'; // The same secret key as the sender

// Middleware to get the raw request body
app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf.toString();
		},
	})
);

app.post('/webhook', (req, res) => {
	const receivedSignature = req.header('X-Signature-256');
	const payloadString = req.rawBody; // Use the raw body for verification

	// 1. Compare the received signature with a newly generated one
	const comparisonResult = HmacWrapper.compare(payloadString, secretKey, receivedSignature);

	// 2. Act on the result
	if (comparisonResult.isErr()) {
		// This could be due to a bad signature or invalid input
		return res.status(comparisonResult.error.statusCode).send(comparisonResult.error.message);
	}

	// If we get here, the signature is valid.
	console.log('Signature is valid! Processing webhook...');
	res.status(200).send('Webhook received successfully.');
});
```

**Note:** It is critical to use the **raw request body** for verification, as even a single character difference (like whitespace changes from JSON parsing and re-stringifying) will produce a different signature.
