import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ReferralFunnelProps {
    funnel: {
        sent: number;
        clicked: number;
        applied: number;
        viewed: number;
    };
}

const COLORS = ["#6366f1", "#818cf8", "#25d366", "#10b981"];

export function ReferralFunnel({ funnel }: ReferralFunnelProps) {
    const data = [
        { name: "Sent", value: funnel.sent },
        { name: "Clicked", value: funnel.clicked },
        { name: "Applied", value: funnel.applied },
        { name: "Viewed", value: funnel.viewed },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Referral Funnel</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={70} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
                    {data.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                            {item.name}: {item.value}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
