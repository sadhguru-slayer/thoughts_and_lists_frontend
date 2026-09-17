"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun, Settings } from "lucide-react";
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
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const isThoughts = pathname.startsWith("/thoughts") || pathname.startsWith("/notebooks");
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
        <header className="sticky top-0 z-50 shrink-0 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-colors">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
                    >
                        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800">
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
                        <nav className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                            {NAV_ITEMS.map((item) => {
                                const active = navActive(item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "px-3.5 py-1 rounded-full text-xs font-semibold transition-all",
                                            active
                                                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/40"
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
                <div className="flex items-center gap-1.5">
                    {!user && (
                        <Link
                            href="/about"
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors hidden sm:block px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            About
                        </Link>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-all rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 cursor-pointer"
                        aria-label="Toggle theme"
                    >
                        {mounted && resolvedTheme === "dark" ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </button>

                    {user && (
                        <Link
                            href="/settings"
                            className={cn(
                                "p-2 rounded-full transition-all active:scale-95",
                                pathname === "/settings"
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                            aria-label="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile nav strip */}
            {user && (
                <nav className="flex sm:hidden items-center gap-1.5 px-4 pb-2.5 overflow-x-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = navActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                                    active
                                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
