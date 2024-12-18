'use client';

import { useState, useEffect } from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CrawlerPage() {
  const defaultAgentClaim = process.env.NEXT_PUBLIC_AGENT_URL || window.location.hostname;

  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [headers, setHeaders] = useState<Record<string,string> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [targetOriginClaim, setTargetOriginClaim] = useState('')
  const [agentClaim, setAgentClaim] = useState(defaultAgentClaim)
  const [bypassCache, setBypassCache] = useState(false)
  const [jwt, setJwt] = useState(localStorage.getItem('jwt') || '')
  const [showHeaders, setShowHeaders] = useState(searchParams.get('headers') === 'true')
  const [resetJwt, setResetJwt] = useState(false)

  let claims: {
    agent?: string;
    targetOrigin?: string;
    exp?: number;
  } = {}
  if (jwt) {
    // decode claims
    claims = JSON.parse(atob(jwt.split('.')[1]));
    console.log(claims)
  }

  const router = useRouter();
  const pathname = usePathname();
  const trace = searchParams.get('trace') === 'true';

  useEffect(() => {
    console.log('here')
    // Extract the URL from the path only once when the component mounts
    const pathParts = pathname.split('/');
    const initialUrl = decodeURIComponent(pathParts[pathParts.length - 1]);

    // Check if the initial URL is valid and different from the current URL state
    if (initialUrl && initialUrl !== 'crawler' && url !== initialUrl) {
      setUrl(initialUrl);
      setTargetOriginClaim(initialUrl)
      crawlUrl(initialUrl, targetOriginClaim || initialUrl, agentClaim || defaultAgentClaim);
    }
  }, [pathname]); // Only run this effect when the pathname changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await crawlUrl(url, targetOriginClaim, agentClaim);
  };

  const crawlUrl = async (targetUrl: string, targetOriginClaim: string, agentClaim: string) => {
    if (loading || !targetUrl) return; // Prevent multiple concurrent requests
    setLinks([]);
    setHeaders(null);
    setError('');
    setLoading(true); // Set loading state to true

    if (resetJwt) {
      localStorage.removeItem('jwt');
    }

    const jwtParam = resetJwt ? '' : jwt
    try {
      const res = await fetch(`/api/crawl?trace=${trace}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl, agentClaim, targetOriginClaim, bypassCache, jwt: jwtParam }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setLinks(data.links || []);
      setHeaders(data.headers || null);
      setJwt(data.jwt || '');
      localStorage.setItem('jwt', data.jwt || '');
      setResetJwt(false);
      if (router && targetUrl !== url) {
        router.push(`/crawler/${encodeURIComponent(targetUrl)}?trace=${trace}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleLinkClick = async (link: string) => {
    setUrl(link);
    setTargetOriginClaim(link);
    await crawlUrl(link, targetOriginClaim, agentClaim);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast('Copied to clipboard');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto p-4">
        <span
          aria-controls="menu-:Rp6t6jlffb:"
          aria-expanded="false"
          aria-haspopup="true"
          className="logo-button_logo__krGFL inline-flex items-center mr-2"
          id="menu-button-:Rp6t6jlffbH1:"
          role="button"
        >
          <svg
            aria-label="Vercel Logo"
            fill="var(--geist-foreground)"
            viewBox="0 0 75 65"
            height="22"
          >
            <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
          </svg>
        </span>
        <h1 className="text-2xl font-bold mb-4 inline-flex items-center">Crawler</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="border border-gray-300 p-4 rounded mb-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">URL to crawl:</h2>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Token</h1>
          <div className="border border-gray-300 p-4 rounded mb-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Claims</h2>
            {claims?.exp && (<h3 className="mb-4">Expiration: <span
              className="test-sm text-gray-500">{new Date(claims?.exp * 1000).toLocaleString()}</span></h3>)}
            <label className="block mb-2">
              Agent:
              <input
                type="url"
                value={agentClaim}
                onChange={(e) => setAgentClaim(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {claims?.agent && <span className="text-sm text-gray-500">{claims?.agent}</span>}
            </label>
            <label className="block mb-2">
              Target Origin:
              <input
                type="url"
                value={targetOriginClaim}
                onChange={(e) => setTargetOriginClaim(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {claims?.targetOrigin && <span className="text-sm text-gray-500">{claims?.targetOrigin}</span>}
            </label>

            <label className="inline-flex items-center mt-4 mr-4">
              Regenerate:
              <input
                type="checkbox"
                checked={resetJwt}
                onChange={(e) => setResetJwt(e.target.checked)}
                className="ml-2"
                disabled={jwt === ''}
              />
            </label>
            <label className="inline-flex items-center mt-4">
              Force Revalidate:
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={(e) => setBypassCache(e.target.checked)}
                className="ml-2"
              />
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Crawl
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCopy(jwt)
            }}
            className="bg-blue-500 text-white mx-2 px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Copy Token
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              setShowHeaders(!showHeaders)
            }}
            className="bg-blue-500 text-white mx-2 px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {showHeaders ? 'Hide Headers' : 'Show Headers'}
          </button>
        </form>

        {loading && (
          <div className="flex justify-center items-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2">Crawling...</span>
          </div>
        )}

        {showHeaders && headers && !loading && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Response Headers</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              {Object.entries(headers).map(([key, value], index) => (
                <li key={index}>
                  <strong>{key}:</strong>
                  <span onClick={() => handleCopy(value)}
                        className="cursor-pointer text-blue-600 hover:underline"
                  >
                  {value}
                </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {links.length > 0 && !loading && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Extracted Links</h2>
            <ul className="list-disc pl-5 space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link);
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mt-4">
            <h2 className="font-bold">Error</h2>
            <pre>{error}</pre>
          </div>
        )}

        <ToastContainer/>
      </div>
    </div>
  );
}