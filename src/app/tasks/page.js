"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2, Search, ListTodo } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TaskInput from "@/components/tasks/TaskInput";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import Pagination from "@/components/ui/Pagination";
import { useTasks } from "@/lib/TasksContext";

function TasksPageInner() {
    const {
        tasks,
        loading,
        filters,
        page,
        perPage,
        pagination,
        changePage,
        updateFilters,
        completeTask,
        uncompleteTask,
        fetchTaskById,
    } = useTasks();

    const [selectedTask, setSelectedTask] = useState(null);
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Auto-open task from URL ?task=id on initial load / navigation
    useEffect(() => {
        const taskId = searchParams.get("task");
        if (!taskId) {
            setSelectedTask(null);
            return;
        }

        if (selectedTask && String(selectedTask.id) === String(taskId)) {
            return;
        }

        const found = tasks.find((t) => String(t.id) === String(taskId));
        if (found) {
            setSelectedTask(found);
        } else if (!loading) {
            fetchTaskById(taskId)
                .then((data) => { if (data) setSelectedTask(data); })
                .catch(() => {});
        }
    }, [searchParams, tasks, loading, fetchTaskById, selectedTask]);

    const handleOpen = useCallback((task) => {
        setSelectedTask(task);
        const params = new URLSearchParams(searchParams.toString());
        params.set("task", task.id);
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    }, [pathname, searchParams]);

    const handleClose = useCallback(() => {
        setSelectedTask(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("task");
        const query = params.toString();
        window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    }, [pathname, searchParams]);

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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (!value.trim()) {
            updateFilters({ search: "" });
        }
    };

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6 pt-4 pb-20">
                {/* Header Greeting / Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <ListTodo className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                            Tasks
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Stay organized, manage priorities, and track your daily progress.
                        </p>
                    </div>
                </div>

                {/* Quick Task Creation Input */}
                <TaskInput />

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all shadow-2xs"
                    />
                </form>

                {/* Filter & Sort Controls */}
                <TaskFilters />

                {/* Task List */}
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

                        <Pagination
                            currentPage={page}
                            totalPages={pagination?.totalPages ?? 1}
                            totalItems={pagination?.total ?? tasks.length}
                            perPage={perPage}
                            onPageChange={changePage}
                            className="mt-6"
                        />
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-xs font-medium">Loading tasks…</p>
                    </div>
                )}

                {!loading && tasks.length === 0 && (
                    <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        {filters.archived
                            ? "No archived tasks."
                            : filters.search
                                ? "No tasks match your search."
                                : "No tasks here. Add one above to get started!"}
                    </div>
                )}
            </div>

            {/* Task Detail / Editing Sheet */}
            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailSheet task={selectedTask} onClose={handleClose} />
                )}
            </AnimatePresence>
        </>
    );
}

export default function TasksPage() {
    return (
        <Suspense>
            <TasksPageInner />
        </Suspense>
    );
}
