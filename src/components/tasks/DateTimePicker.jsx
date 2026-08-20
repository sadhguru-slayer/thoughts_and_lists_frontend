"use client";

import { Calendar as CalendarIcon, X } from "lucide-react";
import { formatFriendlyDateTime, getPresetDatetime } from "@/lib/taskUtils";

const TIME_PRESETS = [
    { label: "9 AM", value: "09:00" },
    { label: "1 PM", value: "13:00" },
    { label: "6 PM", value: "18:00" },
    { label: "9 PM", value: "21:00" },
];

export default function DateTimePicker({ value, onChange, placeholder = "Pick date & time", disabled = false }) {
    const handleQuickPreset = (presetKey) => {
        if (!presetKey) {
            onChange("");
            return;
        }
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
            const newDatetime = getPresetDatetime("today", timeVal);
            onChange(newDatetime);
            return;
        }
        const datePart = value.split("T")[0];
        onChange(`${datePart}T${timeVal}`);
    };

    return (
        <div className="space-y-2.5">
            {/* Quick Date Presets Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("today")}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    Today
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("tomorrow")}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    Tomorrow
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleQuickPreset("next_week")}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    Next Week
                </button>

                {value && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleQuickPreset(null)}
                        className="px-2 py-1 rounded-lg text-zinc-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 ml-auto"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Custom Datetime Input + Time Shortcuts */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <input
                        type="datetime-local"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={`w-full text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-zinc-600 transition-all dark:[color-scheme:dark] disabled:opacity-50 ${
                            !value ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
                        }`}
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto shrink-0">
                    {TIME_PRESETS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleTimePreset(t.value)}
                            className="text-[11px] font-medium px-2 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {value && (
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Scheduled: <span className="text-zinc-900 dark:text-zinc-100">{formatFriendlyDateTime(value)}</span>
                </div>
            )}
        </div>
    );
}
