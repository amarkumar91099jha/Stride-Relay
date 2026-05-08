"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Megaphone, Menu } from "lucide-react";

const navItems = [
    { to: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    return (
        <nav className="space-y-1 py-4">
            {navItems.map((item) => (
                <Link
                    key={item.to}
                    href={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${pathname.startsWith(item.to)
                            ? "bg-brand text-white"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Mobile menu */}
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetTitle className="px-4 pt-4 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">SR</span>
                                </div>
                                Stride Relay
                            </SheetTitle>
                            <Sidebar onNavigate={() => setSidebarOpen(false)} />
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SR</span>
                        </div>
                        <span className="font-heading font-semibold text-lg">Stride Relay</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Admin Dashboard</span>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden md:block w-56 border-r min-h-[calc(100vh-57px)] bg-white">
                    <Sidebar />
                </aside>

                {/* Main content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
