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
        id: thought.uuid || thought.id,
        title: truncate(thought.title, TITLE_PREVIEW_MAX),
        content_preview: truncate(thought.content_preview || thought.content, CONTENT_PREVIEW_MAX),
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

    const [page, setPage] = useState(1);
    const [perPage] = useState(15);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchThoughts = useCallback(async (targetPage = page, currentSearch = searchQuery) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: targetPage.toString(),
                per_page: perPage.toString()
            });
            if (currentSearch) {
                params.append("search", currentSearch);
            }
            
            const res = await api.get(`/api/v1/thoughts?${params.toString()}`);
            if (res.data && res.data.items) {
                const mapped = res.data.items.map(toThoughtSummary);
                setThoughts(mapped);
                setPagination({
                    total: res.data.total ?? mapped.length,
                    totalPages: res.data.total_pages ?? 1
                });
            } else {
                const rawItems = Array.isArray(res.data) ? res.data : [];
                setThoughts(rawItems.map(toThoughtSummary));
                setPagination({ total: rawItems.length, totalPages: 1 });
            }
        } catch (err) {
            console.error("Failed to fetch thoughts:", err);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, searchQuery]);

    const changePage = (newPage) => {
        setPage(newPage);
        fetchThoughts(newPage, searchQuery);
    };
    
    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(1);
        fetchThoughts(1, query);
    };

    const fetchThoughtById = useCallback(async (id) => {
        const res = await api.get(`/api/v1/thoughts/${id}`);
        const data = res.data;
        if (data.uuid) {
            data.id = data.uuid;
        }
        return data;
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
                uuid: id,
                title: (title || "").trim(),
                content: (content || "").trim()
            });
            const updated = res.data.thought || res.data;
            if (updated.uuid) updated.id = updated.uuid;
            setThoughts((prev) =>
                prev.map((t) => (t.id === id || t.uuid === id ? toThoughtSummary(updated) : t))
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
            await api.post("/api/v1/thoughts/bulk-delete", { uuids: ids });
            setThoughts((prev) => prev.filter((t) => !ids.includes(t.id) && !ids.includes(t.uuid)));
        } catch (err) {
            console.error("Failed to bulk delete thoughts:", err);
            throw err;
        }
    }, []);

    const value = useMemo(
        () => ({
            thoughts,
            loading,
            page,
            perPage,
            pagination,
            changePage,
            searchQuery,
            handleSearch,
            addThought,
            editThought,
            deleteThought,
            deleteThoughts,
            fetchThoughtById,
            refreshThoughts: fetchThoughts
        }),
        [thoughts, loading, page, perPage, pagination, searchQuery, addThought, editThought, deleteThought, deleteThoughts, fetchThoughtById, fetchThoughts]
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
