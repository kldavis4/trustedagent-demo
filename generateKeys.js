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

// Prepare the .env.local content
const envContent = `
PRIVATE_KEY="${privateKeyPem.replace(/\n/g, '\\n')}"
PUBLIC_KEY="${publicKeyPem.replace(/\n/g, '\\n')}"
`;

// Write the keys to .env.local
fs.writeFileSync(path.resolve(__dirname, '.env.local'), envContent.trim(), 'utf8');

console.log('Keys generated and saved to .env.local');