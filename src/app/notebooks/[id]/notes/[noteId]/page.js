"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useNotebooks } from "@/lib/NotebooksContext";
import { ChevronLeft, Save, Trash2, Loader2, Clock, Folder, Star, Pin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { formatNoteDate } from "@/lib/formatDate";
import { useModal } from "@/lib/ModalContext";
import MoveNoteModal from "@/components/notebooks/MoveNoteModal";
import TiptapEditor from "@/components/thoughts/TiptapEditor";
import { cn } from "@/lib/utils";

export default function NoteDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id: notebookId, noteId } = resolvedParams;
    const router = useRouter();

    const { fetchNoteById, editNote, deleteNote } = useNotebooks();
    const [note, setNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isMoveOpen, setIsMoveOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        const loadNote = async () => {
            try {
                setLoading(true);
                const data = await fetchNoteById(noteId);
                if (mounted && data) {
                    setNote(data);
                    setTitle(data.title || "");
                    setContent(data.content || "");
                    setIsPinned(data.is_pinned || false);
                    setIsStarred(data.is_starred || false);
                    setLastSaved(data.updated_at || data.created_at);
                }
            } catch (err) {
                console.error("Failed to load note:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadNote();
        return () => { mounted = false; };
    }, [noteId, fetchNoteById]);

    const handleSave = useCallback(async () => {
        if (!title.trim() && !content.trim()) return;
        try {
            setSaving(true);
            const updated = await editNote(noteId, {
                title: title.trim() || "Untitled Note",
                content: content.trim()
            });
            setLastSaved(new Date().toISOString());
            if (updated) setNote(updated);
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    }, [noteId, title, content, editNote]);

    const handleToggleStar = async () => {
        const newVal = !isStarred;
        setIsStarred(newVal);
        await editNote(noteId, { is_starred: newVal });
    };

    const handleTogglePin = async () => {
        const newVal = !isPinned;
        setIsPinned(newVal);
        await editNote(noteId, { is_pinned: newVal });
    };

    // Keyboard shortcut: Cmd+S / Ctrl+S to save
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    const { showConfirm } = useModal();

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: "Delete Note?",
            description: "Are you sure you want to permanently delete this note? This action cannot be undone.",
            confirmText: "Delete",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            await deleteNote(noteId);
            router.push(`/notebooks/${notebookId}`);
        } catch (err) {
            console.error(err);
        }
    };

    const wordCount = content.trim() ? content.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const charCount = content.replace(/<[^>]*>?/gm, '').length;

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <p className="text-xs text-zinc-400">Loading note…</p>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Note not found.</p>
                <Link
                    href={`/notebooks/${notebookId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
                >
                    <ChevronLeft className="w-4 h-4" /> Return to Space
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-8rem)] pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Bar Navigation & Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-6 shrink-0 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/notebooks/${notebookId}`}
                        className="inline-flex items-center gap-1 p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
                    >
                        <ChevronLeft className="h-4 w-4" /> Space Notes
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timestamp / Status */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 mr-2">
                        <Clock className="w-3 h-3" />
                        <span>{lastSaved ? `Saved ${formatNoteDate(lastSaved)}` : "Unsaved"}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleToggleStar}
                        className={cn(
                            "p-1.5 rounded-xl border transition-all",
                            isStarred
                                ? "text-amber-500 border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30"
                                : "text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                        title={isStarred ? "Unstar note" : "Star note"}
                    >
                        <Star className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} />
                    </button>

                    <button
                        type="button"
                        onClick={handleTogglePin}
                        className={cn(
                            "p-1.5 rounded-xl border transition-all",
                            isPinned
                                ? "text-blue-500 border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30"
                                : "text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                        title={isPinned ? "Unpin note" : "Pin note"}
                    >
                        <Pin className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={() => setIsMoveOpen(true)}
                        className="flex items-center gap-1.5 p-2 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
                        title="Move to another space"
                    >
                        <Folder className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Move</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete note"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-2xs active:scale-95 ml-1"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Document Canvas (Apple Notes style) */}
            <div className="flex flex-col flex-1 gap-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-2xs">
                {/* Title */}
                <input
                    type="text"
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:outline-none dark:text-zinc-50 shrink-0 border-none p-0"
                />

                {/* Sub-header meta info */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                    <span className="ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium text-zinc-500 dark:text-zinc-400">
                        ⌘S to save
                    </span>
                </div>
                
                {/* Content Body */}
                <div className="w-full flex-1 min-h-[350px]">
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Start typing your thoughts, ideas, lists, or notes here..."
                        disabled={saving}
                        autoFocus={true}
                    />
                </div>
            </div>

            {/* Move Note Modal */}
            <MoveNoteModal
                isOpen={isMoveOpen}
                onClose={() => setIsMoveOpen(false)}
                noteId={noteId}
                currentNotebookId={notebookId}
                isThought={false}
                onMoved={(targetId) => {
                    if (targetId === "quick-notes") {
                        router.push("/thoughts");
                    } else if (targetId && targetId !== notebookId) {
                        router.push(`/notebooks/${targetId}`);
                    }
                }}
            />
        </div>
    );
}
