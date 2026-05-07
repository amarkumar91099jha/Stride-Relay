export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const shinePath = url.pathname.replace(/^\/api\/shine/, '');
  const targetUrl = `https://www.shine.com/api${shinePath}${url.search}`;

  const response = await fetch(targetUrl, {
    method: req.method,
    cache: 'no-store',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.shine.com/',
      'Origin': 'https://www.shine.com',
      // Do NOT forward If-None-Match / If-Modified-Since so Shine always returns full body
    },
  });

  const body = await response.text();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}
