"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Code2, Heart, Shield, Cpu } from "lucide-react";

export default function AboutPage() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)] w-full py-4 space-y-10">
            <div className="max-w-3xl mx-auto w-full space-y-10">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Home
                </Link>

                {/* Main Header */}
                <div className="space-y-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        About Memo
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        A beautifully minimal workspace crafted for focus, daily reflection, and personal clarity.
                    </p>
                </div>

                {/* Narrative Content */}
                <div className="space-y-8 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {/* Mission */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>The Mission</span>
                        </div>
                        <p>
                            Memo was born out of a simple realization: modern productivity tools are often overloaded with noise, complex databases, and constant notifications. We wanted to build a space that feels quiet, immediate, and personal — a canvas that honors your thoughts without standing in your way.
                        </p>
                    </div>

                    {/* Creator Story & Portfolio */}
                    <div className="space-y-3 p-6 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                            <Code2 className="w-4 h-4 text-blue-500" />
                            <span>Created by Sadguru Chenu</span>
                        </div>
                        <p>
                            Designed and developed by <strong>Sadguru Chenu</strong>, Memo is focused on high-density UX, privacy-first storage, and instant interaction. Every component, card, and animation is tuned to make writing and tracking feel smooth and natural.
                        </p>
                        <div className="pt-2">
                            <a
                                href="https://sadguruchenu.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                            >
                                <span>Visit Portfolio (sadguruchenu.in)</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                            <Cpu className="w-4 h-4 text-purple-500" />
                            <span>Built with Modern Architecture</span>
                        </div>
                        <p>
                            Under the hood, Memo leverages a robust modern stack designed for speed and reliability:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                Next.js
                            </div>
                            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                FastAPI
                            </div>
                            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                PostgreSQL
                            </div>
                            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                                Tailwind CSS
                            </div>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span>Privacy & Control</span>
                        </div>
                        <p>
                            Your data belongs strictly to you. Memo uses secure token authentication and isolated per-user records so your journals and thoughts remain private.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full pt-8 pb-4 border-t border-zinc-200/80 dark:border-zinc-800/80 mt-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                        <span>&copy; {currentYear} Memo. Built by</span>
                        <a
                            href="https://sadguruchenu.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline inline-flex items-center gap-0.5"
                        >
                            Sadguru Chenu
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            About
                        </Link>
                        <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            Terms of Service
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
