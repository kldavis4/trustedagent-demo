import { exportJWK, JWK } from 'jose';
import { createPublicKey } from 'crypto';

let jwk: JWK | undefined;
let privateKey: string | undefined;

/**
 * Retrieves the public key in JWK format from environment variables.
 * Throws an error if the public key is not set.
 */
export async function getPublicJwk(): Promise<JWK> {
  if (!jwk) {
    if (!process.env.AGENT_PUBLIC_KEY) {
      throw new Error('Agent public key not set in environment variables');
    }
    // Convert PEM to KeyObject
    const keyObject = createPublicKey(Buffer.from(process.env.AGENT_PUBLIC_KEY, 'base64').toString('utf8'));

    // Export KeyObject to JWK
    jwk = await exportJWK(keyObject);
  }

  return jwk;
}

/**
 * Retrieves the private key from environment variables.
 * Throws an error if the private key is not set.
 */
export function getPrivateKey(): string {
  if (!privateKey) {
    if (!process.env.AGENT_PRIVATE_KEY) {
      throw new Error('Agent private key not set in environment variables');
    }
    privateKey = Buffer.from(process.env.AGENT_PRIVATE_KEY, 'base64').toString('utf8');
  }
  return privateKey;
}