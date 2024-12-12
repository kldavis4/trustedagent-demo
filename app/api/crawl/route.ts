import { NextRequest, NextResponse } from 'next/server';
import { getPrivateKey } from "@/lib/keys";
import jwt from 'jsonwebtoken';
import * as cheerio from "cheerio";
import axios from "axios";

axios.defaults.proxy = {
  host: process.env.PROXY_IP || '76.76.21.108', // The IP of your proxy server
  port: 443,            // The port your proxy server listens on
  protocol: 'https',    // Use 'http' or 'https' based on your proxy server
};

const stripPath = (url: string) => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
}

const withProtocol = (url: string) => {
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const { url, targetOriginClaim, agentClaim, bypassCache } = await req.json();

    if (!url) {
      return new NextResponse('No URL provided in the request body', { status: 400 });
    }

    const parsedUrl = new URL(url);

    // check if trace parameter is set on the request
    const { searchParams } = new URL(req.url);
    const trace = searchParams.get('trace');

    // Define the headers
    const xAgent = withProtocol(agentClaim || process.env.AGENT_URL || process.env.VERCEL_URL || 'http://localhost:3000');

    const xAgentToken = jwt.sign({
      agent: stripPath(withProtocol(xAgent)),
      targetOrigin: stripPath(withProtocol(targetOriginClaim || `${parsedUrl.protocol}//${parsedUrl.hostname}`)) },
      getPrivateKey(), { algorithm: 'RS256', expiresIn: '2h' }
    );

    const headers: Record<string,string> = {
      'x-agent': xAgent,
      'x-agent-token': xAgentToken,
    }

    if (trace === 'true') {
      headers['x-vercel-debug-proxy-timing'] = '1';
    }

    if (bypassCache) {
      headers['x-agent-bypass-cache'] = '1';
    }

    const response = await axios.get(url, { headers });

    const html = response.data;

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
    return new NextResponse(JSON.stringify({ links, headers: response.headers }), { status: response.status });
  } catch (error) {
    console.error('Error during crawling:', error);
    return new NextResponse('Error during crawling', { status: 500 });
  }
}