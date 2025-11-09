# AES Encryption Utility

This utility provides a robust and secure way to perform AES (Advanced Encryption Standard) encryption and decryption. It includes a low-level `AES` class for core cryptographic operations and high-level service wrappers (`AesEncryptWrapper`, `AesDecryptWrapper`) for easy integration into a service-oriented architecture.

The implementation uses the `aes-256-cbc` algorithm, which is a strong, industry-standard symmetric encryption cipher.

This utility is located at `src/core/shared/utils/helpers/aes/index.ts`.

## Core `AES` Class

This class contains the fundamental encryption and decryption logic.

### Security & Implementation Details

- **Algorithm:** `aes-256-cbc`
    - **AES-256:** Requires a 256-bit (32-byte) encryption key. The key provided to the class **must be a base64-encoded string that decodes to 32 bytes.**
    - **CBC (Cipher Block Chaining):** This mode requires an Initialization Vector (IV) to ensure that encrypting the same plaintext multiple times results in different ciphertexts.
- **Initialization Vector (IV):** A new, cryptographically random 16-byte IV is generated for **every encryption operation**.
- **Ciphertext Format:** The `encryptAsync` method prepends the IV to the final ciphertext, separated by a colon (`:`). The resulting string format is `iv_hex:ciphertext_hex`. This is a standard practice, as the IV is not secret and is required for decryption.

### `constructor(encryptionKey: string)`

Initializes the AES utility with a secret key.

- **Parameters:**
    - `encryptionKey` (`string`): A **base64-encoded** string that represents a 32-byte (256-bit) key.

### `encryptAsync(data: string)`

Encrypts a string.

- **Returns:** `Promise<string>` - A promise that resolves to the encrypted string in the format `iv:ciphertext`.

### `decryptAsync(data: string)`

Decrypts a string that was encrypted using `encryptAsync`.

- **Parameters:**
    - `data` (`string`): The encrypted string in the `iv:ciphertext` format.
- **Returns:** `Promise<string>` - A promise that resolves to the original plaintext string.

## Service Wrappers

These are high-level `typedi` services that wrap the `AES` class to handle the encryption and decryption of entire objects. They implement the `IServiceHandlerAsync` interface and provide robust validation and error handling.

### `AesEncryptWrapper<T extends object>`

A service to encrypt a JavaScript object.

- **Input:** `IAesEncryptParameters<T>`
    - `data` (`T`): The object to encrypt.
    - `key` (`string`): The base64-encoded 32-byte encryption key.
- **Process:**
    1.  Validates inputs.
    2.  Serializes the `data` object to a JSON string.
    3.  Encrypts the JSON string using the `AES` class.
- **Output:** `Result<IAesEncryptResult, ResultError>` - A `Result` object containing the encrypted text.

### `AesDecryptWrapper<T extends object>`

A service to decrypt an encrypted string back into a JavaScript object.

- **Input:** `IAesDecryptParameters`
    - `data` (`string`): The encrypted string (`iv:ciphertext`).
    - `key` (`string`): The base64-encoded 32-byte encryption key.
- **Process:**
    1.  Validates inputs.
    2.  Decrypts the `data` string using the `AES` class.
    3.  Parses the resulting JSON string back into an object of type `T`.
- **Output:** `Result<T, ResultError>` - A `Result` object containing the original, decrypted object.

## Usage Example

### Low-Level `AES` Class Usage

```typescript
import { AES } from './aes';
import crypto from 'crypto';

// 1. Generate a secure, 32-byte key and base64-encode it.
// This should be done once and the key stored securely (e.g., in an environment variable).
const secretKey = crypto.randomBytes(32).toString('base64');

const aes = new AES(secretKey);
const originalText = 'This is a secret message.';

async function runEncryption() {
	try {
		// 2. Encrypt the data
		const encrypted = await aes.encryptAsync(originalText);
		console.log('Encrypted:', encrypted);

		// 3. Decrypt the data
		const decrypted = await aes.decryptAsync(encrypted);
		console.log('Decrypted:', decrypted);

		console.log('Match:', originalText === decrypted); // true
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

runEncryption();
```

### High-Level Wrapper Usage

This example assumes you are using `typedi` for dependency injection.

```typescript
import { AesEncryptWrapper, AesDecryptWrapper } from './aes';
import crypto from 'crypto';

const secretKey = crypto.randomBytes(32).toString('base64');

const encryptService = new AesEncryptWrapper<{ message: string }>();
const decryptService = new AesDecryptWrapper<{ message: string }>();

async function runWrapperEncryption() {
	const originalObject = { message: 'This is a secret object.' };

	// Encrypt the object
	const encryptResult = await encryptService.handleAsync({
		data: originalObject,
		key: secretKey,
	});

	if (encryptResult.isErr()) {
		console.error('Encryption failed:', encryptResult.error.message);
		return;
	}

	const encryptedText = encryptResult.value.encryptedText;
	console.log('Encrypted Object:', encryptedText);

	// Decrypt the object
	const decryptResult = await decryptService.handleAsync({
		data: encryptedText,
		key: secretKey,
	});

	if (decryptResult.isErr()) {
		console.error('Decryption failed:', decryptResult.error.message);
		return;
	}

	const decryptedObject = decryptResult.value;
	console.log('Decrypted Object:', decryptedObject);
}

runWrapperEncryption();
```
