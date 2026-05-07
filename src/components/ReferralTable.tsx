import type { Referral } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ReferralTableProps {
    referrals: Referral[];
}

const statusColors: Record<Referral["status"], string> = {
    sent: "bg-gray-100 text-gray-800",
    clicked: "bg-blue-100 text-blue-800",
    applied: "bg-green-100 text-green-800",
    viewed: "bg-purple-100 text-purple-800",
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ReferralTable({ referrals }: ReferralTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Referrals</CardTitle>
            </CardHeader>
            <CardContent>
                {referrals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No referrals yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referrer</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.map((referral) => {
                                    const lastDate = referral.viewedAt ?? referral.appliedAt ?? referral.clickedAt ?? referral.createdAt;
                                    return (
                                        <TableRow key={referral.id}>
                                            <TableCell className="font-medium">{referral.referrerName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {referral.channel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={statusColors[referral.status]}>
                                                    {referral.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(referral.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(lastDate)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
