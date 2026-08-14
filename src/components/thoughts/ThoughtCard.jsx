"use client";

import { useRef, useCallback } from "react";
import { cn, stripHtml } from "@/lib/utils";
import { Pin, Star } from "lucide-react";
import { useThoughts } from "@/lib/ThoughtsContext";

const TITLE_MAX = 60;
const CONTENT_MAX = 120;

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

export default function ThoughtCard({ thought, isSelected, onSelect, onOpen, isSelectMode, onEnterSelectMode }) {
    const { togglePin, toggleStar } = useThoughts();
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

    return (
        <div
            onClick={handleClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            className={cn(
                "group relative flex flex-col gap-2 rounded-2xl border p-4 shadow-2xs transition-all duration-200 cursor-pointer select-none overflow-hidden h-full min-h-[100px]",
                isSelected
                    ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            )}
        >
            {/* Top Bar Checkbox & Star/Pin Action Toggles */}
            <div className="flex items-center justify-between gap-2">
                <div
                    onClick={handleCheckbox}
                    className={cn(
                        "transition-all shrink-0",
                        isSelectMode
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto"
                    )}
                >
                    <div
                        className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shadow-2xs",
                            isSelected
                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                        )}
                    >
                        {isSelected && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Star & Pin Action Toggles: Always visible on mobile, hover-revealed on desktop unless active */}
                <div className={cn(
                    "flex items-center gap-1 transition-opacity ml-auto",
                    (thought.is_pinned || thought.is_starred || isSelectMode)
                        ? "opacity-100"
                        : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                )}>
                    {!isSelectMode && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleStar(thought.id || thought.uuid, thought.is_starred); }}
                                className={cn("p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", thought.is_starred ? "text-amber-500" : "text-zinc-400")}
                                title={thought.is_starred ? "Unstar note" : "Star note"}
                            >
                                <Star className="w-3.5 h-3.5" fill={thought.is_starred ? "currentColor" : "none"} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); togglePin(thought.id || thought.uuid, thought.is_pinned); }}
                                className={cn("p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation", thought.is_pinned ? "text-blue-500" : "text-zinc-400")}
                                title={thought.is_pinned ? "Unpin note" : "Pin note"}
                            >
                                <Pin className="w-3.5 h-3.5" fill={thought.is_pinned ? "currentColor" : "none"} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Title & Preview Content */}
            <div className="flex flex-col gap-1 min-w-0">
                {thought.title && (
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug truncate">
                        {truncate(thought.title, TITLE_MAX)}
                    </h3>
                )}
                {(thought.content_preview || thought.content) && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {truncate(stripHtml(thought.content_preview || thought.content), CONTENT_MAX)}
                    </p>
                )}
            </div>
        </div>
    );
}
