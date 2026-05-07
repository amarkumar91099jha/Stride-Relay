import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getJobDescription, createReferral, getMyReferrals } from "@/api/client";
import { buildReferralUrl } from "@/lib/share";
import type { ShareChannel } from "@/lib/share";
import { shareViaWhatsApp, shareViaEmail, copyToClipboard, shareNative } from "@/lib/share";
import { toast } from "sonner";
import {
    ChevronLeft, ChevronRight, Sun, Moon, X,
    User, Phone, CheckCircle2, Plus
} from "lucide-react";

export function ReferralPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const [searchParams] = useSearchParams();
    const candidateId = searchParams.get("candidateId") ?? "";
    const campaignSlug = searchParams.get("campaign") ?? "referral";
    const [refereeName, setRefereeName] = useState("");
    const [refereePhone, setRefereePhone] = useState("");
    const [messageTemplate, setMessageTemplate] = useState("");
    const [shared, setShared] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<"earn" | "works">("earn");
    const [showSheet, setShowSheet] = useState(false);
    const [darkTheme, setDarkTheme] = useState(() => {
        try { return localStorage.getItem("relay-theme") !== "light"; } catch { return true; }
    });

    const { data: job, isLoading, error } = useQuery({
        queryKey: ["job", jobId],
        queryFn: () => getJobDescription(jobId!),
        enabled: !!jobId,
    });

    const { data: myReferrals = [], refetch: refetchReferrals } = useQuery({
        queryKey: ["myReferrals", candidateId],
        queryFn: () => getMyReferrals(candidateId),
        enabled: !!candidateId,
    });

    const stats = {
        shared: myReferrals.length,
        shortlisted: myReferrals.filter(r => r.status === "clicked" || r.status === "applied" || r.status === "viewed").length,
        hired: myReferrals.filter(r => r.status === "viewed").length,
        earned: myReferrals.filter(r => r.status === "clicked" || r.status === "applied" || r.status === "viewed").length * 500
            + myReferrals.filter(r => r.status === "viewed").length * 5000,
    };

    const previewUrl = job && candidateId
        ? buildReferralUrl(job.shineJobUrl, "whatsapp", campaignSlug, candidateId, refereePhone.trim())
        : "";

    const defaultTemplate = job
        ? `Hey{{name}}! Check out this ${job.jobTitle} role at ${job.company}. I think you'd be a great fit. Apply here: {{link}}`
        : "";

    if (!messageTemplate && defaultTemplate) {
        setMessageTemplate(defaultTemplate);
    }

    const resolveMessage = (channel: ShareChannel): string => {
        if (!job || !candidateId) return messageTemplate;
        const url = buildReferralUrl(job.shineJobUrl, channel, campaignSlug, candidateId, refereePhone.trim());
        return messageTemplate
            .replace("{{name}}", refereeName.trim() ? ` ${refereeName.trim()}` : "")
            .replace("{{link}}", url);
    };

    const handleShare = async (channel: ShareChannel) => {
        if (!job || !candidateId) return;

        if (channel === "whatsapp") shareViaWhatsApp(resolveMessage("whatsapp"));
        else if (channel === "email") shareViaEmail(`${job.jobTitle} at ${job.company} - Job Referral`, resolveMessage("email"));
        else if (channel === "copy") {
            const ok = await copyToClipboard(previewUrl);
            if (ok) toast.success("Referral link copied!");
            else { toast.error("Failed to copy link"); return; }
        } else if (channel === "native") {
            await shareNative({ title: `${job.jobTitle} at ${job.company}`, text: resolveMessage("native"), url: previewUrl });
        }

        try {
            await createReferral({
                jobId: jobId!,
                jobTitle: job.jobTitle,
                company: job.company,
                shineJobUrl: job.shineJobUrl,
                referrerName: refereeName.trim(),
                candidateId,
                refereePhone: refereePhone.trim(),
                refereeName: refereeName.trim(),
                channel,
                campaignSlug,
            });
            await refetchReferrals();
        } catch {
            // Persist silently fails if Supabase is unreachable
        }
        setShared(true);
        setShowSheet(false);
    };

    const filledSlots = myReferrals.length;

    /* ── Error states ── */
    if (!candidateId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-relay-bg p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-cream">Invalid Referral Link</h1>
                    <p className="text-relay-muted text-sm">This link is missing a candidate ID. Please use the link sent to you.</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-relay-bg p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-cream">Job Not Found</h1>
                    <p className="text-relay-muted text-sm">This job listing doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`min-h-screen bg-relay-cream lg:flex lg:items-center lg:justify-center lg:py-16 max-lg:bg-relay-bg${!darkTheme ? " relay-light" : ""}`}>
                {job && (
                    <Helmet>
                        <title>{job.jobTitle} at {job.company} - Refer via Stride Relay</title>
                        <meta property="og:title" content={`${job.jobTitle} at ${job.company}`} />
                        <meta property="og:description" content={job.description.slice(0, 160)} />
                        <meta property="og:type" content="website" />
                    </Helmet>
                )}

                {/* Phone bezel on desktop, full-screen on mobile */}
                <div className="
                w-full max-lg:min-h-screen
                lg:w-97.5 lg:min-h-211 lg:rounded-[44px] lg:border-[9px] lg:border-black lg:overflow-hidden relay-phone-bezel
                bg-relay-bg flex flex-col relative
            ">
                    {/* ── Status bar (desktop bezel only) ── */}
                    <div className="hidden lg:flex items-center justify-between px-7 pt-3 pb-1 text-cream/60 text-[13px] font-semibold">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                            {/* Signal */}
                            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5" opacity="0.4" /><rect x="4.5" y="5" width="3" height="7" rx="0.5" opacity="0.6" /><rect x="9" y="2" width="3" height="10" rx="0.5" opacity="0.8" /><rect x="13.5" y="0" width="3" height="12" rx="0.5" /></svg>
                            {/* WiFi */}
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.6a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z" transform="translate(0,-2)" /><path d="M4.7 8.6a4.7 4.7 0 016.6 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" transform="translate(0,-2)" /><path d="M1.8 5.7a9 9 0 0112.4 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" transform="translate(0,-2)" /></svg>
                            {/* Battery */}
                            <svg width="28" height="13" viewBox="0 0 28 13" fill="currentColor"><rect x="0" y="1" width="23" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" /><rect x="2" y="3" width="19" height="7" rx="1" opacity="0.6" /><rect x="24" y="4.5" width="2.5" height="4" rx="0.8" opacity="0.4" /></svg>
                        </div>
                    </div>

                    {/* ── App header ── */}
                    <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-relay-bg">
                        <button type="button" className="text-cream/30 hover:text-cream/60 transition-colors p-1">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-[15px] font-bold tracking-[0.02em] text-cream/90">
                            Stride Relay
                        </span>
                        <button
                            type="button"
                            onClick={() => setDarkTheme(d => {
                                const n = !d;
                                try { localStorage.setItem("relay-theme", n ? "dark" : "light"); } catch { }
                                return n;
                            })}
                            className="text-cream/30 hover:text-cream/60 transition-colors p-1"
                            aria-label="Toggle theme"
                        >
                            {darkTheme ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                        </button>
                    </header>

                    {/* ── Scrollable body ── */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="px-6 py-10 space-y-5 animate-pulse">
                                <div className="h-20 bg-relay-border rounded-2xl" />
                                <div className="h-40 bg-relay-border rounded-2xl" />
                            </div>
                        ) : job ? (
                            <div className="px-5 space-y-6">
                                {/* ── Hero ── */}
                                <section className="pt-4 pb-2">
                                    <h1
                                        className="text-[40px] leading-[0.95] font-extrabold text-cream  italic font-weight-800"
                                    >
                                        Know Someone<br />Good?
                                    </h1>
                                    <p className="mt-4 text-[14px] text-relay-muted leading-relaxed">
                                        Share this role with the right person and earn up to{" "}
                                        <span className="text-gold font-semibold">₹5,500</span>
                                        {" "}in rewards.
                                    </p>
                                </section>

                                {/* ── Role card ── */}
                                <section className="bg-relay-card rounded-2xl overflow-hidden border border-relay-border">
                                    {/* Gold accent stripe */}
                                    <div className="relative h-1">
                                        <div className="absolute top-0 left-4 w-8 h-1 bg-gold rounded-b-sm" style={{ transform: 'skewX(-20deg)' }} />
                                    </div>

                                    <div className="px-5 pt-5 pb-5 space-y-4">
                                        {/* Company row */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-relay-border-bright flex items-center justify-center shrink-0">
                                                <span className="text-cream/80 font-bold text-sm">
                                                    {job.company.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex items-center gap-2">
                                                <span className="text-[13px] font-medium text-cream/80">
                                                    {job.company}
                                                </span>
                                                {/* Verified badge */}
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <circle cx="7" cy="7" r="7" fill="#3B82F6" opacity="0.9" />
                                                    <path d="M4.5 7L6.2 8.7L9.5 5.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Job title */}
                                        <h2 className="text-[18px] font-bold text-cream leading-snug">
                                            {job.jobTitle}
                                        </h2>

                                        {/* Team / extra info */}
                                        <p className="text-[12px] text-relay-muted">
                                            {job.location}{job.jobType ? ` · ${job.jobType}` : ""}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {job.experience && (
                                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-relay-border/70 text-relay-muted font-medium">
                                                    {job.experience}
                                                </span>
                                            )}
                                            {job.salaryRange && (
                                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-relay-border/70 text-relay-muted font-medium">
                                                    ₹{job.salaryRange}
                                                </span>
                                            )}
                                            {job.jobType && (
                                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-relay-border/70 text-relay-muted font-medium">
                                                    {job.jobType}
                                                </span>
                                            )}
                                        </div>

                                        {/* Active + See full role */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="flex items-center gap-1.5 text-[11px] text-relay-green font-medium">
                                                <span className="h-1.5 w-1.5 rounded-full bg-relay-green relay-pulse" />
                                                Active
                                            </span>
                                            <button type="button"
                                                onClick={() => setShowDetails(!showDetails)}
                                                className="text-[12px] text-relay-muted flex items-center gap-0.5 hover:text-cream transition-colors"

                                            >
                                                See full role
                                                <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable description */}
                                    {showDetails && (
                                        <div className="px-5 pb-5 space-y-4 border-t border-relay-border pt-4">
                                            <p className="text-[13px] leading-[1.7] whitespace-pre-line text-cream/70">
                                                {job.description}
                                            </p>
                                            {job.requirements.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-relay-muted mb-2.5">Requirements</h3>
                                                    <ul className="text-[13px] text-cream/60 space-y-2">
                                                        {job.requirements.map((req, i) => (
                                                            <li key={i} className="flex items-start gap-2.5">
                                                                <span className="text-gold/60 mt-0.5 text-xs">▸</span>
                                                                {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* ── Invites section ── */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[13px] text-relay-muted">
                                            <span className="text-cream font-semibold">{filledSlots} invited</span>
                                        </p>
                                    </div>
                                    {/* Scrollable row — shows all real referrals + 1 empty prompt */}
                                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                        {myReferrals.map((referral, i) => {
                                            const name = referral.refereeName?.trim() || referral.referrerPhone || "";
                                            const initials = name
                                                ? name.split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                                                : "?";
                                            return (
                                                <div key={i} className="h-11.5 w-11.5 rounded-xl bg-gold flex items-center justify-center shrink-0">
                                                    <span className="text-relay-bg font-bold text-[13px]">
                                                        {initials}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {/* Always show one empty slot as CTA */}
                                        <div className="h-11.5 w-11.5 rounded-xl border border-dashed border-relay-border-bright flex items-center justify-center shrink-0">
                                            <Plus className="h-3.5 w-3.5 text-relay-dim stroke-[1.5]" />
                                        </div>
                                    </div>
                                </section>

                                {/* ── Tabbed card: How you earn / How it works ── */}
                                <section className="bg-relay-card rounded-2xl border border-relay-border overflow-hidden">
                                    {/* Segmented control */}
                                    <div className="p-1.5">
                                        <div className="flex bg-relay-canvas rounded-xl p-1">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("earn")}
                                                className={`flex-1 text-[12px] font-semibold py-2 rounded-lg transition-all ${activeTab === "earn"
                                                    ? "bg-relay-tab-active text-cream"
                                                    : "text-relay-muted hover:text-cream/60"
                                                    }`}

                                            >
                                                How you earn
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("works")}
                                                className={`flex-1 text-[12px] font-semibold py-2 rounded-lg transition-all ${activeTab === "works"
                                                    ? "bg-relay-tab-active text-cream"
                                                    : "text-relay-muted hover:text-cream/60"
                                                    }`}

                                            >
                                                How it works
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5">
                                        {activeTab === "earn" ? (
                                            /* ── Earn ladder ── */
                                            <div className="space-y-0">
                                                {/* Step 1: Shortlisted */}
                                                <div className="flex gap-4 py-4 border-b border-relay-border">
                                                    <div className="flex flex-col items-center pt-1">
                                                        <div className="h-2.5 w-2.5 rounded-full bg-relay-muted" />
                                                        <div className="flex-1 w-px bg-relay-border mt-1" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline justify-between">
                                                            <p className="text-[13px] text-cream/80 font-medium">Shortlisted</p>
                                                            <span
                                                                className="text-[22px] font-bold text-cream"

                                                            >
                                                                ₹500
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-relay-muted mt-0.5">
                                                            Paid when your friend is shortlisted
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 2: Hired */}
                                                <div className="flex gap-4 py-4 border-b border-relay-border">
                                                    <div className="flex flex-col items-center pt-1">
                                                        <div className="h-2.5 w-2.5 rounded-full bg-gold" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline justify-between">
                                                            <p className="text-[13px] text-cream/80 font-medium">Hired</p>
                                                            <span
                                                                className="text-[22px] font-bold text-gold"

                                                            >
                                                                ₹5,000
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-relay-muted mt-0.5">
                                                            Paid within 15 days of joining
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Total row */}
                                                <div className="flex items-baseline justify-between pt-4">
                                                    <p className="text-[12px] text-relay-muted font-medium uppercase tracking-wider">
                                                        Total per referral
                                                    </p>
                                                    <span
                                                        className="text-[28px] font-extrabold text-gold"

                                                    >
                                                        ₹5,500
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── How it works ── */
                                            <div className="space-y-0">
                                                {[
                                                    { step: "1", title: "Share the role", desc: "Send this job to a friend who'd be a great fit" },
                                                    { step: "2", title: "They apply", desc: "Your friend clicks the link and applies on Shine" },
                                                    { step: "3", title: "You earn", desc: "Get paid when they get shortlisted or hired" },
                                                ].map((item, i) => (
                                                    <div key={item.step} className={`flex gap-4 py-4 ${i < 2 ? "border-b border-relay-border" : ""}`}>
                                                        <div className="flex flex-col items-center pt-0.5">
                                                            <div className="h-6 w-6 rounded-full bg-relay-border-bright flex items-center justify-center">
                                                                <span className="text-[11px] font-bold text-cream/70">{item.step}</span>
                                                            </div>
                                                            {i < 2 && <div className="flex-1 w-px bg-relay-border mt-1" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[13px] text-cream/80 font-medium">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-[11px] text-relay-muted mt-0.5">
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* ── Stats grid ── */}
                                <section className="bg-relay-card rounded-2xl border border-relay-border overflow-hidden">
                                    <div className="grid grid-cols-4 gap-0">
                                        {[
                                            { value: String(stats.shared), label: "Shared" },
                                            { value: String(stats.shortlisted), label: "Shortlisted" },
                                            { value: String(stats.hired), label: "Hired" },
                                            { value: `₹${stats.earned.toLocaleString("en-IN")}`, label: "Earned" },
                                        ].map((stat, i) => (
                                            <div
                                                key={stat.label}
                                                className={`text-center py-4 px-1.5 ${i < 3 ? "border-r border-relay-border" : ""} ${i === 3 ? "bg-linear-to-b from-gold/8 to-transparent" : ""}`}
                                            >
                                                <p
                                                    className={`text-[22px] font-bold leading-none ${i === 3 ? "text-gold" : "text-cream"}`}

                                                >
                                                    {stat.value}
                                                </p>
                                                <p className="text-relay-muted text-[9px] tracking-[0.08em] uppercase mt-2 font-medium">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : null}
                    </div>

                    {/* ── Fixed footer ── */}
                    <div className="sticky bottom-0 z-20 bg-linear-to-t from-relay-bg via-relay-bg to-relay-bg/0 pt-10 pb-6 px-5">
                        <button
                            type="button"
                            onClick={() => setShowSheet(true)}
                            className="w-full h-13 rounded-2xl text-[#1a1408] font-extrabold text-[16px] tracking-[0.02em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] relay-btn-shine"

                        >
                            SEND TO A FRIEND
                        </button>
                        <p className="text-center text-[11px] text-relay-dim mt-3">
                            No signup needed for your friend
                        </p>
                    </div>

                    {/* ── Bottom sheet ── */}
                </div>
            </div>

            {/* ── Bottom sheet (fixed to viewport, outside scroll container) ── */}
            {showSheet && (
                <div className={`fixed inset-0 z-100 overflow-hidden${!darkTheme ? " relay-light" : ""}`}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 relay-sheet-backdrop"
                        onClick={() => setShowSheet(false)}
                    />
                    {/* Sheet pinned to bottom */}
                    <div className="absolute bottom-0 left-0 right-0 lg:w-97.5 lg:left-1/2 lg:-translate-x-1/2 bg-relay-card rounded-t-3xl border-t border-relay-border-bright px-6 pt-4 pb-8 space-y-5" style={{ animation: 'sheetSlideUp 0.3s cubic-bezier(0.32,0.72,0.24,1)' }}>
                        {/* Handle */}
                        <div className="flex justify-center">
                            <div className="w-10 h-1 rounded-full bg-relay-border-bright" />
                        </div>

                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-cream">
                                Share this role
                            </h3>
                            <button type="button" onClick={() => setShowSheet(false)} className="text-relay-muted hover:text-cream transition-colors p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Optional contact fields */}
                        <div className="space-y-2.5">
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-relay-muted" />
                                <input
                                    placeholder="Friend's name (optional)"
                                    value={refereeName}
                                    onChange={(e) => setRefereeName(e.target.value)}
                                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-relay-bg border border-relay-border text-cream placeholder:text-relay-dim text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 focus:border-gold/30 transition-all"

                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-relay-muted" />
                                <input
                                    placeholder="Friend's phone (optional)"
                                    value={refereePhone}
                                    onChange={(e) => setRefereePhone(e.target.value)}
                                    type="tel"
                                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-relay-bg border border-relay-border text-cream font-mono placeholder:text-relay-dim placeholder:font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 focus:border-gold/30 transition-all"

                                />
                            </div>
                        </div>

                        {/* Share options — share-list style */}
                        <div className="rounded-2xl border border-relay-border overflow-hidden">
                            {/* WhatsApp */}
                            <button
                                type="button"
                                onClick={() => handleShare("whatsapp")}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-relay-card active:bg-relay-border transition-colors"

                            >
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.14)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1FA851"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" /></svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[14px] font-medium text-cream">WhatsApp</p>
                                    <p className="text-[11.5px] text-relay-muted mt-0.5">Most people will open it here</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-relay-dim shrink-0" />
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-relay-border mx-0" />

                            {/* Email */}
                            <button
                                type="button"
                                onClick={() => handleShare("email")}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-relay-card active:bg-relay-border transition-colors"

                            >
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(234,67,53,0.12)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" fill="#EA4335" opacity="0.15" />
                                        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" stroke="#EA4335" strokeWidth="1.5" fill="none" />
                                        <path d="M2 6L12 13L22 6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[14px] font-medium text-cream">Email</p>
                                    <p className="text-[11.5px] text-relay-muted mt-0.5">Send via your email app</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-relay-dim shrink-0" />
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-relay-border mx-0" />

                            {/* Copy link */}
                            <button
                                type="button"
                                onClick={() => handleShare("copy")}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-relay-card active:bg-relay-border transition-colors"

                            >
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,179,57,0.12)' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8B339" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[14px] font-medium text-cream">Copy referral link</p>
                                    <p className="text-[11.5px] text-relay-muted mt-0.5">Paste it anywhere you like</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-relay-dim shrink-0" />
                            </button>
                        </div>

                        {shared && (
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-relay-green/10 border border-relay-green/20">
                                <CheckCircle2 className="h-4.5 w-4.5 text-relay-green" />
                                <span className="text-sm font-medium text-relay-green">Referral shared!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
