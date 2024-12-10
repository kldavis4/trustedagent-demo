# Trusted Agent Demo

Demo Vercel app that implements the trusted agent spec [proposal](https://vercel.notion.site/Trusted-Agents-A-Proposal-for-a-Web-Standard-for-Federated-Identification-of-Bots-and-Agents-128e06b059c480e4bdacff71b315a628) for bots/agents.

## Local development

First, install the dependencies:

```bash
npm install
```

Generate the private/public keys:

```bash
npm run generateKeys
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
