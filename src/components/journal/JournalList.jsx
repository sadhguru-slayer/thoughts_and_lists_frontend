"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Clock, Layers, Trash2, Calendar as CalendarIcon, FileText } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { useJournal } from "@/lib/JournalContext";
import { notify } from "@/lib/notify";
import ConfirmModal from "@/components/ui/ConfirmModal";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

function formatFullDate(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return { dayName, dayNum, monthName, year, timeStr };
  } catch {
    return { dayName: "", dayNum: "--", monthName: "", year: "", timeStr: "" };
  }
}

function groupJournalsByMonth(journals) {
  const groups = [];
  const map = new Map();

  for (const j of journals) {
    const d = new Date(j.date);
    const key = Number.isNaN(d.getTime())
      ? "Other Entries"
      : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!map.has(key)) {
      const group = { title: key, items: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).items.push(j);
  }
  return groups;
}

export default function JournalList({ journals = [], viewMode = "timeline" }) {
  const { handleDelete } = useJournal();
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRequestDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await handleDelete(deletingId);
      notify.success("Journal entry deleted");
    } catch (err) {
      notify.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (journals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20"
      >
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center shadow-2xs">
          <BookOpen className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No journal entries found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Start capturing your thoughts, daily reflections, and memories.
          </p>
        </div>
        <Link
          href="/journals/write"
          className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2 transition-all active:scale-95 hover:opacity-90 shadow-2xs"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Write entry
        </Link>
      </motion.div>
    );
  }

  const grouped = groupJournalsByMonth(journals);

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {grouped.map((group) => (
          <div key={group.title} className="space-y-4">
            {/* Month Section Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {group.title}
                </h2>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {viewMode === "timeline" ? (
              /* Timeline View */
              <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-4">
                {group.items.map((j) => {
                  const { dayName, dayNum, monthName, year, timeStr } = formatFullDate(j.date);
                  const previewText = stripHtml(j.content || "");
                  const sectionsCount = j.sections?.length || 0;

                  return (
                    <div key={j.id} className="relative group">
                      {/* Timeline Node Bullet */}
                      <div className="absolute -left-[21px] sm:-left-[29px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors shadow-2xs" />

                      <Link href={`/journals/${j.uuid || j.id}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer">
                          
                          {/* Left: Date Badge + Content */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
                              <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 leading-none">
                                {dayName}
                              </span>
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
                                {dayNum}
                              </span>
                            </div>

                            {/* Title & Preview */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {j.title || `Journal Entry — ${monthName} ${dayNum}`}
                                </h3>
                                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
                                  {timeStr}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {previewText || "No additional notes..."}
                              </p>
                            </div>
                          </div>

                          {/* Right Meta & Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60 shrink-0">
                            {sectionsCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                <Layers className="w-3 h-3 text-zinc-400" />
                                {sectionsCount} {sectionsCount === 1 ? "section" : "sections"}
                              </span>
                            )}

                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => onRequestDelete(e, j.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>

                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((j) => {
                  const { dayName, dayNum, monthName, year, timeStr } = formatFullDate(j.date);
                  const previewText = stripHtml(j.content || "");

                  return (
                    <Link key={j.id} href={`/journals/${j.uuid || j.id}`}>
                      <div className="group relative flex flex-col justify-between gap-3 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer h-full min-h-[120px]">
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              {dayName}, {monthName} {dayNum}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => onRequestDelete(e, j.id)}
                              className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {j.title || `Journal Entry — ${monthName} ${dayNum}`}
                          </h3>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                            {previewText || "No content..."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                          <span>{timeStr}</span>
                          <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-semibold flex items-center gap-1 transition-colors">
                            Read <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Journal Entry?"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete Entry"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
