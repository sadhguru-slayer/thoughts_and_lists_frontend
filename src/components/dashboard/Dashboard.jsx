"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Loader2, Plus, PenLine, FileText, CheckCircle, LayoutDashboard, Calendar, FileType, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to generate last N days
function getLastNDays(n) {
    const dates = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
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

    const activityMap = useMemo(() => {
        if (!data?.daily_activity) return {};
        const map = {};
        data.daily_activity.forEach(item => {
            map[item.date] = item.count;
        });
        return map;
    }, [data]);

    const last90Days = useMemo(() => getLastNDays(90), []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!data) return null;

    const { stats, recent_tasks, recent_notes, has_journaled_today } = data;

    return (
        <div className="space-y-8 pt-4 pb-20 fade-in">
            {/* Header & Reminders */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 text-blue-500" />
                        Dashboard
                    </h1>
                </div>

                {!has_journaled_today && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <PenLine className="w-5 h-5" />
                                Don't forget your journal!
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                You haven't written a journal entry today. Take a moment to reflect.
                            </p>
                        </div>
                        <Link
                            href="/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm whitespace-nowrap"
                        >
                            Write now
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                    <FileText className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total_journals}</span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Journals</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                    <FileType className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total_thoughts}</span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Notes</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.completed_tasks} <span className="text-sm text-zinc-400 font-normal">/ {stats.total_tasks}</span></span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tasks Done</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
                    <Activity className="w-6 h-6 text-orange-500 mb-2" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.current_streak}</span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Day Streak</span>
                </div>
            </div>

            {/* Contribution Map */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-zinc-500" />
                        Activity Map
                    </h2>
                    <span className="text-xs text-zinc-500 font-medium">Last 90 days</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end sm:justify-start">
                    {last90Days.map(date => {
                        const count = activityMap[date] || 0;
                        let colorClass = "bg-zinc-100 dark:bg-zinc-800";
                        if (count === 1) colorClass = "bg-emerald-200 dark:bg-emerald-900/40";
                        else if (count === 2) colorClass = "bg-emerald-300 dark:bg-emerald-800/60";
                        else if (count === 3) colorClass = "bg-emerald-400 dark:bg-emerald-600/80";
                        else if (count >= 4) colorClass = "bg-emerald-500 dark:bg-emerald-500";
                        
                        return (
                            <div 
                                key={date} 
                                title={`${date}: ${count} actions`}
                                className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-colors", colorClass)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Two Columns: Recent Notes & Pending Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Notes */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Recent Notes</h2>
                        <Link href="/thoughts" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
                    </div>
                    {recent_notes.length === 0 ? (
                        <div className="text-sm text-zinc-500 italic p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            No notes yet.
                        </div>
                    ) : (
                        recent_notes.map(note => (
                            <Link key={note.id} href={`/thoughts/${note.id}`} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer block">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 transition-colors">
                                    {note.title || "Untitled Note"}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                    {note.content_preview.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() || "No content..."}
                                </p>
                            </Link>
                        ))
                    )}
                </div>

                {/* Pending Tasks */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Pending Tasks</h2>
                        <Link href="/tasks" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
                    </div>
                    {recent_tasks.length === 0 ? (
                        <div className="text-sm text-zinc-500 italic p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                            All caught up!
                        </div>
                    ) : (
                        recent_tasks.map(task => (
                            <Link key={task.id} href="/tasks" className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0" />
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 transition-colors">
                                        {task.title}
                                    </h3>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {task.priority === "URGENT" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">URGENT</span>}
                                    {task.priority === "HIGH" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">HIGH</span>}
                                </div>
                            </Link>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
