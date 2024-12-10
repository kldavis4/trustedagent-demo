'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function CrawlerPage() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Extract the URL from the path only once when the component mounts
    const pathParts = pathname.split('/');
    const initialUrl = decodeURIComponent(pathParts[pathParts.length - 1]);

    // Check if the initial URL is valid and different from the current URL state
    if (initialUrl && initialUrl !== 'crawler' && url !== initialUrl) {
      setUrl(initialUrl);
      crawlUrl(initialUrl);
    }
  }, [pathname]); // Only run this effect when the pathname changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await crawlUrl(url);
  };

  const crawlUrl = async (targetUrl: string) => {
    if (loading || !targetUrl) return; // Prevent multiple concurrent requests
    setLinks([]);
    setError('');
    setLoading(true); // Set loading state to true

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setLinks(data.links || []);
      if (router && targetUrl !== url) {
        router.push(`/crawler/${encodeURIComponent(targetUrl)}`);
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
    await crawlUrl(link);
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crawler</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block mb-2">
          URL to crawl:
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </label>
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
    </div>
  );
}