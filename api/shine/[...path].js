export default async function handler(req, res) {
    // req.query.path is Vercel's catch-all array, e.g. ['v2','search','job-description','18945512']
    const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path || ""];
    const pathStr = segments.filter(Boolean).join("/");

    // Preserve query string; always add trailing slash (Shine API requires it)
    const queryIndex = req.url ? req.url.indexOf("?") : -1;
    const queryStr = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    const targetUrl = `https://www.shine.com/api/${pathStr}/${queryStr}`;

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
