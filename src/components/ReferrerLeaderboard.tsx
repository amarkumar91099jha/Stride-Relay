import type { Referral } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface ReferrerLeaderboardProps {
    referrals: Referral[];
}

function getTier(count: number): { label: string; color: string } {
    if (count >= 10) return { label: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (count >= 5) return { label: "Silver", color: "bg-gray-100 text-gray-800" };
    return { label: "Bronze", color: "bg-amber-100 text-amber-800" };
}

export function ReferrerLeaderboard({ referrals }: ReferrerLeaderboardProps) {
    // Aggregate by referrer
    const referrerMap = new Map<string, { count: number; applied: number; viewed: number }>();
    for (const r of referrals) {
        const existing = referrerMap.get(r.referrerName) ?? { count: 0, applied: 0, viewed: 0 };
        existing.count++;
        if (r.status === "applied" || r.status === "viewed") existing.applied++;
        if (r.status === "viewed") existing.viewed++;
        referrerMap.set(r.referrerName, existing);
    }

    const leaderboard = [...referrerMap.entries()]
        .map(([name, stats]) => ({
            name,
            ...stats,
            points: stats.applied * 50 + stats.viewed * 100,
        }))
        .sort((a, b) => b.points - a.points);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Referrer Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No referrals yet</p>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => {
                            const tier = getTier(entry.count);
                            return (
                                <div
                                    key={entry.name}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                                >
                                    <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                                        #{index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {entry.count} referrals · {entry.applied} applied · {entry.viewed} viewed
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-brand">{entry.points} pts</p>
                                        <Badge variant="outline" className={`text-[10px] ${tier.color}`}>
                                            {tier.label}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
