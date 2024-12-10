import { NextRequest, NextResponse } from 'next/server';
import { getPrivateKey } from "@/lib/keys";
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('cheerio');

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const { url } = await req.json();

    if (!url) {
      return new NextResponse('No URL provided in the request body', { status: 400 });
    }

    const parsedUrl = new URL(url);
    console.log(getPrivateKey())

    // Define the headers
    const xAgent = process.env.VERCEL_URL || 'http://localhost:3000';
    const xAgentToken = jwt.sign({ agent: xAgent, targetOrigin: `${parsedUrl.protocol}//${parsedUrl.hostname}` }, getPrivateKey(), { algorithm: 'RS256', expiresIn: '2h' });

    // Make the request to the provided URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-agent': xAgent,
        'x-agent-token': xAgentToken,
      },
    });

    // Get the HTML content
    const html = await response.text();

    // Parse the HTML and extract URLs
    const $ = cheerio.load(html);
    const links: string[] = [];
    $('a[href]').each((_: number, element: cheerio.Element) => {
      const href = $(element).attr('href');
      if (href) {
        // Convert relative links to absolute links
        const absoluteUrl = new URL(href, url).toString();
        links.push(absoluteUrl);
      }
    });

    // Return the response data
    return new NextResponse(JSON.stringify({ links }), { status: response.status });
  } catch (error) {
    console.error('Error during crawling:', error);
    return new NextResponse('Error during crawling', { status: 500 });
  }
}