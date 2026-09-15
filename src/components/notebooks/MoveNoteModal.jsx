"use client";

import { useState } from "react";
import { useNotebooks } from "@/lib/NotebooksContext";
import { useThoughts } from "@/lib/ThoughtsContext";
import { Folder, StickyNote, X, Loader2, Check, ArrowRight } from "lucide-react";
import { notify } from "@/lib/notify";

export default function MoveNoteModal({ isOpen, onClose, noteId, currentNotebookId = null, isThought = false, onMoved }) {
    const { notebooks, moveNote, moveThoughtToNotebook } = useNotebooks();
    const { refreshThoughts } = useThoughts();
    const [selectedTarget, setSelectedTarget] = useState(currentNotebookId || (isThought ? "quick-notes" : null));
    const [moving, setMoving] = useState(false);

    if (!isOpen) return null;

    const handleMove = async () => {
        if (!noteId) return;
        try {
            setMoving(true);
            if (isThought) {
                // Moving from Quick Notes (Thought) to a Notebook
                if (selectedTarget === "quick-notes") {
                    onClose();
                    return;
                }
                await moveThoughtToNotebook(noteId, selectedTarget);
                await refreshThoughts();
            } else {
                // Moving from a Notebook to another Notebook or to Quick Notes
                const targetUuid = selectedTarget === "quick-notes" ? null : selectedTarget;
                await moveNote(noteId, targetUuid);
                await refreshThoughts();
            }

            if (onMoved) onMoved(selectedTarget);
            onClose();
        } catch (err) {
            console.error("Failed to move note:", err);
        } finally {
            setMoving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-amber-500" /> Move Note
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select a destination space or move to Quick Notes.
                </p>

                {/* Destinations List */}
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {/* Option 1: Quick Notes */}
                    <button
                        type="button"
                        onClick={() => setSelectedTarget("quick-notes")}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                            selectedTarget === "quick-notes"
                                ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/80 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-900/10"
                                : "border-zinc-200/70 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                <StickyNote className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <div className="font-semibold">Quick Notes</div>
                                <div className="text-[10px] text-zinc-400">Uncategorized notes</div>
                            </div>
                        </div>
                        {selectedTarget === "quick-notes" && (
                            <Check className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                        )}
                    </button>

                    {/* Notebook Options */}
                    {notebooks.map((nb) => {
                        const isSelected = selectedTarget === nb.uuid;
                        const isCurrent = currentNotebookId === nb.uuid;

                        return (
                            <button
                                key={nb.uuid}
                                type="button"
                                onClick={() => setSelectedTarget(nb.uuid)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                                    isSelected
                                        ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/80 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-900/10"
                                        : "border-zinc-200/70 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <Folder className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="truncate">
                                        <div className="font-semibold truncate">{nb.name}</div>
                                        <div className="text-[10px] text-zinc-400">
                                            {isCurrent ? "Current space" : `${nb.notes?.length || 0} notes`}
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleMove}
                        disabled={moving || (isThought && selectedTarget === "quick-notes") || (!isThought && selectedTarget === currentNotebookId)}
                        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 shadow-2xs transition-all active:scale-95"
                    >
                        {moving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        {moving ? "Moving…" : "Move Note"}
                    </button>
                </div>
            </div>
        </div>
    );
}
