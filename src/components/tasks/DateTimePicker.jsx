"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, "0"); }

function toLocalISO(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalISO(str) {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d) ? null : d;
}

function formatDisplay(date) {
    if (!date) return null;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (sameDay(date, now)) return `Today at ${timeStr}`;
    if (sameDay(date, tomorrow)) return `Tomorrow at ${timeStr}`;

    const diff = Math.round((date - now) / 86400000);
    if (diff > 0 && diff <= 6)
        return `${date.toLocaleDateString([], { weekday: "short" })} at ${timeStr}`;

    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ── Quick shortcuts ──────────────────────────────────────────────────────────
function quickDate(label) {
    const d = new Date();
    if (label === "Later today") { d.setHours(d.getHours() + 2, 0, 0, 0); return d; }
    if (label === "Tomorrow")    { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; }
    if (label === "Next week")   { d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d; }
    return d;
}
const QUICK_LABELS = ["Later today", "Tomorrow", "Next week"];

// ── Calendar grid ────────────────────────────────────────────────────────────
function CalGrid({ year, month, selected, onPick }) {
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: first + days }, (_, i) =>
        i < first ? null : i - first + 1
    );

    const today = new Date();

    return (
        <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map(d => (
                <div key={d} className="text-[10px] font-bold text-center text-zinc-400 pb-1">{d}</div>
            ))}
            {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const isSel   = selected && selected.getDate() === day && selected.getMonth() === month && selected.getFullYear() === year;
                return (
                    <button
                        key={day}
                        type="button"
                        onClick={() => onPick(day)}
                        className={`w-full aspect-square rounded-lg text-xs font-medium transition-all ${
                            isSel
                                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                : isToday
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-300 dark:ring-zinc-600"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {day}
                    </button>
                );
            })}
        </div>
    );
}

// ── Time selector ────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINS  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function TimePicker({ hour, minute, onHour, onMin }) {
    const hourRef = useRef(null);
    const minRef  = useRef(null);

    // Auto-scroll to selected value whenever picker mounts or selection changes
    useEffect(() => {
        if (hourRef.current) {
            const el = hourRef.current.querySelector(`[data-h="${hour}"]`);
            if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }, [hour]);

    useEffect(() => {
        if (minRef.current) {
            const el = minRef.current.querySelector(`[data-m="${minute}"]`);
            if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }, [minute]);

    return (
        <div className="flex gap-2 items-center justify-center mt-3 px-1">
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Hr</span>
                <div ref={hourRef} className="h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 space-y-0.5 pr-1">
                    {HOURS.map(h => (
                        <button
                            key={h}
                            data-h={h}
                            type="button"
                            onClick={() => onHour(h)}
                            className={`w-10 text-xs font-semibold rounded-lg py-1 transition-all ${
                                h === hour
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                        >
                            {pad(h)}
                        </button>
                    ))}
                </div>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600 font-bold">:</span>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Min</span>
                <div ref={minRef} className="h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 space-y-0.5 pr-1">
                    {MINS.map(m => (
                        <button
                            key={m}
                            data-m={m}
                            type="button"
                            onClick={() => onMin(m)}
                            className={`w-10 text-xs font-semibold rounded-lg py-1 transition-all ${
                                m === minute
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                        >
                            {pad(m)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DateTimePicker({ value, onChange, placeholder = "Pick a date & time", disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref       = useRef(null);
    const popoverRef = useRef(null);
    const [popoverStyle, setPopoverStyle] = useState({});

    const selected = value ? fromLocalISO(value) : null;

    const now = new Date();
    const [viewYear,  setViewYear]  = useState(selected?.getFullYear()  ?? now.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth()     ?? now.getMonth());
    const [hour,      setHour]      = useState(selected?.getHours()     ?? 9);
    const [minute,    setMinute]    = useState(selected?.getMinutes()   ?? 0);

    // Compute fixed position relative to the trigger button
    const computePosition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const popoverW = 288; // w-72
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        const openUpward = spaceBelow < 360 && spaceAbove > spaceBelow;

        setPopoverStyle({
            position: "fixed",
            left: Math.min(rect.left, window.innerWidth - popoverW - 8),
            top: openUpward ? undefined : rect.bottom + 6,
            bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
            width: Math.max(rect.width, popoverW),
            zIndex: 9999,
        });
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        computePosition();
        function handler(e) {
            if (
                ref.current && !ref.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        window.addEventListener("resize", computePosition);
        window.addEventListener("scroll", computePosition, true);
        return () => {
            document.removeEventListener("mousedown", handler);
            window.removeEventListener("resize", computePosition);
            window.removeEventListener("scroll", computePosition, true);
        };
    }, [open, computePosition]);

    // Sync state when value changes externally
    useEffect(() => {
        if (selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
            setHour(selected.getHours());
            setMinute(selected.getMinutes());
        }
    }, [value]);

    function pickDay(day) {
        const d = new Date(viewYear, viewMonth, day, hour, minute, 0, 0);
        onChange(toLocalISO(d));
    }

    function handleHour(h) {
        setHour(h);
        if (selected) {
            const d = new Date(selected);
            d.setHours(h);
            d.setMinutes(minute);
            onChange(toLocalISO(d));
        }
    }

    function handleMin(m) {
        setMinute(m);
        if (selected) {
            const d = new Date(selected);
            d.setMinutes(m);
            onChange(toLocalISO(d));
        }
    }

    function handleQuick(label) {
        const d = quickDate(label);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setHour(d.getHours());
        setMinute(d.getMinutes());
        onChange(toLocalISO(d));
    }

    function handleClear(e) {
        e.stopPropagation();
        onChange("");
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    const display = formatDisplay(selected);

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className={`flex-1 truncate ${display ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400"}`}>
                    {display ?? placeholder}
                </span>
                {selected && (
                    <span
                        role="button"
                        onClick={handleClear}
                        className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </span>
                )}
                {!selected && <Clock className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />}
            </button>

            {/* Popover — rendered in a portal so it escapes overflow:hidden parents */}
            <AnimatePresence>
                {open && typeof window !== "undefined" && createPortal(
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
                        style={popoverStyle}
                    >
                        {/* Quick picks */}
                        <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-zinc-100 dark:border-zinc-800">
                            {QUICK_LABELS.map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => handleQuick(l)}
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* Calendar navigation */}
                        <div className="flex items-center justify-between px-3 pt-3 pb-2">
                            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                                {MONTHS[viewMonth]} {viewYear}
                            </span>
                            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Calendar grid */}
                        <div className="px-3 pb-2">
                            <CalGrid year={viewYear} month={viewMonth} selected={selected} onPick={pickDay} />
                        </div>

                        {/* Time picker */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800 pb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center mt-2 mb-1">Time</p>
                            <TimePicker hour={hour} minute={minute} onHour={handleHour} onMin={handleMin} />
                        </div>

                        {/* Footer */}
                        {selected && (
                            <div className="px-3 pb-3">
                                <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                    {selected.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                    {" · "}
                                    {pad(hour)}:{pad(minute)}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="mt-2 w-full text-xs font-bold py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all hover:opacity-90 active:scale-[0.98]"
                                >
                                    Confirm
                                </button>
                            </div>
                        )}
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    );
}
