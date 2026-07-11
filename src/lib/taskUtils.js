const LOCALE = "en-US";

export const PRIORITY_CONFIG = {
    LOW: { label: "Low", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
    MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
    HIGH: { label: "High", className: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" },
    URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
};

export const STATUS_CONFIG = {
    TODO: { label: "To do", className: "text-zinc-500 dark:text-zinc-400" },
    IN_PROGRESS: { label: "In progress", className: "text-blue-600 dark:text-blue-400" },
    COMPLETED: { label: "Completed", className: "text-green-600 dark:text-green-400" },
    CANCELLED: { label: "Cancelled", className: "text-zinc-400 dark:text-zinc-500" },
};

export function formatTaskDate(iso) {
    if (!iso) return null;
    try {
        return new Intl.DateTimeFormat(LOCALE, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function toDatetimeLocalValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value) {
    if (!value) return null;
    return new Date(value).toISOString();
}

export function isOverdue(task) {
    if (!task?.due_date || task.completed || task.status === "COMPLETED") return false;
    return new Date(task.due_date) < new Date();
}
