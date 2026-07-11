"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import TaskInput from "@/components/tasks/TaskInput";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import { useTasks } from "@/lib/TasksContext";

export default function TasksPage() {
    const {
        tasks,
        loading,
        filters,
        updateFilters,
        completeTask,
        uncompleteTask,
    } = useTasks();

    const [selectedTask, setSelectedTask] = useState(null);
    const [searchInput, setSearchInput] = useState(filters.search || "");

    const handleOpen = useCallback((task) => {
        setSelectedTask(task);
    }, []);

    const handleClose = useCallback(() => {
        setSelectedTask(null);
    }, []);

    const handleToggleComplete = useCallback(async (task) => {
        const isCompleted = task.completed || task.status === "COMPLETED";
        if (isCompleted) {
            await uncompleteTask(task.id);
        } else {
            await completeTask(task.id);
        }
    }, [completeTask, uncompleteTask]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ search: searchInput });
    };

    return (
        <>
            <div className="w-full flex-1 pt-2 pb-28">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">Tasks</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Stay on top of what matters.</p>
                </div>

                <TaskInput />
                <TaskFilters />

                <form onSubmit={handleSearchSubmit} className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                    />
                </form>

                {!loading && (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onOpen={handleOpen}
                                    onToggleComplete={handleToggleComplete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 mt-20 text-zinc-500 dark:text-zinc-400 font-medium">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p>Loading tasks…</p>
                    </div>
                )}

                {!loading && tasks.length === 0 && (
                    <div className="text-center mt-20 text-zinc-500 dark:text-zinc-400 font-medium">
                        {filters.archived
                            ? "No archived tasks."
                            : filters.search
                                ? "No tasks match your search."
                                : "Add your first task to get started."}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailSheet task={selectedTask} onClose={handleClose} />
                )}
            </AnimatePresence>
        </>
    );
}
