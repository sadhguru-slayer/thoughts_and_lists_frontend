"use client";

import { useParams, useRouter } from "next/navigation";
import { useThoughts } from "@/lib/ThoughtsContext";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, StickyNote, Star, Pin } from "lucide-react";
import { motion } from "framer-motion";
import TiptapEditor from "@/components/thoughts/TiptapEditor";
import { cn } from "@/lib/utils";

export default function ThoughtEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const { editThought, fetchThoughtById, togglePin, toggleStar } = useThoughts();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchThoughtById(id)
            .then((thought) => {
                if (cancelled) return;
                setTitle(thought.title || "");
                setContent(thought.content || "");
                setIsPinned(thought.is_pinned || false);
                setIsStarred(thought.is_starred || false);
            })
            .catch(() => {
                if (!cancelled) setNotFound(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [id, fetchThoughtById]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await editThought(id, { title, content });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStar = () => {
        setIsStarred(prev => !prev);
        toggleStar(id, isStarred);
    };

    const handleTogglePin = () => {
        setIsPinned(prev => !prev);
        togglePin(id, isPinned);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-24 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Note not found.</p>
                <button
                    onClick={() => router.push("/thoughts")}
                    className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                    Back to Notes
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto space-y-6 pt-4 pb-20"
        >
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/thoughts")}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Back to Notes"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <StickyNote className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        Edit Note
                    </h1>
                </div>

                {/* Actions: star, pin, save */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleToggleStar}
                        className={cn(
                            "p-1.5 rounded-xl border transition-all",
                            isStarred
                                ? "text-amber-500 border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30"
                                : "text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300"
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
                                : "text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                        title={isPinned ? "Unpin note" : "Pin note"}
                    >
                        <Pin className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] shadow-2xs disabled:opacity-50",
                            saved
                                ? "bg-emerald-600 text-white"
                                : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                        )}
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {saved ? "Saved!" : "Save Note"}
                    </button>
                </div>
            </div>

            {/* Editor Card */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-4 space-y-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="w-full text-base font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                        Content
                    </label>
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your note here..."
                        disabled={saving}
                        autoFocus={true}
                    />
                </div>
            </div>
        </motion.div>
    );
}
