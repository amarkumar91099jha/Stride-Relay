import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shareViaWhatsApp, shareViaEmail, copyToClipboard, shareNative } from "@/lib/share";
import type { ShareChannel } from "@/lib/share";
import { toast } from "sonner";
import { MessageSquare, Mail, Copy, Share2, CheckCircle2 } from "lucide-react";

interface ShareActionsProps {
    resolveMessage: (channel: ShareChannel) => string;
    previewUrl: string;
    jobTitle: string;
    company: string;
    disabled: boolean;
    onShare: (channel: ShareChannel) => void;
    shared: boolean;
}

export function ShareActions({
    resolveMessage,
    previewUrl,
    jobTitle,
    company,
    disabled,
    onShare,
    shared,
}: ShareActionsProps) {
    const handleWhatsApp = () => {
        shareViaWhatsApp(resolveMessage("whatsapp"));
        onShare("whatsapp");
    };

    const handleEmail = () => {
        shareViaEmail(
            `${jobTitle} at ${company} - Job Referral`,
            resolveMessage("email"),
        );
        onShare("email");
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(previewUrl);
        if (success) {
            toast.success("Referral link copied to clipboard!");
            onShare("copy");
        } else {
            toast.error("Failed to copy link");
        }
    };

    const handleNativeShare = async () => {
        const success = await shareNative({
            title: `${jobTitle} at ${company}`,
            text: resolveMessage("native"),
            url: previewUrl,
        });
        if (success) {
            onShare("native");
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    Share This Job
                    {shared && <CheckCircle2 className="h-5 w-5 text-whatsapp" />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {disabled && (
                    <p className="text-sm text-muted-foreground mb-4">
                        Please enter the referee's phone number above to share.
                    </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={handleWhatsApp}
                        disabled={disabled}
                        className="bg-whatsapp hover:bg-whatsapp-dark text-white h-12"
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        WhatsApp
                    </Button>
                    <Button
                        onClick={handleEmail}
                        disabled={disabled}
                        variant="outline"
                        className="h-12"
                    >
                        <Mail className="h-5 w-5 mr-2" />
                        Email
                    </Button>
                    <Button
                        onClick={handleCopy}
                        disabled={disabled}
                        variant="outline"
                        className="h-12"
                    >
                        <Copy className="h-5 w-5 mr-2" />
                        Copy Link
                    </Button>
                    {"share" in navigator && (
                        <Button
                            onClick={handleNativeShare}
                            disabled={disabled}
                            variant="outline"
                            className="h-12"
                        >
                            <Share2 className="h-5 w-5 mr-2" />
                            More
                        </Button>
                    )}
                </div>
                {shared && (
                    <p className="text-sm text-whatsapp mt-3 text-center font-medium">
                        Referral shared successfully!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
