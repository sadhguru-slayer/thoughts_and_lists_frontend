"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun, Plus, Settings, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/journals", label: "Journals" },
    { href: "/tasks", label: "Tasks" },
    { href: "/thoughts", label: "Notes" },
];

function isJournalActive(pathname) {
    if (pathname === "/journals" || pathname === "/journals/write") return true;
    if (pathname.match(/^\/journals\/\d+/)) return true;
    // Legacy paths still count as active during redirect
    if (pathname === "/create") return true;
    if (pathname.match(/^\/\d+$/)) return true;
    return false;
}

export default function Header() {
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const isThoughts = pathname.startsWith("/thoughts");
    const isTasks = pathname.startsWith("/tasks");
    const isCreate = pathname === "/journals/write" || pathname === "/create";
    const isJournal = isJournalActive(pathname);

    const navActive = (item) => {
        if (item.href === "/dashboard") return pathname === "/dashboard";
        if (item.href === "/journals") return isJournal;
        if (item.href === "/thoughts") return isThoughts;
        if (item.href === "/tasks") return isTasks;
        return pathname.startsWith(item.href);
    };

    return (
        <header className="sticky top-0 z-50 shrink-0 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
                    >
                        <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <Image
                                src="/light_theme_logo.jpeg"
                                alt="Memo"
                                fill
                                sizes="32px"
                                className="object-cover scale-[1.06]"
                                priority
                            />
                        </div>
                        <span className="hidden sm:block text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Memo
                        </span>
                    </Link>

                    {user && (
                        <nav className="hidden sm:flex items-center gap-1">
                            {NAV_ITEMS.map((item) => {
                                const active = navActive(item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                            active
                                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1">
                    {!user && (
                        <Link
                            href="/about"
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors hidden sm:block px-3 py-1.5"
                        >
                            About
                        </Link>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        aria-label="Toggle theme"
                    >
                        {mounted && resolvedTheme === "dark" ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </button>

                    {isJournal && !isCreate && user && (
                        <Link
                            href="/journals/write"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 ml-1"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">New journal</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    )}

                    {user && (
                        <Link
                            href="/settings"
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                pathname === "/settings"
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                            aria-label="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                    )}

                    {user && (
                        <button
                            onClick={logout}
                            className="hidden sm:block p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            aria-label="Log out"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile nav strip */}
            {user && (
                <nav className="flex sm:hidden items-center gap-1 px-4 pb-2 overflow-x-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = navActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    active
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                        : "text-zinc-500 dark:text-zinc-400"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </header>
    );
}
