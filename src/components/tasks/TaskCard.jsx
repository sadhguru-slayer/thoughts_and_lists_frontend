"use client";

import { motion } from "framer-motion";
import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG, formatTaskDate, isOverdue } from "@/lib/taskUtils";

export default function TaskCard({ task, onOpen, onToggleComplete }) {
    const completed = task.completed || task.status === "COMPLETED";
    const overdue = isOverdue(task);
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggleComplete(task);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={() => onOpen(task)}
            className={cn(
                "group flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all cursor-pointer",
                completed
                    ? "border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50 opacity-75"
                    : "border-zinc-200 bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900",
                overdue && !completed && "border-red-200 dark:border-red-900/50"
            )}
        >
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-green-500 dark:hover:border-green-500"
                )}
                aria-label={completed ? "Mark incomplete" : "Mark complete"}
            >
                {completed && <Check className="w-3 h-3" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className={cn(
                            "text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug",
                            completed && "line-through text-zinc-400 dark:text-zinc-500"
                        )}
                    >
                        {task.title}
                    </h3>
                    <span className={cn("shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", priority.className)}>
                        {priority.label}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("font-medium", status.className)}>{status.label}</span>
                    {task.due_date && (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1",
                                overdue ? "text-red-500 font-semibold" : "text-zinc-400 dark:text-zinc-500"
                            )}
                        >
                            <Calendar className="w-3 h-3" />
                            {formatTaskDate(task.due_date)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
