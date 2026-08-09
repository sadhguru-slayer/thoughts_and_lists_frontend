"use client";

import { Calendar } from "lucide-react";

export default function DateTimePicker({ value, onChange, placeholder = "Pick a date & time", disabled = false }) {
    return (
        <div className="relative w-full group">
            <input
                type="datetime-local"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-shadow dark:[color-scheme:dark] disabled:opacity-50 ${
                    !value ? "text-zinc-400" : "text-zinc-800 dark:text-zinc-100"
                }`}
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
    );
}
