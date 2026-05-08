import { Suspense } from "react";
import { RedirectPage } from "@/pages/RedirectPage";

export default async function Page({
    params,
}: {
    params: Promise<{ trackingToken: string }>;
}) {
    const { trackingToken } = await params;
    return (
        <Suspense>
            <RedirectPage trackingToken={trackingToken} />
        </Suspense>
    );
}
