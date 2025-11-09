# `BufferWrapper`

The `BufferWrapper` is a static utility class that provides a collection of helper methods for working with Node.js `Buffer` objects. It simplifies common tasks such as encoding and decoding strings, generating secure random data, and performing validations.

This utility is located at `src/core/shared/utils/miscellaneous/buffer/index.ts`.

## Class: `BufferWrapper`

All methods in this class are static and can be called directly on the class.

### `toBuffer(input: string, encoding: BufferEncoding = 'base64')`

Converts a string into a `Buffer`.

-   **Parameters:**
    -   `input` (`string`): The string to convert.
    -   `encoding` (`BufferEncoding`, optional): The encoding of the input string. Defaults to `'base64'`.
-   **Returns:** `Buffer` - The resulting buffer.

### `toString(buffer: Buffer, encoding: BufferEncoding = 'base64')`

Converts a `Buffer` into a string.

-   **Parameters:**
    -   `buffer` (`Buffer`): The buffer to convert.
    -   `encoding` (`BufferEncoding`, optional): The desired encoding for the output string. Defaults to `'base64'`.
-   **Returns:** `string` - The resulting string.

### `validateLength(buffer: Buffer, expectedLength: number)`

Checks if a buffer's length in bytes matches an expected value.

-   **Parameters:**
    -   `buffer` (`Buffer`): The buffer to validate.
    -   `expectedLength` (`number`): The expected length in bytes.
-   **Returns:** `boolean` - `true` if the length matches, `false` otherwise.

### `generateSecureBuffer(byteLength: number)`

Generates a `Buffer` of a specified length containing cryptographically strong pseudo-random data.

-   **Parameters:**
    -   `byteLength` (`number`): The number of bytes to generate.
-   **Returns:** `Buffer` - A new secure buffer.

### `getByteLength(input: string, encoding: BufferEncoding = 'base64')`

Calculates the number of bytes required to represent a string with a specific encoding.

-   **Parameters:**
    -   `input` (`string`): The string to measure.
    -   `encoding` (`BufferEncoding`, optional): The encoding to use for the calculation. Defaults to `'base64'`.
-   **Returns:** `number` - The length of the buffer in bytes.

### `generateSecureRandomString(byteLength: number, encoding: BufferEncoding = 'base64')`

Generates a cryptographically secure, random string.

-   **Parameters:**
    -   `byteLength` (`number`): The number of random bytes to generate. The final string length will vary depending on the encoding.
    -   `encoding` (`BufferEncoding`, optional): The encoding to use for the output string. Defaults to `'base64'`.
-   **Returns:** `string` - The generated random string.

### `isValidEncoding(encoding: string, allowedEncodings: BufferEncoding[] = ['utf8', 'hex', 'base64'])`

A type guard to check if a string is a valid and allowed buffer encoding.

-   **Parameters:**
    -   `encoding` (`string`): The encoding string to validate.
    -   `allowedEncodings` (`BufferEncoding[]`, optional): An array of allowed encodings. Defaults to `['utf8', 'hex', 'base64']`.
-   **Returns:** `encoding is BufferEncoding` - `true` if the encoding is valid and allowed, `false` otherwise.

## Usage Example

```typescript
import { BufferWrapper } from './buffer-wrapper';

// --- Encoding and Decoding ---
const originalString = 'hello world';
const base64String = Buffer.from(originalString).toString('base64'); // "aGVsbG8gd29ybGQ="

const buffer = BufferWrapper.toBuffer(base64String, 'base64');
const decodedString = BufferWrapper.toString(buffer, 'utf-8'); // Note the encoding change for decoding

console.log(`Original: ${originalString}`);
console.log(`Decoded: ${decodedString}`);
console.log(`Are they equal? ${originalString === decodedString}`);

// --- Generation and Validation ---
const secureKey = BufferWrapper.generateSecureBuffer(32); // 256-bit key
console.log(`Secure key length is 32 bytes: ${BufferWrapper.validateLength(secureKey, 32)}`);

const secureString = BufferWrapper.generateSecureRandomString(16, 'hex');
console.log(`Secure hex string: ${secureString}`);

// --- Encoding Validation ---
const encoding1 = 'utf8';
const encoding2 = 'ascii';

if (BufferWrapper.isValidEncoding(encoding1)) {
  console.log(`${encoding1} is a valid and allowed encoding.`);
}

if (!BufferWrapper.isValidEncoding(encoding2)) {
  console.log(`${encoding2} is not in the default allowed list.`);
}
```
