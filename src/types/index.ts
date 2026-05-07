export interface Campaign {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    location: string;
    salaryRange: string;
    jobType: string;
    description: string;
    requirements: string[];
    shineJobUrl: string;
    campaignSlug: string;
    createdAt: string;
    status: "active" | "paused" | "closed";
}

export interface ShineJob {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    salaryRange: string;
    jobType: string;
    experience: string;
    description: string;
    requirements: string[];
    shineJobUrl: string;
    slug: string;
    keywords: string[];
    postedDate: string;
    expiryDate: string;
}

export interface Referral {
    id: string;
    campaignId: string;
    referrerName: string;
    candidateId: string;
    referrerPhone?: string;
    refereeName?: string;
    trackingUrl: string;
    channel: "whatsapp" | "email" | "copy" | "native";
    status: "sent" | "clicked" | "applied" | "viewed";
    createdAt: string;
    clickedAt?: string;
    appliedAt?: string;
    viewedAt?: string;
    jobTitle?: string;
    company?: string;
    shineJobUrl?: string;
    campaignSlug?: string;
}

export interface CampaignAnalytics {
    campaignId: string;
    totalReferrals: number;
    uniqueClicks: number;
    applications: number;
    profilesViewed: number;
    channelBreakdown: {
        whatsapp: number;
        email: number;
        copy: number;
        native: number;
    };
    funnel: {
        sent: number;
        clicked: number;
        applied: number;
        viewed: number;
    };
}

export interface ReferrerReward {
    referrerId: string;
    referrerName: string;
    totalPoints: number;
    tier: "bronze" | "silver" | "gold" | "platinum";
    referralCount: number;
    recentActivity: {
        description: string;
        points: number;
        date: string;
    }[];
}

export interface LeaderboardEntry {
    rank: number;
    referrerName: string;
    referralCount: number;
    points: number;
    tier: ReferrerReward["tier"];
}
