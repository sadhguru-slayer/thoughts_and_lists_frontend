"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Pin, CheckCircle2, Circle, Calendar, Notebook, CheckSquare, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function WelcomePage() {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex flex-col items-center justify-between min-h-[calc(100vh-6rem)] w-full py-8 space-y-12">
            <div className="w-full flex flex-col items-center space-y-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4 pt-6"
                >
                    {/* Eyebrow */}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Memo · Personal Command Center
                    </span>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.2]">
                        Think clearly. Write daily. Stay focused.
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                        A quiet, minimalist space designed to capture instant thoughts, maintain structured daily journals, and track high-priority tasks.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        {user ? (
                            <Link href="/dashboard">
                                <button className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs">
                                    Go to Dashboard
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/register">
                                    <button className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-98 transition-all shadow-xs">
                                        Start Writing Free
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                                <Link href="/login">
                                    <button className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-3 py-2 transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Product Preview (Minimal Dashboard Mock) */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-5 shadow-xs overflow-hidden"
                >
                    {/* Mock Browser Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
                        <div className="flex items-center gap-3">
                            {/* Window Dots */}
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                                memo.sadguruchenu.in/dashboard
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                            Sadguru's Workspace
                        </span>
                    </div>

                    {/* Mock Dashboard Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Col 1: Focus */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Today
                            </h4>
                            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-3.5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-50">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                        <span>Journal Entry</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                                        Pending reflection. "How was your day?"
                                    </p>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                        <span>Task Progress</span>
                                        <span>3 of 5</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="w-3/5 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Starred Notes */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Pinned & Starred
                            </h4>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/10 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block">Aug 14</span>
                                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                                            Refactoring thoughts lists UI
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Star className="w-3 h-3 text-amber-500" fill="currentColor" />
                                        <Pin className="w-3 h-3 text-blue-500" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/10 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block">Aug 12</span>
                                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                                            Self-hosting roadmap & key options
                                        </span>
                                    </div>
                                    <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        {/* Col 3: Focus Tasks */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Tasks
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/10 dark:bg-zinc-900/5 text-xs text-zinc-700 dark:text-zinc-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
                                    <span className="line-through text-zinc-400 dark:text-zinc-600 truncate">
                                        Fix task animation bouncing
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/10 dark:bg-zinc-900/5 text-xs text-zinc-700 dark:text-zinc-300">
                                    <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
                                    <span className="truncate">Implement local database backup</span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/10 dark:bg-zinc-900/5 text-xs text-zinc-700 dark:text-zinc-300">
                                    <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
                                    <span className="truncate">Draft weekend review log</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Editorial Feature Section */}
                <div className="w-full border-t border-zinc-100 dark:border-zinc-900 pt-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Featured (Left column - Highlighted Feature) */}
                        <div className="md:col-span-5 space-y-4 pr-0 md:pr-4">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Notebook className="w-3.5 h-3.5 text-indigo-500" />
                                Custom Template Engines
                            </span>
                            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                                Write structured journals that fit your lifestyle.
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Build reusable section structures like mood indicators, habit tallies, daily reflections, and checklist parameters. They load instantly with every new entry so you keep consistency automatically.
                            </p>
                        </div>

                        {/* Non-featured (Right column - Two features stacked) */}
                        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-900 pt-8 md:pt-0 pl-0 md:pl-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 dark:text-zinc-50">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Immediate Notes</span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    Throw ideas in dynamically. Pin important thoughts, mark targets, and filter notes down locally as fast as your mind runs.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 dark:text-zinc-50">
                                    <CheckSquare className="w-4 h-4 text-violet-500" />
                                    <span>No-Fuss Task Focus</span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    Track todo logs with 1-click status and priority matrices. Fast layout morphs handle additions and edits without distraction.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Understated Privacy/Trust Message */}
                <div className="w-full flex justify-center py-4 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center font-medium tracking-tight">
                        Your notes are yours. No ads. No noise.
                    </p>
                </div>
            </div>

            {/* Clean, Minimal Footer */}
            <footer className="w-full pt-8 pb-4 border-t border-zinc-150 dark:border-zinc-900 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-1.5">
                    <span>&copy; {currentYear} Memo. Crafted by</span>
                    <a
                        href="https://sadguruchenu.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline inline-flex items-center gap-0.5"
                    >
                        Sadguru Chenu
                        <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                    </a>
                </div>

                <nav className="flex items-center gap-5">
                    <Link href="/about" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                        About
                    </Link>
                    <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                        Terms of Service
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
