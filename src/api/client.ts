import type { Referral, CampaignAnalytics, ReferrerReward, ShineJob } from "@/types";
import { mockRewards } from "@/mocks/data";
import { buildReferralUrl } from "@/lib/share";
import type { ShareChannel } from "@/lib/share";
import {
    addReferral,
    getReferralsByJob,
    getReferralsByCandidateId,
    getDashboardJobs,
    computeAnalytics,
} from "@/lib/referralStore";
import type { DashboardJob } from "@/lib/referralStore";

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const JOB_TYPE_MAP: Record<number, string> = {
    1: "Full-time",
    2: "Part-time",
    3: "Contract",
    4: "Internship",
};

function formatSalary(minSalary?: string, maxSalary?: string, jSal?: string): string {
    if (minSalary && maxSalary) {
        const min = Number(minSalary);
        const max = Number(maxSalary);
        if (min > 0 && max > 0) {
            const formatVal = (v: number) =>
                v >= 100000 ? `₹${(v / 100000).toFixed(1).replace(/\.0$/, "")}L` : `₹${v.toLocaleString("en-IN")}`;
            return `${formatVal(min)} - ${formatVal(max)} per annum`;
        }
    }
    return jSal || "Not Disclosed";
}

function extractRequirements(jdHtml: string): string[] {
    const requirements: string[] = [];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let match;
    while ((match = liRegex.exec(jdHtml)) !== null) {
        const text = match[1].replace(/<[^>]+>/g, "").trim();
        if (text) requirements.push(text);
    }
    return requirements;
}

function stripHtml(html: string): string {
    return html
        .replace(/<\/?(p|div|br|h[1-6])[^>]*>/gi, "\n")
        .replace(/<\/?(ul|ol|li)[^>]*>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function getJobDescription(jobId: string): Promise<ShineJob> {
    const res = await fetch(`/api/shine/v2/search/job-description/${jobId}/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Job ${jobId} not found`);
    const data = await res.json();
    const job = data.results?.[0];
    if (!job) throw new Error(`Job ${jobId} not found`);

    return {
        id: job.id,
        jobTitle: job.jJT || "Untitled Position",
        company: job.jCName || "Unknown Company",
        location: Array.isArray(job.jLoc) ? job.jLoc.join(", ") : (job.jLoc || ""),
        salaryRange: formatSalary(job.min_salary, job.max_salary, job.jSal),
        jobType: JOB_TYPE_MAP[job.jJobType] || "Full-time",
        experience: job.jExp || "",
        description: stripHtml(job.jJD || job.jCD || ""),
        requirements: extractRequirements(job.jJD || ""),
        shineJobUrl: `https://www.shine.com/jobs/${job.jSlug}`,
        slug: job.jSlug || "",
        keywords: job.jKwds ? job.jKwds.split(", ").filter(Boolean) : [],
        postedDate: job.jPDate || "",
        expiryDate: job.jExpDate || "",
    };
}

export async function getCampaign(campaignId: string): Promise<DashboardJob | undefined> {
    const jobs = await getDashboardJobs();
    return jobs.find((j) => j.jobId === campaignId);
}

export async function getCampaigns(): Promise<DashboardJob[]> {
    return getDashboardJobs();
}

export async function createReferral(data: {
    jobId: string;
    jobTitle: string;
    company: string;
    shineJobUrl: string;
    referrerName: string;
    candidateId: string;
    refereePhone: string;
    refereeName: string;
    channel: ShareChannel;
    campaignSlug: string;
}): Promise<Referral> {
    const trackingUrl = buildReferralUrl(
        data.shineJobUrl,
        data.channel,
        data.campaignSlug,
        data.candidateId,
        data.refereePhone,
    );

    return addReferral({
        ...data,
        trackingUrl,
    });
}

export async function getReferrals(jobId: string): Promise<Referral[]> {
    return getReferralsByJob(jobId);
}

export async function getMyReferrals(candidateId: string): Promise<Referral[]> {
    return getReferralsByCandidateId(candidateId);
}

export async function getAnalytics(jobId: string): Promise<CampaignAnalytics> {
    return computeAnalytics(jobId);
}

export async function getRewards(referrerId: string): Promise<ReferrerReward> {
    await delay();
    const reward = mockRewards[referrerId];
    if (!reward) throw new Error(`Rewards not found for referrer ${referrerId}`);
    return reward;
}
