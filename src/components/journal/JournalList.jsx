"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Clock, Layers, Trash2, Calendar as CalendarIcon, FileText } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { useJournal } from "@/lib/JournalContext";
import { notify } from "@/lib/notify";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
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

  const onDeleteConfirm = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to delete this journal entry?")) {
      handleDelete(id);
      notify.success("Journal entry deleted");
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
                const stripped = stripHtml(j.content);
                const wordCount = stripped ? stripped.split(/\s+/).filter(Boolean).length : 0;
                const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

                const textPreview = stripped
                  ? stripped.length > 180
                    ? `${stripped.slice(0, 180).trim()}…`
                    : stripped
                  : null;
                const sectionCount = j.sectionCount ?? (j.sections ? j.sections.length : 0);
                const preview =
                  textPreview ||
                  (sectionCount > 0
                    ? `${sectionCount} structured section${sectionCount === 1 ? "" : "s"} recorded.`
                    : "Empty entry.");

                return (
                  <motion.div key={j.id} variants={itemVariants} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[21px] sm:-left-[29px] top-4 w-2.5 h-2.5 rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-950 group-hover:border-purple-500 group-hover:scale-125 transition-all" />

                    <Link
                      href={`/journals/${j.id}`}
                      className="block rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-4 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          <span>{dayName}, {monthName} {dayNum}</span>
                          {timeStr && <span className="text-zinc-400 font-normal">• {timeStr}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {sectionCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              <Layers className="w-3 h-3" />
                              {sectionCount} {sectionCount === 1 ? "Section" : "Sections"}
                            </span>
                          )}
                          {wordCount > 0 && (
                            <span className="text-[10px] text-zinc-400">
                              {readTimeMinutes}m read
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                        {preview}
                      </p>

                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px]">
                        <span className="font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          Open entry
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => onDeleteConfirm(e, j.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((j) => {
                const { dayName, dayNum, monthName, year, timeStr } = formatFullDate(j.date);
                const stripped = stripHtml(j.content);
                const wordCount = stripped ? stripped.split(/\s+/).filter(Boolean).length : 0;

                const textPreview = stripped
                  ? stripped.length > 120
                    ? `${stripped.slice(0, 120).trim()}…`
                    : stripped
                  : null;
                const sectionCount = j.sectionCount ?? (j.sections ? j.sections.length : 0);
                const preview = textPreview || (sectionCount > 0 ? `${sectionCount} sections recorded.` : "Empty entry.");

                return (
                  <motion.div key={j.id} variants={itemVariants}>
                    <Link
                      href={`/journals/${j.id}`}
                      className="group flex flex-col justify-between h-full rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-4 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {dayName}, {monthName} {dayNum}
                          </span>
                          <span className="text-[10px] text-zinc-400">{timeStr}</span>
                        </div>

                        <p className="line-clamp-3 text-xs text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                          {preview}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400">
                        <span>{wordCount} words</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => onDeleteConfirm(e, j.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
