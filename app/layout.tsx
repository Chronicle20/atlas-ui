import type {Metadata} from "next";
import "./globals.css";
import {SidebarProvider} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"
import {ThemeProvider} from "next-themes";
import {ThemeToggle} from "@/components/theme-toggle";
import {SidebarToggle} from "@/components/sidebar-toggle";
import {TenantProvider} from "@/context/tenant-context";

export const metadata: Metadata = {
    title: "AtlasMS",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (

        <html lang="en" suppressHydrationWarning>
        <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TenantProvider>
                <SidebarProvider>
                    <AppSidebar/>
                    <main className="w-full flex min-h-svh flex-1 flex-col">
                        <div className="flex items-center h-12 justify-between px-2">
                            <SidebarToggle/>
                            <ThemeToggle/>
                        </div>
                        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
                            <div className="min-h-[100vh] flex-1 rounded-xl bg-sidebar md:min-h-min">
                                {children}
                            </div>
                        </div>
                    </main>
                </SidebarProvider>
            </TenantProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
