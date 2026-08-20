"use client";

import { useState, useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { formatFriendlyDateTime, toDatetimeLocalValue } from "@/lib/taskUtils";
import DateTimePicker from "./DateTimePicker";

export default function ReminderPicker({ dueDate, value, onChange, disabled = false }) {
    const [mode, setMode] = useState("none");
    const [customOpen, setCustomOpen] = useState(false);

    useEffect(() => {
        if (!value) {
            setMode("none");
        } else if (dueDate && value === dueDate) {
            setMode("same");
        } else {
            setMode("custom");
        }
    }, [value, dueDate]);

    const handlePresetSelect = (presetMode) => {
        if (presetMode === "none") {
            setMode("none");
            onChange("");
            setCustomOpen(false);
            return;
        }

        if (presetMode === "same") {
            setMode("same");
            onChange(dueDate || "");
            setCustomOpen(false);
            return;
        }

        if (!dueDate) {
            const now = new Date();
            const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
            if (defaultDate < now) defaultDate.setTime(now.getTime() + 60 * 60 * 1000);
            const val = toDatetimeLocalValue(defaultDate);
            setMode("custom");
            onChange(val);
            setCustomOpen(true);
            return;
        }

        const dueMs = new Date(dueDate).getTime();
        let targetMs = dueMs;

        if (presetMode === "15m") {
            targetMs = dueMs - 15 * 60 * 1000;
        } else if (presetMode === "1h") {
            targetMs = dueMs - 60 * 60 * 1000;
        } else if (presetMode === "1d") {
            targetMs = dueMs - 24 * 60 * 60 * 1000;
        }

        const calculatedIso = toDatetimeLocalValue(new Date(targetMs));
        setMode(presetMode);
        onChange(calculatedIso);
        setCustomOpen(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetSelect("none")}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        mode === "none"
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-2xs"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    Off
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetSelect("same")}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        mode === "same"
                            ? "bg-violet-600 text-white border-transparent shadow-2xs"
                            : "bg-violet-50/80 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                    }`}
                >
                    At due time
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetSelect("15m")}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        mode === "15m"
                            ? "bg-violet-600 text-white border-transparent shadow-2xs"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    15m before
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetSelect("1h")}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        mode === "1h"
                            ? "bg-violet-600 text-white border-transparent shadow-2xs"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    1h before
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        setCustomOpen(!customOpen);
                        if (!customOpen && mode !== "custom") {
                            setMode("custom");
                        }
                    }}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                        mode === "custom" || customOpen
                            ? "bg-violet-600 text-white border-transparent shadow-2xs"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                >
                    <Clock className="w-3 h-3" />
                    Custom
                </button>
            </div>

            {customOpen && (
                <div className="pt-1">
                    <DateTimePicker
                        value={value}
                        onChange={(val) => {
                            setMode("custom");
                            onChange(val);
                        }}
                        placeholder="Select custom reminder time"
                        disabled={disabled}
                    />
                </div>
            )}

            {value && (
                <div className="flex items-center gap-1.5 text-[11px] text-violet-600 dark:text-violet-400 font-semibold pt-0.5">
                    <Bell className="w-3 h-3 shrink-0" />
                    <span>Reminder: <strong>{formatFriendlyDateTime(value)}</strong></span>
                </div>
            )}
        </div>
    );
}
