import type { Referral, CampaignAnalytics } from "@/types";
import type { ShareChannel } from "@/lib/share";
import { supabase } from "@/lib/supabase";

/* ── Supabase row ↔ Referral mapping ── */

interface ReferralRow {
    id: string;
    campaign_id: string;
    referrer_name: string;
    candidate_id: string;
    referrer_phone: string | null;
    referee_name: string | null;
    tracking_url: string;
    channel: string;
    status: string;
    created_at: string;
    clicked_at: string | null;
    applied_at: string | null;
    viewed_at: string | null;
    job_title: string | null;
    company: string | null;
    shine_job_url: string | null;
    campaign_slug: string | null;
}

function rowToReferral(r: ReferralRow): Referral {
    return {
        id: r.id,
        campaignId: r.campaign_id,
        referrerName: r.referrer_name,
        candidateId: r.candidate_id,
        referrerPhone: r.referrer_phone ?? undefined,
        refereeName: r.referee_name ?? undefined,
        trackingUrl: r.tracking_url,
        channel: r.channel as Referral["channel"],
        status: r.status as Referral["status"],
        createdAt: r.created_at,
        clickedAt: r.clicked_at ?? undefined,
        appliedAt: r.applied_at ?? undefined,
        viewedAt: r.viewed_at ?? undefined,
        jobTitle: r.job_title ?? undefined,
        company: r.company ?? undefined,
        shineJobUrl: r.shine_job_url ?? undefined,
        campaignSlug: r.campaign_slug ?? undefined,
    };
}

/* ── CRUD ── */

export async function getAllReferrals(): Promise<Referral[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch referrals:", error.message);
        return [];
    }
    return (data as ReferralRow[]).map(rowToReferral);
}

export async function addReferral(data: {
    jobId: string;
    jobTitle: string;
    company: string;
    shineJobUrl: string;
    referrerName: string;
    candidateId: string;
    refereePhone: string;
    refereeName: string;
    trackingUrl: string;
    channel: ShareChannel;
    campaignSlug: string;
}): Promise<Referral> {
    if (!supabase) throw new Error("Supabase not configured");
    const id = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const row = {
        id,
        campaign_id: data.jobId,
        referrer_name: data.referrerName,
        candidate_id: data.candidateId,
        referrer_phone: data.refereePhone,
        referee_name: data.refereeName,
        tracking_url: data.trackingUrl,
        channel: data.channel,
        status: "sent",
        created_at: new Date().toISOString(),
        job_title: data.jobTitle,
        company: data.company,
        shine_job_url: data.shineJobUrl,
        campaign_slug: data.campaignSlug,
    };

    const { data: inserted, error } = await supabase
        .from("referrals")
        .insert(row)
        .select()
        .single();

    if (error) throw new Error(`Failed to save referral: ${error.message}`);
    return rowToReferral(inserted as ReferralRow);
}

export async function getReferralsByJob(jobId: string): Promise<Referral[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("campaign_id", jobId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch referrals for job:", error.message);
        return [];
    }
    return (data as ReferralRow[]).map(rowToReferral);
}

export async function getReferralsByCandidateId(candidateId: string): Promise<Referral[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch referrals for candidate:", error.message);
        return [];
    }
    return (data as ReferralRow[]).map(rowToReferral);
}

export interface DashboardJob {
    jobId: string;
    jobTitle: string;
    company: string;
    shineJobUrl: string;
    campaignSlug: string;
    firstReferralAt: string;
    totalReferrals: number;
}

export async function getDashboardJobs(): Promise<DashboardJob[]> {
    const referrals = await getAllReferrals();
    const jobMap = new Map<string, DashboardJob>();

    for (const r of referrals) {
        const existing = jobMap.get(r.campaignId);
        if (existing) {
            existing.totalReferrals++;
            if (r.createdAt < existing.firstReferralAt) {
                existing.firstReferralAt = r.createdAt;
            }
        } else {
            jobMap.set(r.campaignId, {
                jobId: r.campaignId,
                jobTitle: r.jobTitle || `Job #${r.campaignId}`,
                company: r.company || "Unknown",
                shineJobUrl: r.shineJobUrl || "",
                campaignSlug: r.campaignSlug || "referral",
                firstReferralAt: r.createdAt,
                totalReferrals: 1,
            });
        }
    }

    return [...jobMap.values()].sort(
        (a, b) => new Date(b.firstReferralAt).getTime() - new Date(a.firstReferralAt).getTime(),
    );
}

export async function computeAnalytics(jobId: string): Promise<CampaignAnalytics> {
    const referrals = await getReferralsByJob(jobId);

    const channelBreakdown = { whatsapp: 0, email: 0, copy: 0, native: 0 };
    const funnel = { sent: 0, clicked: 0, applied: 0, viewed: 0 };

    for (const r of referrals) {
        channelBreakdown[r.channel]++;
        funnel.sent++;
        if (r.status === "clicked" || r.status === "applied" || r.status === "viewed") funnel.clicked++;
        if (r.status === "applied" || r.status === "viewed") funnel.applied++;
        if (r.status === "viewed") funnel.viewed++;
    }

    return {
        campaignId: jobId,
        totalReferrals: referrals.length,
        uniqueClicks: funnel.clicked,
        applications: funnel.applied,
        profilesViewed: funnel.viewed,
        channelBreakdown,
        funnel,
    };
}
