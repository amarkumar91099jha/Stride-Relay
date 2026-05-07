"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getCampaigns } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export function CampaignListPage() {
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ["campaigns"],
        queryFn: getCampaigns,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Referral Campaigns</h1>
                <p className="text-muted-foreground">
                    Manage and track your job referral campaigns
                </p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {campaigns?.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground text-lg">No referrals yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Share a job via the referral page to see data here.
                            </p>
                        </div>
                    ) : null}
                    {campaigns?.map((job) => (
                        <Link key={job.jobId} href={`/dashboard/campaigns/${job.jobId}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base">{job.jobTitle}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{job.company}</p>
                                        </div>
                                        <Badge variant="default" className="shrink-0">
                                            {job.totalReferrals} referral{job.totalReferrals !== 1 ? "s" : ""}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{job.totalReferrals} total referrals sent</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
