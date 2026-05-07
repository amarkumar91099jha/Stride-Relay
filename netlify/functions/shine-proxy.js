exports.handler = async (event) => {
    // Netlify injects the original path before the redirect
    const originalPath = event.headers["x-netlify-original-pathname"] || event.path;
    const shinePath = originalPath.replace(/^\/api\/shine/, "");
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const shineUrl = `https://www.shine.com/api${shinePath}${query}`;
    console.log("[shine-proxy] fetching:", shineUrl);

    try {
        const response = await fetch(shineUrl, {
            method: event.httpMethod,
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
        });

        const body = await response.text();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body,
        };
    } catch (err) {
        return {
            statusCode: 502,
            body: JSON.stringify({ error: "Proxy error", detail: String(err) }),
        };
    }
};
