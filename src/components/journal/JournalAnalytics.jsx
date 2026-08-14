"use client";

import { useJournal } from "@/lib/JournalContext";
import { motion } from "framer-motion";
import { BookOpen, Edit3, Flame, TrendingUp } from "lucide-react";

export default function JournalAnalytics() {
    const { analytics, loading } = useJournal();

    if (loading || !analytics) return null;

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
