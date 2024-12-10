import { exportJWK, JWK } from 'jose';
import { createPublicKey } from 'crypto';

let jwk: JWK | undefined;

/**
 * Retrieves the public key in JWK format from environment variables.
 * Throws an error if the public key is not set.
 */
export async function getPublicJwk(): Promise<JWK> {
  const publicKey = process.env.AGENT_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Public key not set in environment variables');
  }

  if (!jwk) {
    // Convert PEM to KeyObject
    const keyObject = createPublicKey(publicKey);
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
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key not set in environment variables');
  }
  return privateKey;
}