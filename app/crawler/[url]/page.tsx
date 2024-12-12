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

  const router = useRouter();
  const pathname = usePathname();
  const showHeaders = searchParams.get('headers') === 'true';
  const trace = searchParams.get('trace') === 'true';

  useEffect(() => {
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

    try {
      const res = await fetch(`/api/crawl?trace=${trace}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl, agentClaim, targetOriginClaim, bypassCache }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setLinks(data.links || []);
      setHeaders(data.headers || null);
      if (router && targetUrl !== url) {
        router.push(`/crawler/${encodeURIComponent(targetUrl)}?headers=${showHeaders}&trace=${trace}`);
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crawler</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="border border-gray-300 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">URL to crawl:</h2>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="border border-gray-300 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">Claims</h2>
          <label className="block mb-2">
            Agent:
            <input
              type="url"
              value={agentClaim}
              onChange={(e) => setAgentClaim(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
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
          </label>
          <label className="block mt-4">
            Bypass Claims Cache:
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

      <ToastContainer />
    </div>
  );
}