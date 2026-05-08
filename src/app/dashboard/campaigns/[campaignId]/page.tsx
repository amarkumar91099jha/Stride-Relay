import { Suspense } from "react";
import { CampaignDetailPage } from "@/views/CampaignDetailPage";

export default async function Page({
    params,
}: {
    params: Promise<{ campaignId: string }>;
}) {
    const { campaignId } = await params;
    return (
        <Suspense>
            <CampaignDetailPage campaignId={campaignId} />
        </Suspense>
    );
}
