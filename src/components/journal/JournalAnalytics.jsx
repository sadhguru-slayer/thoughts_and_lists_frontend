"use client";

import { useJournal } from "@/lib/JournalContext";
import { motion } from "framer-motion";
import { BookOpen, Edit3, Flame, TrendingUp } from "lucide-react";

const container = {
    hidden: { opacity: 0, y: -20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
};

export default function JournalAnalytics() {
    const { analytics, loading } = useJournal();

    if (loading || !analytics) return (
        <div className="animate-pulse h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl mb-8 w-full border border-zinc-200 dark:border-zinc-800"></div>
    );

    const stats = [
        { label: "Total Entries", value: analytics.total_journals, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Words", value: analytics.total_words, icon: Edit3, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Current Streak", value: analytics.current_streak, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Longest Streak", value: analytics.longest_streak, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    const generateContributionData = (activityData, daysBack = 154) => {
        const today = new Date();
        const data = [];

        // Pad for start day of the week
        const startDate = new Date();
        startDate.setDate(today.getDate() - (daysBack - 1));
        const startDayOfWeek = startDate.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
            data.push({ date: null, count: 0, invisible: true });
        }

        for (let i = daysBack - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const found = activityData?.find(item => item.date === dateStr);
            data.push({
                date: dateStr,
                count: found ? found.count : 0,
                invisible: false
            });
        }
        return data;
    };

    const contributionData = generateContributionData(analytics.daily_activity || [], 154);

    const getColorClass = (count) => {
        if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50";
        if (count === 1) return "bg-emerald-200 dark:bg-emerald-900/60 hover:bg-emerald-300 dark:hover:bg-emerald-800/60";
        if (count === 2) return "bg-emerald-400 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600";
        if (count === 3) return "bg-emerald-500 dark:bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400";
        return "bg-emerald-600 dark:bg-emerald-400 hover:bg-emerald-700 dark:hover:bg-emerald-300";
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="mb-8 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="flex items-center gap-4 p-5 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
                    >
                        <div className={`p-4 rounded-[1.25rem] ${stat.bg} ${stat.color}`}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {stat.value}
                            </p>
                            <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Activity Heatmap (GitHub Style) */}
            <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Contribution Map</p>
                </div>

                <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                    <div className="grid grid-rows-7 grid-flow-col gap-1.5 justify-start min-w-max">
                        {contributionData.map((day, i) => {
                            if (day.invisible) {
                                return <div key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-transparent"></div>;
                            }
                            return (
                                <div key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] transition-colors relative group ${getColorClass(day.count)}`}>
                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs py-1.5 px-3 rounded-lg -translate-x-1/2 left-1/2 whitespace-nowrap pointer-events-none z-20 transition-all font-medium drop-shadow-md">
                                        <span className="opacity-70 mr-1">{day.date}:</span>
                                        {day.count} {day.count === 1 ? 'entry' : 'entries'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 justify-end mt-1">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-800/50"></div>
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/60"></div>
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700"></div>
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-500"></div>
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-400"></div>
                    </div>
                    <span>More</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
