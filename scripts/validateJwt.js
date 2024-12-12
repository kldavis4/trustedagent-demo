// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createPublicKey } = require('crypto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const inquirer = require('inquirer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {exportJWK, importJWK, jwtVerify } = require('jose');

const prompt = inquirer.createPromptModule();

async function getPublicJwk() {
    if (!process.env.AGENT_PUBLIC_KEY) {
        throw new Error('Agent public key not set in environment variables');
    }
    // Convert PEM to KeyObject
    const keyObject = createPublicKey(Buffer.from(process.env.AGENT_PUBLIC_KEY, 'base64').toString('utf8'));

    // Export KeyObject to JWK
    return exportJWK(keyObject);
}

const main = async () => {
    // prompt for the JWT
    const getJwt = [
        {
            type: 'input',
            name: 'jwt',
            message: 'Enter the JWT to validate:',
        },
    ]

    const {jwt} = await prompt(getJwt);

    const publicJwk = await getPublicJwk();
    const publicKey = await importJWK(publicJwk, 'RS256');

    const {payload} = await jwtVerify(jwt, publicKey)

    console.log(payload)
}

main().catch(console.error);