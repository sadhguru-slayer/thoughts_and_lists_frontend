"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";
import { notify } from "./notify";

const NotebooksContext = createContext(null);

export function NotebooksProvider({ children }) {
    const [notebooks, setNotebooks] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchNotebooks();
        } else {
            setNotebooks([]);
            setLoading(false);
        }
    }, [user]);

    const fetchNotebooks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/notebooks`);
            setNotebooks(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notebooks:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNotebookById = useCallback(async (id) => {
        const res = await api.get(`/api/v1/notebooks/${id}`);
        return res.data;
    }, []);

    const addNotebook = useCallback(async ({ name, description }) => {
        try {
            const res = await api.post("/api/v1/notebooks", {
                name: (name || "").trim(),
                description: (description || "").trim()
            });
            const realNotebook = res.data;
            setNotebooks((prev) => [realNotebook, ...prev]);
            notify.success("Notebook created");
            return realNotebook;
        } catch (err) {
            notify.error("Failed to create notebook");
            console.error("Failed to add notebook:", err);
            throw err;
        }
    }, []);

    const editNotebook = useCallback(async (id, { name, description }) => {
        try {
            const res = await api.put(`/api/v1/notebooks/${id}`, {
                name: (name || "").trim(),
                description: (description || "").trim()
            });
            const updated = res.data;
            setNotebooks((prev) =>
                prev.map((n) => (n.uuid === id ? updated : n))
            );
            notify.success("Notebook updated");
            return updated;
        } catch (err) {
            notify.error("Failed to edit notebook");
            console.error("Failed to edit notebook:", err);
            throw err;
        }
    }, []);

    const deleteNotebook = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/notebooks/${id}`);
            setNotebooks((prev) => prev.filter((n) => n.uuid !== id));
            notify.success("Notebook deleted");
        } catch (err) {
            notify.error("Failed to delete notebook");
            console.error("Failed to delete notebook:", err);
        }
    }, []);

    // --- Notes ---
    
    const addNote = useCallback(async (notebookId, { title, content }) => {
        try {
            const res = await api.post(`/api/v1/notebooks/${notebookId}/notes`, {
                title: (title || "").trim(),
                content: (content || "").trim()
            });
            notify.success("Note created");
            return res.data;
        } catch (err) {
            notify.error("Failed to create note");
            console.error("Failed to add note:", err);
            throw err;
        }
    }, []);

    const fetchNoteById = useCallback(async (id) => {
        const res = await api.get(`/api/v1/notes/${id}`);
        return res.data;
    }, []);

    const editNote = useCallback(async (id, { title, content }) => {
        try {
            const res = await api.put(`/api/v1/notes/${id}`, {
                title: (title || "").trim(),
                content: (content || "").trim()
            });
            notify.success("Note updated");
            return res.data;
        } catch (err) {
            notify.error("Failed to edit note");
            console.error("Failed to edit note:", err);
            throw err;
        }
    }, []);

    const deleteNote = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/notes/${id}`);
            notify.success("Note deleted");
        } catch (err) {
            notify.error("Failed to delete note");
            console.error("Failed to delete note:", err);
        }
    }, []);

    const moveNote = useCallback(async (noteUuid, targetNotebookUuid = null) => {
        try {
            const res = await api.post(`/api/v1/notes/${noteUuid}/move`, {
                target_notebook_uuid: targetNotebookUuid
            });
            await fetchNotebooks();
            notify.success(targetNotebookUuid ? "Note moved to space" : "Note moved to Quick Notes");
            return res.data;
        } catch (err) {
            notify.error("Failed to move note");
            console.error("Failed to move note:", err);
            throw err;
        }
    }, [fetchNotebooks]);

    const moveThoughtToNotebook = useCallback(async (thoughtUuid, targetNotebookUuid) => {
        try {
            const res = await api.post(`/api/v1/thoughts/${thoughtUuid}/move-to-notebook`, {
                target_notebook_uuid: targetNotebookUuid
            });
            await fetchNotebooks();
            notify.success("Note moved to notebook space");
            return res.data;
        } catch (err) {
            notify.error("Failed to move note to notebook");
            console.error("Failed to move note to notebook:", err);
            throw err;
        }
    }, [fetchNotebooks]);

    const value = useMemo(
        () => ({
            notebooks,
            loading,
            fetchNotebookById,
            refreshNotebooks: fetchNotebooks,
            addNotebook,
            editNotebook,
            deleteNotebook,
            addNote,
            fetchNoteById,
            editNote,
            deleteNote,
            moveNote,
            moveThoughtToNotebook,
        }),
        [notebooks, loading, fetchNotebookById, fetchNotebooks, addNotebook, editNotebook, deleteNotebook, addNote, fetchNoteById, editNote, deleteNote, moveNote, moveThoughtToNotebook]
    );

    return (
        <NotebooksContext.Provider value={value}>
            {children}
        </NotebooksContext.Provider>
    );
}

export function useNotebooks() {
    const context = useContext(NotebooksContext);
    if (!context) {
        throw new Error("useNotebooks must be used within a NotebooksProvider");
    }
    return context;
}
