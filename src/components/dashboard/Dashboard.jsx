"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
    Loader2, PenLine, ArrowRight,
    StickyNote, BookOpen, ListTodo, Flame,
    CheckCircle2, Plus, Check, Pin, Star,
    Circle, NotebookPen
} from "lucide-react";
import { stripHtml } from "@/lib/utils";

const JOURNAL_PROMPTS = [
    "How was your day?",
    "What's on your mind right now?",
    "What went well today?",
    "Anything you're grateful for?",
    "What's one thing you learned today?",
    "How are you feeling right now?",
    "What would make tomorrow better?",
    "Did anything surprise you today?",
    "What's one small win from today?",
    "What are you looking forward to?",
];

// ─── Primitives ──────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, children }) {
    return (
        <div className="flex items-center gap-1.5 mb-3">
            <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {children}
            </span>
        </div>
    );
}

function ViewAll({ href }) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors uppercase tracking-wider"
        >
            All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs ${className}`}>
            {children}
        </div>
    );
}

function Empty({ label }) {
    return (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic text-center py-4">
            {label}
        </p>
    );
}

// ─── Priority badge ────────────────────────────────────────────────────────

const PRIORITY = {
    URGENT: { label: "Urgent", cls: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" },
    HIGH: { label: "High", cls: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
    MEDIUM: { label: "Med", cls: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    LOW: { label: "Low", cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
};

// ─── Sub-components ────────────────────────────────────────────────────────

/** Compact circular progress ring */
function ProgressRing({ done, total, size = 36, stroke = 3 }) {
    const pct = total > 0 ? done / total : 0;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="currentColor" strokeWidth={stroke}
                className="text-zinc-200 dark:text-zinc-800" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="currentColor" strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                strokeLinecap="round"
                className="text-zinc-700 dark:text-zinc-300 transition-all duration-500" />
        </svg>
    );
}

/** Today / Focus panel */
function TodayPanel({ tasks, stats, hasJournaledToday }) {
    const topTasks = tasks.slice(0, 3);
    const done = stats.completed_tasks ?? 0;
    const total = stats.total_tasks ?? 0;

    // Pick a prompt that stays stable for the session (based on current minute)
    const prompt = useMemo(() => {
        const idx = new Date().getMinutes() % JOURNAL_PROMPTS.length;
        return JOURNAL_PROMPTS[idx];
    }, []);

    return (
        <Card className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <SectionLabel icon={Check}>Today&apos;s Focus</SectionLabel>
                <ViewAll href="/tasks" />
            </div>

            {/* Journal prompt — shown prominently when not yet journaled */}
            {!hasJournaledToday ? (
                <Link
                    href="/journals/write"
                    className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/30 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                >
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 shrink-0 shadow-2xs">
                        <NotebookPen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                            {prompt}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            Today&apos;s journal is waiting (takes 2 minutes).
                        </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-all shrink-0" />
                </Link>
            ) : (
                /* Progress bar when journaled */
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/50">
                    <div className="relative shrink-0">
                        <ProgressRing done={done} total={total} size={38} stroke={3.5} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
                            {total > 0 ? Math.round((done / total) * 100) : 0}%
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {done}/{total} tasks completed
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Journal written today</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Task progress — compact, shown regardless */}
            {hasJournaledToday === false && total > 0 && (
                <div className="flex items-center gap-3 px-1">
                    <div className="relative shrink-0">
                        <ProgressRing done={done} total={total} size={28} stroke={2.5} />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-300">
                            {Math.round((done / total) * 100)}%
                        </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {done} of {total} tasks done
                    </p>
                </div>
            )}

            {/* Pending tasks (max 3) */}
            {topTasks.length === 0 ? (
                <Empty label="All tasks done — well done! 🎉" />
            ) : (
                <div className="space-y-1">
                    {topTasks.map(task => {
                        const p = PRIORITY[task.priority];
                        return (
                            <Link
                                key={task.uuid}
                                href={`/tasks?task=${task.uuid}`}
                                className="group flex items-center gap-2.5 py-1.5 rounded-lg px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-zinc-500 transition-colors" />
                                <span className="text-xs text-zinc-700 dark:text-zinc-300 flex-1 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                    {task.title}
                                </span>
                                {p && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.cls} shrink-0`}>
                                        {p.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

/** Quick Capture */
function QuickCapture() {
    const actions = [
        { icon: StickyNote, label: "New Note", href: "/thoughts", hint: "Capture a thought" },
        { icon: BookOpen, label: "New Journal", href: "/journals/write", hint: "Reflect on today" },
        { icon: ListTodo, label: "New Task", href: "/tasks", hint: "Track something" },
    ];
    return (
        <Card className="p-4">
            <SectionLabel icon={Plus}>Quick Capture</SectionLabel>
            <div className="space-y-1.5">
                {actions.map(({ icon: Icon, label, href, hint }) => (
                    <Link
                        key={label}
                        href={href}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                    >
                        <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{label}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{hint}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 ml-auto group-hover:translate-x-0.5 group-hover:text-zinc-500 transition-all" />
                    </Link>
                ))}
            </div>
        </Card>
    );
}

/** Pinned / Starred notes */
function PinnedNotes({ notes }) {
    const pinned = useMemo(
        () => notes.filter(n => n.is_pinned || n.is_starred).slice(0, 4),
        [notes]
    );

    if (pinned.length === 0) return null;

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <SectionLabel icon={Pin}>Pinned</SectionLabel>
                <ViewAll href="/thoughts" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pinned.map(note => (
                    <Link
                        key={note.uuid}
                        href={`/thoughts?thought=${note.uuid}`}
                        className="group flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-all"
                    >
                        <div className="flex items-center gap-1.5">
                            {note.is_starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                            {note.is_pinned && !note.is_starred && <Pin className="w-3 h-3 text-zinc-400 shrink-0" />}
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                {note.title || "Untitled"}
                            </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1">
                            {stripHtml(note.content_preview) || "—"}
                        </span>
                    </Link>
                ))}
            </div>
        </Card>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get("/api/v1/dashboard")
            .then(res => { if (isMounted) { setData(res.data); setLoading(false); } })
            .catch(err => { console.error("Dashboard fetch failed:", err); if (isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
        );
    }
    if (!data) return null;

    const { stats, recent_tasks, recent_notes, recent_journals, has_journaled_today } = data;

    return (
        <div className="max-w-5xl mx-auto pt-4 pb-20 space-y-5">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                </div>
                {!has_journaled_today && (
                    <Link
                        href="/journals/write"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-3.5 py-2 transition-all hover:opacity-90 active:scale-95 shadow-2xs"
                    >
                        <PenLine className="w-3.5 h-3.5" />
                        Write journal
                    </Link>
                )}
            </div>

            {/* ── Metric tiles ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                    { icon: CheckCircle2, value: `${stats.completed_tasks}/${stats.total_tasks}`, label: "Tasks done" },
                    { icon: StickyNote, value: stats.total_thoughts, label: "Notes" },
                    { icon: BookOpen, value: stats.total_journals, label: "Journals" },
                    { icon: Flame, value: `${stats.current_streak}d`, label: "Streak" },
                ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
                        <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate leading-tight">{value}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main row: Today/Focus (2/3) + Quick Capture (1/3) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <TodayPanel tasks={recent_tasks} stats={stats} hasJournaledToday={has_journaled_today} />
                </div>
                <div>
                    <QuickCapture />
                </div>
            </div>

            {/* ── Pinned notes (only renders if there are any) ── */}
            <PinnedNotes notes={recent_notes} />

            {/* ── Bottom row: Notes · Journals ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Recent Notes */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel icon={StickyNote}>Recent Notes</SectionLabel>
                        <ViewAll href="/thoughts" />
                    </div>
                    {recent_notes.length === 0 ? (
                        <Empty label="No notes captured yet." />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {recent_notes.slice(0, 4).map(note => (
                                <Link
                                    key={note.uuid}
                                    href={`/thoughts?thought=${note.uuid}`}
                                    className="group flex flex-col py-2 first:pt-0 last:pb-0"
                                >
                                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors truncate">
                                        {note.title || "Untitled Note"}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                                        {stripHtml(note.content_preview) || "—"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent Journals */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel icon={BookOpen}>Recent Journals</SectionLabel>
                        <ViewAll href="/journals" />
                    </div>
                    {!recent_journals || recent_journals.length === 0 ? (
                        <Empty label="No journal entries yet." />
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {recent_journals.slice(0, 4).map(journal => (
                                <Link
                                    key={journal.uuid}
                                    href={`/journals/${journal.uuid}`}
                                    className="group flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors block truncate">
                                            {journal.title || "Journal Entry"}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1 block">
                                            {stripHtml(journal.content_preview) || "—"}
                                        </span>
                                    </div>
                                    <time className="text-[10px] font-semibold text-zinc-400 whitespace-nowrap mt-0.5 shrink-0">
                                        {journal.date
                                            ? new Date(journal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            : ""}
                                    </time>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
}
