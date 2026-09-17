"use client";

import { motion } from "framer-motion";
import { Calendar, Check, Repeat, Bell, ChevronRight } from "lucide-react";

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
                "group flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 shadow-2xs transition-all duration-200 cursor-pointer overflow-hidden relative select-none",
                completed
                    ? "border-zinc-200/60 bg-zinc-50/60 dark:border-zinc-800/60 dark:bg-zinc-900/40 opacity-75"
                    : "border-zinc-200/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5",
                overdue && !completed && "border-red-200/80 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
            )}
        >
            {/* Custom Checkbox */}
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-90",
                    completed
                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-2xs"
                        : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-200"
                )}
                aria-label={completed ? "Mark incomplete" : "Mark complete"}
            >
                {completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
            </button>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        className={cn(
                            "text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight break-words flex-1 min-w-0",
                            completed && "line-through text-zinc-400 dark:text-zinc-500 font-normal"
                        )}
                    >
                        {task.title}
                    </h3>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", priority.className)}>
                            {priority.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                    </div>
                </div>

                {/* Optional description snippet */}
                {task.description && !completed && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {task.description}
                    </p>
                )}

                {/* Meta details footer: Status, Due Date, Recurrence, Reminder */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    <span className={cn("font-medium", status.className)}>{status.label}</span>

                    {task.due_date && (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                                overdue && !completed
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-semibold"
                                    : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400"
                            )}
                        >
                            <Calendar className="w-2.5 h-2.5" />
                            {formatTaskDate(task.due_date)}
                        </span>
                    )}

                    {task.recurrence && task.recurrence !== "NONE" && (
                        <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md" title={`Repeats: ${task.recurrence}`}>
                            <Repeat className="w-2.5 h-2.5 text-zinc-400" />
                            <span className="capitalize">{task.recurrence.toLowerCase()}</span>
                        </span>
                    )}

                    {task.reminder_at && (
                        <span className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md" title="Reminder scheduled">
                            <Bell className="w-2.5 h-2.5" />
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
