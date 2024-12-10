import { NextRequest, NextResponse } from 'next/server';
import { getPublicJwk } from '@/lib/keys'; // Adjust this path if necessary
import { importJWK, jwtVerify } from 'jose';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body to get the token
    const { token } = await req.json();

    if (!token) {
      return new NextResponse('No token provided in the request body', { status: 400 });
    }

    // Get the public JWK and convert it to a key object
    const publicJwk = await getPublicJwk();
    const publicKey = await importJWK(publicJwk, 'RS256');

    const { payload } = await jwtVerify(token, publicKey)

    return new NextResponse(JSON.stringify(payload), { status: 200 });
  } catch (error) {
    console.error('Error during token validation:', error);
  }

  return new NextResponse('Error during token validation', { status: 500 });
}