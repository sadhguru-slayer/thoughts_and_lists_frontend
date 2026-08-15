"use client";

import { useJournal } from "@/lib/JournalContext";
import { motion } from "framer-motion";
import { BookOpen, Edit3, Flame, TrendingUp } from "lucide-react";

export default function JournalAnalytics() {
    const { analytics, analyticsLoading } = useJournal();

    if (analyticsLoading || !analytics) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80"
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                            <div className="h-2.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        { label: "Total Entries", value: analytics.total_journals ?? 0, icon: BookOpen },
        { label: "Words Written", value: (analytics.total_words ?? 0).toLocaleString(), icon: Edit3 },
        { label: "Current Streak", value: `${analytics.current_streak ?? 0} days`, icon: Flame },
        { label: "Longest Streak", value: `${analytics.longest_streak ?? 0} days`, icon: TrendingUp },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1"
        >
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 shrink-0">
                        <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                            {stat.value}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block truncate">
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
