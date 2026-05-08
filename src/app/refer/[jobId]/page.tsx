import { Suspense } from "react";
import { ReferralPage } from "@/views/ReferralPage";

export default async function Page({
    params,
}: {
    params: Promise<{ jobId: string }>;
}) {
    const { jobId } = await params;
    return (
        <Suspense>
            <ReferralPage jobId={jobId} />
        </Suspense>
    );
}
