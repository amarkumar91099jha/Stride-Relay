import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ChannelBreakdownProps {
    breakdown: {
        whatsapp: number;
        email: number;
        copy: number;
        native: number;
    };
}

const CHANNEL_COLORS: Record<string, string> = {
    WhatsApp: "#25d366",
    Email: "#6366f1",
    "Copy Link": "#f59e0b",
    "Native Share": "#8b5cf6",
};

export function ChannelBreakdown({ breakdown }: ChannelBreakdownProps) {
    const data = [
        { name: "WhatsApp", value: breakdown.whatsapp },
        { name: "Email", value: breakdown.email },
        { name: "Copy Link", value: breakdown.copy },
        { name: "Native Share", value: breakdown.native },
    ].filter((d) => d.value > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Channel Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={50}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
