export default async function handler(req, res) {
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join("/") : path || "";
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const targetUrl = `https://www.shine.com/api/${pathStr}${query}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.shine.com/",
    "Origin": "https://www.shine.com",
  };

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
  });

  const contentType = upstream.headers.get("content-type") || "application/json";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(upstream.status);

  const text = await upstream.text();
  res.send(text);
}
