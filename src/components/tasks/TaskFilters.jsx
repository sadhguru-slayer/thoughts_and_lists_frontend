"use client";

import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/TasksContext";

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
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
            {FILTER_OPTIONS.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFilters(opt.patch)}
                    className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95",
                        activeId === opt.id
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
