"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const ThoughtsContext = createContext(null);

const CONTENT_PREVIEW_MAX = 120;
const TITLE_PREVIEW_MAX = 60;

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

function toThoughtSummary(thought) {
    return {
        id: thought.id,
        title: truncate(thought.title, TITLE_PREVIEW_MAX),
        content_preview: truncate(thought.content, CONTENT_PREVIEW_MAX),
        user_id: thought.user_id,
        created_at: thought.created_at,
        updated_at: thought.updated_at,
    };
}

export function ThoughtsProvider({ children }) {
    const [thoughts, setThoughts] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchThoughts();
        } else {
            setThoughts([]);
            setLoading(false);
        }
    }, [user]);

    const fetchThoughts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/thoughts");
            const sorted = res.data.sort((a, b) => b.id - a.id);
            setThoughts(sorted);
        } catch (err) {
            console.error("Failed to fetch thoughts:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchThoughtById = useCallback(async (id) => {
        const res = await api.get(`/api/v1/thoughts/${id}`);
        return res.data;
    }, []);

    const addThought = useCallback(async ({ title, content }) => {
        try {
            const res = await api.post("/api/v1/thoughts", {
                title: (title || "").trim(),
                content: (content || "").trim()
            });
            setThoughts((prev) => [toThoughtSummary(res.data), ...prev]);
            return res.data;
        } catch (err) {
            console.error("Failed to add thought:", err);
            throw err;
        }
    }, []);

    const editThought = useCallback(async (id, { title, content }) => {
        try {
            const res = await api.patch(`/api/v1/thoughts/${id}`, {
                id,
                title: (title || "").trim(),
                content: (content || "").trim()
            });
            const updated = res.data.thought || res.data;
            setThoughts((prev) =>
                prev.map((t) => (t.id === id ? toThoughtSummary(updated) : t))
            );
            return updated;
        } catch (err) {
            console.error("Failed to edit thought:", err);
            throw err;
        }
    }, []);

    const deleteThought = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/thoughts/${id}`);
            setThoughts((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error("Failed to delete thought:", err);
        }
    }, []);

    const deleteThoughts = useCallback(async (ids) => {
        try {
            await api.post("/api/v1/thoughts/bulk-delete", { ids });
            setThoughts((prev) => prev.filter((t) => !ids.includes(t.id)));
        } catch (err) {
            console.error("Failed to bulk delete thoughts:", err);
            throw err;
        }
    }, []);

    const value = useMemo(
        () => ({
            thoughts,
            loading,
            addThought,
            editThought,
            deleteThought,
            deleteThoughts,
            fetchThoughtById,
            refreshThoughts: fetchThoughts
        }),
        [thoughts, loading, addThought, editThought, deleteThought, deleteThoughts, fetchThoughtById]
    );

    return (
        <ThoughtsContext.Provider value={value}>
            {children}
        </ThoughtsContext.Provider>
    );
}

export function useThoughts() {
    const context = useContext(ThoughtsContext);
    if (!context) {
        throw new Error("useThoughts must be used within a ThoughtsProvider");
    }
    return context;
}
