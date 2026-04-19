"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles, Brain, Lock } from "lucide-react";

export default function WelcomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center w-full relative">

            {/* Background glowing orb effect for premium modern feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-400/20 dark:bg-emerald-600/20 blur-[100px] rounded-full point-events-none -z-10" />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                className="w-full relative z-10 pt-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Your personal digital sanctuary</span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 leading-[1.15]">
                    Capture your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Thoughts.</span><br />
                    Organize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Life.</span>
                </h1>

                <p className="max-w-lg mx-auto text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed">
                    A beautifully minimalist mobile-first journal seamlessly designed to declutter your mind and track your daily journey.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link href="/register" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-8 py-4 text-sm font-bold text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/20 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white dark:bg-zinc-900 px-8 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all">
                            Sign In
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12"
            >
                <div className="flex flex-col items-start text-left p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                    <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4 inline-flex">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Smart Journaling</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Create reusable templates and track your mood, habits, and daily reflections effortlessly.
                    </p>
                </div>

                <div className="flex flex-col items-start text-left p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                    <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-4 inline-flex">
                        <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Thoughts & Ideas</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        A dedicated spaceless canvas for throwing in quick notes and categorizing random fast ideas.
                    </p>
                </div>

                <div className="flex flex-col items-start text-left p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm sm:col-span-2 transition-transform hover:-translate-y-1 hover:shadow-md">
                    <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mb-4 inline-flex">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Private & Secure</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Your data is solely yours. Secure token authentication keeps your personal milestones locked up safe.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
