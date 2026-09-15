"use client";

import { useState, useRef, useCallback } from "react";
import { cn, stripHtml } from "@/lib/utils";
import { Pin, Star, Folder } from "lucide-react";
import { useThoughts } from "@/lib/ThoughtsContext";
import { formatNoteDate } from "@/lib/formatDate";
import MoveNoteModal from "@/components/notebooks/MoveNoteModal";

const TITLE_MAX = 80;
const CONTENT_MAX = 300;

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

export default function ThoughtCard({ thought, isSelected, onSelect, onOpen, isSelectMode, onEnterSelectMode }) {
    const { togglePin, toggleStar } = useThoughts();
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const longPressTimer = useRef(null);
    const didLongPress = useRef(false);

    const startLongPress = useCallback(() => {
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            onEnterSelectMode(thought.id);
        }, 500);
    }, [thought.id, onEnterSelectMode]);

    const cancelLongPress = useCallback(() => {
        clearTimeout(longPressTimer.current);
    }, []);

    const handleClick = useCallback(() => {
        if (didLongPress.current) return;
        if (isSelectMode) {
            onSelect(thought.id);
        } else {
            onOpen(thought);
        }
    }, [isSelectMode, thought, onSelect, onOpen]);

    const handleCheckbox = (e) => {
        e.stopPropagation();
        onSelect(thought.id);
    };

    const hasTitle = Boolean(thought.title?.trim());
    const contentText = thought.content_preview || thought.content;
    const cleanContent = stripHtml(contentText);

    return (
        <>
            <div
                onClick={handleClick}
                onMouseDown={startLongPress}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={startLongPress}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                className={cn(
                    "group relative break-inside-avoid mb-3 flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden",
                    "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5",
                    isSelected
                        ? "border-zinc-900 bg-amber-50/40 dark:bg-zinc-800/80 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/20"
                        : "border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800/90 dark:hover:border-zinc-700"
                )}
            >
                {/* Top Bar Checkbox & Star/Pin/Move Action Toggles */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                        onClick={handleCheckbox}
                        className={cn(
                            "transition-all shrink-0",
                            isSelectMode
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 sm:group-hover:opacity-100 pointer-events-auto"
                        )}
                    >
                        <div
                            className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shadow-2xs",
                                isSelected
                                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                    : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 hover:border-zinc-500"
                            )}
                        >
                            {isSelected && (
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Star, Pin & Move Action Toggles */}
                    <div className={cn(
                        "flex items-center gap-0.5 ml-auto transition-opacity",
                        (thought.is_pinned || thought.is_starred || isSelectMode)
                            ? "opacity-100"
                            : "opacity-0 sm:group-hover:opacity-100"
                    )}>
                        {!isSelectMode && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setIsMoveOpen(true); }}
                                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors touch-manipulation"
                                    title="Move to notebook space"
                                >
                                    <Folder className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleStar(thought.id || thought.uuid, thought.is_starred); }}
                                    className={cn("p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", thought.is_starred ? "text-amber-500 opacity-100" : "text-zinc-400")}
                                    title={thought.is_starred ? "Unstar note" : "Star note"}
                                >
                                    <Star className="w-3.5 h-3.5" fill={thought.is_starred ? "currentColor" : "none"} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); togglePin(thought.id || thought.uuid, thought.is_pinned); }}
                                    className={cn("p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", thought.is_pinned ? "text-blue-500 opacity-100" : "text-zinc-400")}
                                    title={thought.is_pinned ? "Unpin note" : "Pin note"}
                                >
                                    <Pin className="w-3.5 h-3.5" fill={thought.is_pinned ? "currentColor" : "none"} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

            {/* Note Body */}
            <div className="flex flex-col gap-1.5 min-w-0">
                {hasTitle && (
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug break-words">
                        {truncate(thought.title, TITLE_MAX)}
                    </h3>
                )}
                {cleanContent && (
                    <p className={cn(
                        "text-xs text-zinc-600 dark:text-zinc-300/90 leading-relaxed whitespace-pre-wrap break-words",
                        hasTitle ? "line-clamp-6" : "line-clamp-8 font-normal"
                    )}>
                        {truncate(cleanContent, CONTENT_MAX)}
                    </p>
                )}
            </div>

            {/* Note Footer: Phone-like Date Stamp */}
            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                <span>{formatNoteDate(thought.created_at || thought.updated_at)}</span>
                {thought.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md font-semibold">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                )}
            </div>
        </div>

        {/* Move Note Modal */}
        <MoveNoteModal
            isOpen={isMoveOpen}
            onClose={() => setIsMoveOpen(false)}
            noteId={thought.id || thought.uuid}
            isThought={true}
        />
        </>
    );
}
