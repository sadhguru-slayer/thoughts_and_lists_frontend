"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const TasksContext = createContext(null);

const DEFAULT_FILTERS = {
    status: null,
    priority: null,
    completed: null,
    today: false,
    overdue: false,
    search: "",
    archived: false,
};

function buildQueryParams(filters) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.completed !== null) params.completed = filters.completed;
    if (filters.today) params.today = true;
    if (filters.overdue) params.overdue = true;
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.archived) params.archived = true;
    return params;
}

export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const fetchTasks = useCallback(async (activeFilters = filters) => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/tasks", {
                params: buildQueryParams(activeFilters),
            });
            setTasks(res.data);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchTasks(filters);
        } else {
            setTasks([]);
            setLoading(false);
        }
    }, [user, filters, fetchTasks]);

    const fetchTaskById = useCallback(async (id) => {
        const res = await api.get(`/api/v1/tasks/${id}`);
        return res.data;
    }, []);

    const addTask = useCallback(async (payload) => {
        const res = await api.post("/api/v1/tasks", payload);
        await fetchTasks(filters);
        return res.data;
    }, [fetchTasks, filters]);

    const editTask = useCallback(async (id, payload) => {
        const res = await api.patch(`/api/v1/tasks/${id}`, payload);
        const updated = res.data.task || res.data;
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
        await fetchTasks(filters);
        return updated;
    }, [fetchTasks, filters]);

    const deleteTask = useCallback(async (id) => {
        await api.delete(`/api/v1/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const completeTask = useCallback(async (id) => {
        // Optimistic update — flip immediately so UI responds instantly
        const previous = tasks.find((t) => t.id === id);
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true, status: "completed" } : t)));
        try {
            const res = await api.patch(`/api/v1/tasks/${id}/complete`);
            // Sync with server truth
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...res.data } : t)));
        } catch (err) {
            // Rollback on failure
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...previous } : t)));
            console.error("Failed to complete task:", err);
        }
    }, [tasks]);

    const uncompleteTask = useCallback(async (id) => {
        // Optimistic update — flip immediately so UI responds instantly
        const previous = tasks.find((t) => t.id === id);
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: false, status: "pending" } : t)));
        try {
            const res = await api.patch(`/api/v1/tasks/${id}/uncomplete`);
            // Sync with server truth
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...res.data } : t)));
        } catch (err) {
            // Rollback on failure
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...previous } : t)));
            console.error("Failed to uncomplete task:", err);
        }
    }, [tasks]);

    const archiveTask = useCallback(async (id) => {
        const res = await api.patch(`/api/v1/tasks/${id}/archive`);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        return res.data;
    }, []);

    const updateFilters = useCallback((next) => {
        setFilters((prev) => ({ ...prev, ...next }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const value = useMemo(
        () => ({
            tasks,
            loading,
            filters,
            addTask,
            editTask,
            deleteTask,
            completeTask,
            uncompleteTask,
            archiveTask,
            fetchTaskById,
            updateFilters,
            resetFilters,
            refreshTasks: () => fetchTasks(filters),
        }),
        [
            tasks,
            loading,
            filters,
            addTask,
            editTask,
            deleteTask,
            completeTask,
            uncompleteTask,
            archiveTask,
            fetchTaskById,
            updateFilters,
            resetFilters,
            fetchTasks,
        ]
    );

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
}
