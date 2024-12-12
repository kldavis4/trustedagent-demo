# Trusted Agent Demo

Demo Vercel app that implements the trusted agent spec [proposal](https://vercel.notion.site/Trusted-Agents-A-Proposal-for-a-Web-Standard-for-Federated-Identification-of-Bots-and-Agents-128e06b059c480e4bdacff71b315a628) for bots/agents.

## Local development

First, install the dependencies:

```bash
npm install
```

Generate the private/public keys:

```bash
npm run generate-keys
```

Run the development server:

```bash
npm run dev
```

## Deployment to Vercel

### Environment variables

- `AGENT_PRIVATE_KEY`: The base64 encoded private key used to sign the JWT tokens.
- `AGENT_PUBLIC_KEY`: The base64 encoded public key used to verify the JWT tokens.
- `PROXY_IP`: The IP address of the proxy server used by the agent.
- `NEXT_PUBLIC_AGENT_URL`: The URL of the agent server.

## Usage

## Scripts

### `generate-keys`

Generates a new private/public key pair.

### `validate-jwt`

Validates a JWT token using the configured public key.

### Query parameters

- `trace`: Send trace header to the proxy server.