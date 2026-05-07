"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCampaign, getAnalytics, getReferrals } from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferralFunnel } from "@/components/ReferralFunnel";
import { ChannelBreakdown } from "@/components/ChannelBreakdown";
import { ReferrerLeaderboard } from "@/components/ReferrerLeaderboard";
import { ReferralTable } from "@/components/ReferralTable";
import { Users, MousePointerClick, FileCheck2, Eye, ArrowLeft } from "lucide-react";

export function CampaignDetailPage({ campaignId }: { campaignId: string }) {

    const { data: job, isLoading: loadingJob } = useQuery({
        queryKey: ["dashboardJob", campaignId],
        queryFn: () => getCampaign(campaignId!),
        enabled: !!campaignId,
    });

    const { data: analytics, isLoading: loadingAnalytics } = useQuery({
        queryKey: ["analytics", campaignId],
        queryFn: () => getAnalytics(campaignId!),
        enabled: !!campaignId,
    });

    const { data: referrals } = useQuery({
        queryKey: ["referrals", campaignId],
        queryFn: () => getReferrals(campaignId!),
        enabled: !!campaignId,
    });

    const isLoading = loadingJob || loadingAnalytics;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!job || !analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No referral data found for this job</p>
            </div>
        );
    }

    const statCards = [
        { label: "Total Referrals", value: analytics.totalReferrals, icon: Users, color: "text-blue-600" },
        { label: "Unique Clicks", value: analytics.uniqueClicks, icon: MousePointerClick, color: "text-amber-600" },
        { label: "Applications", value: analytics.applications, icon: FileCheck2, color: "text-green-600" },
        { label: "Profiles Viewed", value: analytics.profilesViewed, icon: Eye, color: "text-purple-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Link to="/dashboard/campaigns" className="mt-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">{job.jobTitle}</h1>
                    <p className="text-muted-foreground text-sm">
                        {job.company}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts & Data */}
            <Tabs defaultValue="funnel" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="funnel">Funnel</TabsTrigger>
                    <TabsTrigger value="channels">Channels</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="referrals">Referrals</TabsTrigger>
                </TabsList>

                <TabsContent value="funnel">
                    <ReferralFunnel funnel={analytics.funnel} />
                </TabsContent>

                <TabsContent value="channels">
                    <ChannelBreakdown breakdown={analytics.channelBreakdown} />
                </TabsContent>

                <TabsContent value="leaderboard">
                    <ReferrerLeaderboard referrals={referrals ?? []} />
                </TabsContent>

                <TabsContent value="referrals">
                    <ReferralTable referrals={referrals ?? []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
