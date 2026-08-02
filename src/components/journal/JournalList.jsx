"use client";

import Link from "next/link";
import { formatJournalListDate } from "@/lib/formatDate";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function JournalList({ journals }) {
  if (journals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-20 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-zinc-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No entries yet</p>
        <p className="text-xs text-zinc-400 max-w-[220px]">
          Start your first journal entry — every great habit begins somewhere.
        </p>
        <Link
          href="/journals/write"
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2.5 transition-all active:scale-95 hover:opacity-90"
        >
          Write first entry
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {journals.map((j) => {
        const textPreview = j.content?.trim()
          ? j.content.length > 120
            ? `${j.content.slice(0, 120).trim()}…`
            : j.content
          : null;
        const sectionCount = j.sectionCount ?? 0;
        const preview =
          textPreview ||
          (sectionCount > 0
            ? `${sectionCount} section${sectionCount === 1 ? "" : "s"}`
            : "Empty entry text");

        return (
          <motion.li key={j.id} variants={item} layout>
            <Link
              href={`/journals/${j.id}`}
              className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-zinc-300 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="min-w-0 flex-1">
                <time
                  dateTime={j.date}
                  className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
                >
                  {formatJournalListDate(j.date)}
                </time>
                <p className="mt-2 line-clamp-2 leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
                  {preview}
                </p>
              </div>
              <div
                className="shrink-0 rounded-full p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 transition-all group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 shadow-sm"
                aria-hidden
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
