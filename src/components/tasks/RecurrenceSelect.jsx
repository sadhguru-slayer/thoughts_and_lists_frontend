import { Repeat } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RECURRENCE_OPTIONS = [
    { value: "NONE",    label: "Does not repeat" },
    { value: "DAILY",   label: "Daily" },
    { value: "WEEKLY",  label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
];

export default function RecurrenceSelect({ value = "NONE", onChange, disabled = false }) {
    return (
        <div className="relative flex items-center gap-2">
            <div className="absolute left-3 z-10 pointer-events-none text-zinc-400">
                <Repeat className="w-3.5 h-3.5" />
            </div>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full pl-9 pr-3 py-2.5 h-auto text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                    <SelectValue placeholder="Select Recurrence" />
                </SelectTrigger>
                <SelectContent>
                    {RECURRENCE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {value !== "NONE" && (
                <span className="absolute right-9 z-10 pointer-events-none text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                </span>
            )}
        </div>
    );
}
