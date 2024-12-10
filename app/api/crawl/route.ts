import { NextRequest, NextResponse } from 'next/server';
import { getPrivateKey } from "@/lib/keys";
import jwt from 'jsonwebtoken';
import * as https from "node:https";
import * as cheerio from "cheerio";
import fetch from 'node-fetch';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = '76.76.21.201'; // Substitute with your target IP address
  const host = 'vercel.com'; // Substitute with your target hostname

  const agent = new https.Agent({
    lookup: (hostname, options, callback) => {
      if (hostname === host) {
        callback(null, ip, 4); // Force resolve to the specified IP
      } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('dns').lookup(hostname, options, callback); // Default DNS resolution
      }
    }
  });

  try {
    // Parse the request body
    const { url } = await req.json();

    if (!url) {
      return new NextResponse('No URL provided in the request body', { status: 400 });
    }

    const parsedUrl = new URL(url);

    // Define the headers
    const xAgent = process.env.VERCEL_URL || 'http://localhost:3000';
    const xAgentToken = jwt.sign({ agent: xAgent, targetOrigin: `${parsedUrl.protocol}//${parsedUrl.hostname}` }, getPrivateKey(), { algorithm: 'RS256', expiresIn: '2h' });

    // Make the request to the provided URL
    const response = await fetch(url, {
      agent,
      method: 'GET',
      headers: {
        Host: parsedUrl.hostname,
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