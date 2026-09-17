"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useNotebooks } from "@/lib/NotebooksContext";
import { ChevronLeft, Trash2, Search, Folder, FileText, ArrowUpDown, Edit3, ArrowRight, Star, Pin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNoteDate } from "@/lib/formatDate";
import { cn, stripHtml } from "@/lib/utils";
import { useModal } from "@/lib/ModalContext";
import ThoughtInput from "@/components/thoughts/ThoughtInput";
import MoveNoteModal from "@/components/notebooks/MoveNoteModal";

export default function NotebookDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();

    const { fetchNotebookById, addNote, deleteNote, editNotebook, deleteNotebook } = useNotebooks();
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest" | "title"

    // Edit notebook meta modal
    const [isEditingMeta, setIsEditingMeta] = useState(false);
    const [editMetaName, setEditMetaName] = useState("");
    const [editMetaDesc, setEditMetaDesc] = useState("");

    // Move note state
    const [movingNoteUuid, setMovingNoteUuid] = useState(null);

    const loadNotebook = async () => {
        try {
            setLoading(true);
            const data = await fetchNotebookById(id);
            if (data) {
                setNotebook(data);
                setEditMetaName(data.name || "");
                setEditMetaDesc(data.description || "");
            }
        } catch (err) {
            console.error("Failed to load notebook:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotebook();
    }, [id, fetchNotebookById]);

    const handleAddNote = async ({ title, content }) => {
        const newNote = await addNote(id, {
            title: title.trim() || "Untitled Note",
            content: content.trim()
        });
        setNotebook((prev) => ({
            ...prev,
            notes: [newNote, ...(prev.notes || [])]
        }));
    };

    const { showConfirm } = useModal();

    const handleDeleteNote = async (e, noteUuid) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmed = await showConfirm({
            title: "Delete Note?",
            description: "Are you sure you want to permanently delete this note?",
            confirmText: "Delete",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            await deleteNote(noteUuid);
            setNotebook((prev) => ({
                ...prev,
                notes: (prev.notes || []).filter((n) => n.uuid !== noteUuid)
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveMeta = async (e) => {
        e.preventDefault();
        if (!editMetaName.trim()) return;
        try {
            const updated = await editNotebook(id, { name: editMetaName, description: editMetaDesc });
            setNotebook((prev) => ({ ...prev, ...updated }));
            setIsEditingMeta(false);
        } catch (err) {
            console.error(err);
        }
    };

    const processedNotes = useMemo(() => {
        if (!notebook?.notes) return [];
        let list = [...notebook.notes];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (n) =>
                    (n.title && n.title.toLowerCase().includes(q)) ||
                    (n.content && n.content.toLowerCase().includes(q))
            );
        }

        list.sort((a, b) => {
            if (sortOrder === "title") {
                return (a.title || "").localeCompare(b.title || "");
            }
            const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
            const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
            return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
        });

        return list;
    }, [notebook, searchQuery, sortOrder]);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent dark:border-zinc-100 dark:border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-400">Loading notebook…</p>
            </div>
        );
    }

    if (!notebook) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Notebook not found</p>
                <Link
                    href="/notebooks"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
                >
                    <ChevronLeft className="w-4 h-4" /> Return to Spaces
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header with Navigation & Notebook Meta */}
            <div className="flex flex-col gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                <div className="flex items-center justify-between">
                    <Link
                        href="/notebooks"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> All Spaces
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditingMeta(true)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Space
                        </button>
                        <button
                            onClick={async () => {
                                const confirmed = await showConfirm({
                                    title: `Delete "${notebook.name}"?`,
                                    description: "This will permanently remove this space and all of its notes. This action cannot be undone.",
                                    confirmText: "Delete Space",
                                    variant: "danger"
                                });
                                if (!confirmed) return;
                                try {
                                    await deleteNotebook(id);
                                    router.push('/notebooks');
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs flex items-center gap-1"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Space
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Folder className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {notebook.name}
                            </h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                                {notebook.notes?.length || 0} notes
                            </span>
                        </div>
                        {notebook.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                                {notebook.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Space Info Modal */}
            {isEditingMeta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleSaveMeta}
                        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-zinc-500" /> Edit Space Info
                        </h3>
                        <input
                            type="text"
                            value={editMetaName}
                            onChange={(e) => setEditMetaName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                            required
                        />
                        <textarea
                            value={editMetaDesc}
                            onChange={(e) => setEditMetaDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-800 resize-none text-zinc-700 dark:text-zinc-300"
                            rows={2}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditingMeta(false)}
                                className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-2xs"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Unified Note Composer (Same UX as Quick Notes) */}
            <ThoughtInput
                onAdd={handleAddNote}
                placeholder={`Take a note in ${notebook.name}...`}
            />

            {/* Search & Sort inside Notebook */}
            {(notebook.notes?.length || 0) > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search in this space..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all dark:text-zinc-200 placeholder:text-zinc-400 shadow-2xs"
                        />
                    </div>

                    <div className="relative flex items-center shrink-0">
                        <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-8 pr-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none shadow-2xs"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Notes Masonry Grid */}
            {processedNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {searchQuery ? "No matching notes in this space." : "This space has no notes yet. Type above to create one!"}
                    </p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-3.5 [column-fill:_balance]">
                    {processedNotes.map((note) => {
                        const cleanContent = stripHtml(note.content);
                        return (
                            <Link
                                key={note.uuid}
                                href={`/notebooks/${id}/notes/${note.uuid}`}
                                className={cn(
                                    "group relative break-inside-avoid mb-3.5 flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden block",
                                    "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 border-zinc-200/90 dark:border-zinc-800/90"
                                )}
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug break-words">
                                            {note.title || "Untitled Note"}
                                        </h3>

                                        {/* Action buttons (Move / Delete / Star / Pin) */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setMovingNoteUuid(note.uuid);
                                                }}
                                                className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                title="Move note to another space or Quick Notes"
                                            >
                                                <Folder className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    await editNote(note.uuid, { is_starred: !note.is_starred });
                                                    loadNotebook();
                                                }}
                                                className={cn("p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", note.is_starred ? "text-amber-500 opacity-100" : "text-zinc-400")}
                                                title={note.is_starred ? "Unstar note" : "Star note"}
                                            >
                                                <Star className="w-3.5 h-3.5" fill={note.is_starred ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    await editNote(note.uuid, { is_pinned: !note.is_pinned });
                                                    loadNotebook();
                                                }}
                                                className={cn("p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", note.is_pinned ? "text-blue-500 opacity-100" : "text-zinc-400")}
                                                title={note.is_pinned ? "Unpin note" : "Pin note"}
                                            >
                                                <Pin className="w-3.5 h-3.5" fill={note.is_pinned ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteNote(e, note.uuid)}
                                                className="text-zinc-400 hover:text-red-500 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                title="Delete note"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {cleanContent && (
                                        <p className="text-xs text-zinc-600 dark:text-zinc-300/90 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
                                            {cleanContent}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                                    <span>{formatNoteDate(note.created_at || note.updated_at)}</span>
                                    {note.is_pinned && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md font-semibold">
                                            <Pin className="w-2.5 h-2.5" /> Pinned
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Move Note Modal */}
            <MoveNoteModal
                isOpen={Boolean(movingNoteUuid)}
                onClose={() => setMovingNoteUuid(null)}
                noteId={movingNoteUuid}
                currentNotebookId={id}
                isThought={false}
                onMoved={() => {
                    loadNotebook();
                }}
            />
        </div>
    );
}
