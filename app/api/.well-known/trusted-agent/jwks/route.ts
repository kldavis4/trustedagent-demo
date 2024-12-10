import { getPublicJwk } from '@/lib/keys';

export async function GET(_: Request): Promise<Response> {
  const jwks = { keys: [await getPublicJwk()] };
  return new Response(JSON.stringify(jwks), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
