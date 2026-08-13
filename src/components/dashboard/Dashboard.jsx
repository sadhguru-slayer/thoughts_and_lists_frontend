"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    Loader2, PenLine, FileText, CheckCircle,
    LayoutDashboard, FileType, Activity, ArrowRight,
    StickyNote, BookOpen, ListTodo
} from "lucide-react";
import { stripHtml } from "@/lib/utils";

// Animated arrow button component
function ViewAllButton({ href }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium transition-all duration-200"
        >
            View all
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
    );
}

// Section header component
function SectionHeader({ icon: Icon, title, href, iconColor = "text-zinc-400" }) {
    return (
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                {title}
            </h2>
            <ViewAllButton href={href} />
        </div>
    );
}

// Empty state component
function EmptyState({ message }) {
    return (
        <div className="text-sm text-zinc-400 dark:text-zinc-500 italic py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
            {message}
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get("/api/v1/dashboard")
            .then(res => {
                if (isMounted) {
                    setData(res.data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to load dashboard:", err);
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!data) return null;

    const { stats, recent_tasks, recent_notes, recent_journals, has_journaled_today } = data;

    const priorityConfig = {
        URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        HIGH: { label: "High", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
        MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
        LOW: { label: "Low", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pt-4 pb-20 fade-in">

            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                    <LayoutDashboard className="w-6 h-6 text-blue-500" />
                    Dashboard
                </h1>

                {/* Journal nudge */}
                {!has_journaled_today && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 text-sm">
                                <PenLine className="w-4 h-4" />
                                Haven't journaled today
                            </h3>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                Take a moment to reflect on your day.
                            </p>
                        </div>
                        <Link
                            href="/journals/write"
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm"
                        >
                            Write now
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { icon: CheckCircle, value: `${stats.completed_tasks}/${stats.total_tasks}`, label: "Tasks done", color: "text-emerald-500" },
                    { icon: FileType, value: stats.total_thoughts, label: "Notes", color: "text-purple-500" },
                    { icon: FileText, value: stats.total_journals, label: "Journals", color: "text-blue-500" },
                    { icon: Activity, value: stats.current_streak, label: "Day streak", color: "text-orange-500" },
                ].map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                        <Icon className={`w-5 h-5 ${color} mb-0.5`} />
                        <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
                        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">{label}</span>
                    </div>
                ))}
            </div>

            {/* Content Sections — Tasks -> Notes -> Journals */}
            <div className="grid grid-cols-1 gap-6">

                {/* 1. Tasks */}
                <section className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                    <SectionHeader icon={ListTodo} title="Pending Tasks" href="/tasks" iconColor="text-emerald-500" />
                    {recent_tasks.length === 0 ? (
                        <EmptyState message="All caught up! 🎉 No pending tasks." />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {recent_tasks.map(task => {
                                const pConf = priorityConfig[task.priority];
                                return (
                                    <Link
                                        key={task.uuid}
                                        href={`/tasks?task=${task.uuid}`}
                                        className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0 group-hover:border-emerald-500 transition-colors" />
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {task.title}
                                        </span>
                                        {pConf && (
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${pConf.className}`}>
                                                {pConf.label}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 2. Notes */}
                <section className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                    <SectionHeader icon={StickyNote} title="Notes" href="/thoughts" iconColor="text-purple-500" />
                    {recent_notes.length === 0 ? (
                        <EmptyState message="No notes yet. Capture your ideas." />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {recent_notes.map(note => (
                                <Link
                                    key={note.uuid}
                                    href={`/thoughts?thought=${note.uuid}`}
                                    className="group flex flex-col py-3.5 first:pt-0 last:pb-0 hover:bg-transparent"
                                >
                                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {note.title || "Untitled Note"}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                        {stripHtml(note.content_preview) || "No content…"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* 3. Journals */}
                <section className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                    <SectionHeader icon={BookOpen} title="Journals" href="/journals" iconColor="text-blue-500" />
                    {!recent_journals || recent_journals.length === 0 ? (
                        <EmptyState message="No journal entries yet." />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {recent_journals.map(journal => (
                                <Link
                                    key={journal.uuid}
                                    href={`/journals/${journal.uuid}`}
                                    className="group flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                                            {journal.title || "Journal Entry"}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 block">
                                            {stripHtml(journal.content_preview) || "No content…"}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap mt-0.5 shrink-0 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg">
                                        {journal.date ? new Date(journal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
