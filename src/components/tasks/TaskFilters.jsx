"use client";

import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/TasksContext";
import { ListFilter, ArrowUpDown } from "lucide-react";

const FILTER_OPTIONS = [
    { id: "all", label: "All", patch: { status: null, completed: null, today: false, overdue: false, archived: false } },
    { id: "today", label: "Today", patch: { status: null, completed: null, today: true, overdue: false, archived: false } },
    { id: "overdue", label: "Overdue", patch: { status: null, completed: null, today: false, overdue: true, archived: false } },
    { id: "active", label: "Active", patch: { status: null, completed: false, today: false, overdue: false, archived: false } },
    { id: "completed", label: "Done", patch: { status: null, completed: true, today: false, overdue: false, archived: false } },
    { id: "archived", label: "Archived", patch: { status: null, completed: null, today: false, overdue: false, archived: true } },
];

function getActiveFilterId(filters) {
    if (filters.archived) return "archived";
    if (filters.today) return "today";
    if (filters.overdue) return "overdue";
    if (filters.completed === true) return "completed";
    if (filters.completed === false) return "active";
    return "all";
}

export default function TaskFilters() {
    const { filters, updateFilters } = useTasks();
    const activeId = getActiveFilterId(filters);

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            {/* Status Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFilters(opt.patch)}
                        className={cn(
                            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95",
                            activeId === opt.id
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-semibold"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Priority & Sort Dropdowns */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Priority Filter */}
                <div className="relative flex items-center shrink-0">
                    <ListFilter className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <select
                        value={filters.priority || "ALL"}
                        onChange={(e) => updateFilters({ priority: e.target.value === "ALL" ? null : e.target.value })}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>

                {/* Sort Dropdown */}
                <div className="relative flex items-center shrink-0">
                    <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <select
                        value={filters.sort || "created_desc"}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none"
                    >
                        <option value="created_desc">Newest First</option>
                        <option value="created_asc">Oldest First</option>
                        <option value="due_date">Due Date</option>
                        <option value="priority">Priority</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
