import { Buffer } from 'buffer';
import crypto, { randomBytes } from 'crypto';

export class BufferWrapper {
	public static toBuffer(input: string, encoding: BufferEncoding = 'base64'): Buffer {
		return Buffer.from(input, encoding);
	}

	public static toString(buffer: Buffer, encoding: BufferEncoding = 'base64'): string {
		return buffer.toString(encoding);
	}

	public static validateLength(buffer: Buffer, expectedLength: number): boolean {
		return buffer.length === expectedLength;
	}

	public static generateSecureBuffer(byteLength: number): Buffer {
		return randomBytes(byteLength);
	}

	public static getByteLength(input: string, encoding: BufferEncoding = 'base64'): number {
		return Buffer.byteLength(input, encoding);
	}

	public static generateSecureRandomString(
		byteLength: number,
		encoding: BufferEncoding = 'base64'
	): string {
		return randomBytes(byteLength).toString(encoding);
	}

	public static isValidEncoding(
		encoding: string,
		allowedEncodings: BufferEncoding[] = ['utf8', 'hex', 'base64']
	): encoding is BufferEncoding {
		return allowedEncodings.includes(encoding as BufferEncoding);
	}
}
