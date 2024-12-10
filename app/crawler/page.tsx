'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CrawlerDefaultPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to a default URL when visiting /crawler
    const defaultUrl = 'https://vercel.com';
    router.replace(`/crawler/${encodeURIComponent(defaultUrl)}`);
  }, [router]);

  return null;
}