"use client";

import { Calendar as CalendarIcon, Clock, X, Check } from "lucide-react";
import { formatFriendlyDateTime, getPresetDatetime, toDatetimeLocalValue } from "@/lib/taskUtils";

const TIME_PRESETS = [
    { label: "9:00 AM", value: "09:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "9:00 PM", value: "21:00" },
];

export default function DateTimePicker({ value, onChange, placeholder = "Pick date & time", disabled = false }) {
    const handleQuickPreset = (presetKey) => {
        if (!presetKey) {
            onChange("");
            return;
        }
        // Extract existing time if set, otherwise default to 09:00
        let existingTime = "09:00";
        if (value) {
            const parts = value.split("T");
            if (parts.length > 1 && parts[1]) {
                existingTime = parts[1].substring(0, 5);
            }
        }
        const newDatetime = getPresetDatetime(presetKey, existingTime);
        onChange(newDatetime);
    };

    const handleTimePreset = (timeVal) => {
        if (!value) {
            // Default date to today if no date picked yet
            const newDatetime = getPresetDatetime("today", timeVal);
            onChange(newDatetime);
            return;
        }

        const datePart = value.split("T")[0];
        onChange(`${datePart}T${timeVal}`);
    };

    return (
        <div className="space-y-2">
            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("today")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                    Today
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("tomorrow")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                    Tomorrow
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("next_week")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                    Next Week
                </button>

                {value && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleQuickPreset(null)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-0.5"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Main Input + Quick Time Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 group">
                    <input
                        type="datetime-local"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={`w-full text-xs sm:text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-all dark:[color-scheme:dark] disabled:opacity-50 ${
                            !value ? "text-zinc-400" : "text-zinc-800 dark:text-zinc-100 font-semibold"
                        }`}
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Quick Time Selector Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
                    {TIME_PRESETS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleTimePreset(t.value)}
                            className="text-[11px] font-medium px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap transition-colors"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Friendly Date Summary */}
            {value && (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium pl-1">
                    Scheduled for: <strong className="text-zinc-700 dark:text-zinc-200">{formatFriendlyDateTime(value)}</strong>
                </div>
            )}
        </div>
    );
}
