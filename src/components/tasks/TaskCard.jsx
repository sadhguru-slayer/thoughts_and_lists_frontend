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

    const handleOpen = () => {
        console.log("[TaskCard] Clicked task to open:", task?.id, task?.title);
        onOpen(task);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleOpen}
            className={cn(
                "group flex items-start gap-3 rounded-2xl border p-4 shadow-2xs transition-colors cursor-pointer overflow-hidden relative",
                completed
                    ? "border-zinc-200/60 bg-zinc-50/60 dark:border-zinc-800/60 dark:bg-zinc-900/30 opacity-70"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700",
                overdue && !completed && "border-red-200/80 dark:border-red-900/40"
            )}
        >
            {/* Custom Checkbox */}
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "mt-0.5 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    completed
                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-100"
                )}
                aria-label={completed ? "Mark incomplete" : "Mark complete"}
            >
                {completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
            </button>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className={cn(
                            "text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight truncate",
                            completed && "line-through text-zinc-400 dark:text-zinc-500 font-normal"
                        )}
                    >
                        {task.title}
                    </h3>
                    <span className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded", priority.className)}>
                        {priority.label}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <span className={cn("font-medium text-[10px]", status.className)}>{status.label}</span>
                    {task.due_date && (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 text-[10px]",
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
