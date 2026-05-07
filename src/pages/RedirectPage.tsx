import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export function RedirectPage() {
    const { trackingToken } = useParams<{ trackingToken: string }>();
    const [searchParams] = useSearchParams();
    const jobUrl = searchParams.get("url");

    useEffect(() => {
        // If a URL is provided, redirect to it
        if (jobUrl) {
            window.location.href = jobUrl;
            return;
        }

        // Otherwise redirect to shine.com search
        if (trackingToken) {
            window.location.href = `https://www.shine.com`;
        }
    }, [trackingToken, jobUrl]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <p className="text-muted-foreground">Redirecting to shine.com...</p>
            </div>
        </div>
    );
}
