"use client";

import { useState, useMemo } from "react";
import { useNotebooks } from "@/lib/NotebooksContext";
import { Plus, Search, Folder, BookOpen, Trash2, Edit3, MoreVertical, FileText, ArrowRight, Sparkles, StickyNote } from "lucide-react";
import Link from "next/link";
import { formatNoteDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { useModal } from "@/lib/ModalContext";

// Subtle pastel theme palettes for notebook covers
const THEME_STYLES = [
    {
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
        iconBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
        gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
        ring: "group-hover:border-amber-300 dark:group-hover:border-amber-700",
    },
    {
        badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50",
        iconBg: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
        gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
        ring: "group-hover:border-indigo-300 dark:group-hover:border-indigo-700",
    },
    {
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
        iconBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
        gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
        ring: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
    },
    {
        badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50",
        iconBg: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
        gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
        ring: "group-hover:border-rose-300 dark:group-hover:border-rose-700",
    },
    {
        badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50",
        iconBg: "bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
        gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
        ring: "group-hover:border-sky-300 dark:group-hover:border-sky-700",
    },
    {
        badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
        iconBg: "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
        ring: "group-hover:border-purple-300 dark:group-hover:border-purple-700",
    },
];

function getTheme(index) {
    return THEME_STYLES[index % THEME_STYLES.length];
}

export default function NotebooksPage() {
    const { notebooks, loading, addNotebook, editNotebook, deleteNotebook } = useNotebooks();
    const { showConfirm } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Edit modal state
    const [editingNotebook, setEditingNotebook] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            setSubmitting(true);
            await addNotebook({ name, description });
            setName("");
            setDescription("");
            setIsCreating(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (e, notebook) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingNotebook(notebook);
        setEditName(notebook.name);
        setEditDesc(notebook.description || "");
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editName.trim() || !editingNotebook) return;
        try {
            setSubmitting(true);
            await editNotebook(editingNotebook.uuid, { name: editName, description: editDesc });
            setEditingNotebook(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (e, notebookUuid, notebookName) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmed = await showConfirm({
            title: `Delete "${notebookName}"?`,
            description: "This will permanently remove this space and all of its notes. This action cannot be undone.",
            confirmText: "Delete Space",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            await deleteNotebook(notebookUuid);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNotebooks = useMemo(() => {
        if (!searchQuery.trim()) return notebooks;
        const q = searchQuery.toLowerCase();
        return notebooks.filter(
            (n) =>
                n.name.toLowerCase().includes(q) ||
                (n.description && n.description.toLowerCase().includes(q))
        );
    }, [notebooks, searchQuery]);

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header Greeting / Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <StickyNote className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                        Notes & Notebooks
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Capture quick thoughts, ideas, and organized notebooks.
                    </p>
                </div>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full gap-1 border border-zinc-200/50 dark:border-zinc-800/50">
                    <Link
                        href="/thoughts"
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-900/50 transition-all"
                    >
                        <StickyNote className="w-3.5 h-3.5" />
                        Quick Notes
                    </Link>
                    <button 
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-2xs transition-all"
                    >
                        <Folder className="w-3.5 h-3.5 text-amber-500" />
                        Notebooks (Spaces)
                    </button>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-2xs active:scale-95 ml-auto"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Space
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search notebook spaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all dark:text-zinc-200 placeholder:text-zinc-400 shadow-2xs"
                />
            </div>

            {/* Create Notebook Form */}
            {isCreating && (
                <form
                    onSubmit={handleCreate}
                    className="relative overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        <Folder className="w-4 h-4 text-amber-500" />
                        Create New Notebook Space
                    </div>
                    
                    <input
                        type="text"
                        placeholder="e.g. Work Projects, Book Summaries, Personal Goals..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/50 px-3.5 py-2.5 text-sm font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:focus:ring-zinc-100/10 text-zinc-900 dark:text-zinc-100"
                        autoFocus
                        required
                    />

                    <textarea
                        placeholder="Optional description or purpose of this notebook..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/50 px-3.5 py-2 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:focus:ring-zinc-100/10 resize-none text-zinc-700 dark:text-zinc-300"
                        rows={2}
                    />

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-2xs transition-all active:scale-95"
                        >
                            {submitting ? "Creating…" : "Create Space"}
                        </button>
                    </div>
                </form>
            )}

            {/* Edit Notebook Modal */}
            {editingNotebook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleSaveEdit}
                        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-zinc-500" /> Rename Notebook
                        </h3>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                            required
                            autoFocus
                        />
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-800 resize-none text-zinc-700 dark:text-zinc-300"
                            rows={2}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingNotebook(null)}
                                className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !editName.trim()}
                                className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-2xs"
                            >
                                {submitting ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notebooks Grid */}
            {loading && notebooks.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-medium text-zinc-400">Loading spaces…</p>
                </div>
            ) : filteredNotebooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-500 mb-3 shadow-2xs">
                        <Folder className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {searchQuery ? "No matching notebooks" : "No notebook spaces yet"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                        {searchQuery
                            ? "Try searching for a different keyword or create a new space."
                            : "Create your first notebook to organize project notes, study materials, or personal archives."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-2xs transition-all active:scale-95"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Create First Notebook
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotebooks.map((notebook, idx) => {
                        const theme = getTheme(idx);
                        const notesCount = notebook.notes?.length || 0;
                        const latestNote = notebook.notes?.[0];

                        return (
                            <Link
                                href={`/notebooks/${notebook.uuid}`}
                                key={notebook.uuid}
                                className={cn(
                                    "group relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer overflow-hidden",
                                    "bg-white dark:bg-zinc-900/90 hover:shadow-md hover:-translate-y-0.5 border-zinc-200/90 dark:border-zinc-800",
                                    theme.ring
                                )}
                            >
                                {/* Top colored ambient banner accent */}
                                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", theme.gradient)} />

                                <div>
                                    {/* Top bar with folder icon & note count pill badge */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs", theme.iconBg)}>
                                            <Folder className="w-4.5 h-4.5" />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs", theme.badge)}>
                                                {notesCount} {notesCount === 1 ? "note" : "notes"}
                                            </span>

                                            {/* Action buttons (Rename / Delete) */}
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleStartEdit(e, notebook)}
                                                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    title="Rename notebook"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, notebook.uuid, notebook.name)}
                                                    className="p-1 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
                                                    title="Delete notebook"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notebook Title & Description */}
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-1">
                                        {notebook.name}
                                    </h3>

                                    {notebook.description ? (
                                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                                            {notebook.description}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 italic">
                                            No description
                                        </p>
                                    )}
                                </div>

                                {/* Preview of latest note / Bottom timestamp */}
                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                                    <span className="truncate max-w-[180px]">
                                        {latestNote ? (
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{latestNote.title || "Untitled note"}</span>
                                            </span>
                                        ) : (
                                            <span>Empty space</span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-zinc-500 dark:text-zinc-400 font-medium">
                                        Open <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
