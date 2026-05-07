import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";

interface MessageCustomizerProps {
    message: string;
    onChange: (message: string) => void;
    previewUrl: string;
    jobTitle: string;
    company: string;
}

export function MessageCustomizer({ message, onChange, previewUrl }: MessageCustomizerProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customize Your Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    value={message}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    placeholder="Write a personal message to share with the job link..."
                    className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                    Use <code className="bg-muted px-1 rounded">{"{{name}}"}</code> for the referee's name and{" "}
                    <code className="bg-muted px-1 rounded">{"{{link}}"}</code> for the referral link.
                </p>
                {previewUrl && (
                    <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Link2 className="h-3 w-3" />
                            Generated Referral Link (preview)
                        </label>
                        <Input value={previewUrl} readOnly className="text-xs bg-muted font-mono" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
