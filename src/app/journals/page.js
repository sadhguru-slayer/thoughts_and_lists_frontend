"use client";

import { useState } from "react";
import Link from "next/link";
import { useJournal } from "@/lib/JournalContext";
import JournalList from "@/components/journal/JournalList";
import JournalAnalytics from "@/components/journal/JournalAnalytics";
import Pagination from "@/components/ui/Pagination";
import { Plus, Search, BarChart2, BookOpen, LayoutGrid, ListFilter, ArrowUpDown } from "lucide-react";

export default function JournalsPage() {
  const {
    journals,
    page,
    perPage,
    pagination,
    changePage,
    searchQuery,
    sortOrder,
    dateFilter,
    handleSearch,
    handleSortChange,
    handleDateFilterChange,
  } = useJournal();

  const [showAnalytics, setShowAnalytics] = useState(true);
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "grid"

  return (
    <div className="w-full flex-1 pt-6 px-4 md:px-0 pb-28 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-zinc-700 dark:text-zinc-300 shrink-0" />
            Journals
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Capture your reflections, track progress, and cultivate clarity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAnalytics((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              showAnalytics
                ? "bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{showAnalytics ? "Hide Stats" : "Stats"}</span>
          </button>

          <Link
            href="/journals/write"
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2 transition-all active:scale-95 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Entry</span>
          </Link>
        </div>
      </div>

      {/* Minimal Stats Strip */}
      {showAnalytics && <JournalAnalytics />}

      {/* Controls Bar: Search + Filters + Sort + View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search all entries..."
            defaultValue={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout(window._journalSearchTimer);
              window._journalSearchTimer = setTimeout(() => handleSearch(val), 400);
            }}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-400 dark:text-zinc-200 placeholder:text-zinc-400 transition-all"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Date Filter Dropdown */}
          <div className="relative flex items-center shrink-0">
            <ListFilter className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="relative flex items-center shrink-0">
            <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
              title="Timeline view"
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
              title="Grid view"
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Journal List */}
      <JournalList journals={journals} viewMode={viewMode} />

      {/* Pagination — reflects the actual server-filtered/sorted count */}
      <Pagination
        currentPage={page}
        totalPages={pagination?.totalPages ?? 1}
        totalItems={pagination?.total ?? journals.length}
        perPage={perPage}
        onPageChange={changePage}
        className="mt-6"
      />
    </div>
  );
}
