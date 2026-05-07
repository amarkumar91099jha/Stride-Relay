export type ShareChannel = "whatsapp" | "email" | "copy" | "native";

export function buildReferralUrl(
    shineJobUrl: string,
    channel: ShareChannel,
    campaignSlug: string,
    candidateId: string,
    refereePhone?: string,
): string {
    const url = new URL(shineJobUrl);
    url.searchParams.set("utm_source", "stride-relay");
    url.searchParams.set("utm_medium", channel);
    url.searchParams.set("utm_campaign", campaignSlug);
    url.searchParams.set("referral_code", `${channel}-${campaignSlug}-${candidateId}`);
    if (refereePhone) {
        url.searchParams.set("phone", refereePhone);
    }
    return url.toString();
}

export function shareViaWhatsApp(message: string): void {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener");
}

export function shareViaEmail(subject: string, body: string): void {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_self");
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

export async function shareNative(data: { title: string; text: string; url: string }): Promise<boolean> {
    if (!navigator.share) return false;
    try {
        await navigator.share(data);
        return true;
    } catch {
        return false;
    }
}

export function isContactPickerSupported(): boolean {
    return "contacts" in navigator && "ContactsManager" in window;
}

export async function pickContacts(): Promise<{ name: string; tel?: string; email?: string }[]> {
    if (!isContactPickerSupported()) return [];
    try {
        const props = ["name", "tel", "email"];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contacts = await (navigator as any).contacts.select(props, { multiple: true });
        return contacts.map((c: { name: string[]; tel?: string[]; email?: string[] }) => ({
            name: c.name?.[0] ?? "",
            tel: c.tel?.[0],
            email: c.email?.[0],
        }));
    } catch {
        return [];
    }
}
