// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateKeyPairSync } = require('crypto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Generate RSA key pair
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

// Export keys to PEM format
const publicKeyPem = publicKey.export({ type: 'pkcs1', format: 'pem' });
const privateKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });

// Encode keys in Base64
const publicKeyBase64 = Buffer.from(publicKeyPem).toString('base64');
const privateKeyBase64 = Buffer.from(privateKeyPem).toString('base64');

// Prepare the .env.local content with Base64 encoded keys
const envContent = `
AGENT_PRIVATE_KEY="${privateKeyBase64}"
AGENT_PUBLIC_KEY="${publicKeyBase64}"
`;

// Write the keys to .env.local
fs.writeFileSync(path.resolve(__dirname, '.env.local'), envContent.trim(), 'utf8');

console.log('Keys generated and saved to .env.local');