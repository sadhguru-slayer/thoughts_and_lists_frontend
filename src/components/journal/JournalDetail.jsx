"use client";

import { formatJournalDetailDate } from "@/lib/formatDate";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

function FieldReadonly({ field }) {
  const isCheckbox = field.field_type === "checkbox";
  const checked =
    field.value === "true" ||
    field.value === true ||
    String(field.value).toLowerCase() === "true";

  if (isCheckbox) {
    return (
      <div className="flex items-center justify-between gap-3 py-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {field.label}
        </span>
        <span
          className={`inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-300 ${checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </span>
      </div>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <div className="space-y-2 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {field.label}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
          {field.value ?? "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-1">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {field.label}
      </p>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {field.value ?? "—"}
      </p>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function toDatetimeLocalValue(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function JournalDetail({ detail, onBack, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initialState = useMemo(() => ({
    date: toDatetimeLocalValue(detail.date),
    content: detail.content ?? "",
    sections: (detail.sections ?? []).map((section) => ({
      id: section.id,
      name: section.name ?? "",
      field_values: (section.field_values ?? []).map((field) => ({
        id: field.id,
        value: field.value ?? "",
      })),
    })),
  }), [detail]);
  const [draft, setDraft] = useState(initialState);

  const startEditing = () => {
    setDraft(initialState);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(initialState);
    setIsEditing(false);
  };
  const handleDelete = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Delete this journal entry? This cannot be undone.")
    ) {
      onDelete(detail.id);
    }
  };

  const updateSectionName = (sectionId, value) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, name: value } : section
      ),
    }));
  };

  const updateFieldValue = (sectionId, fieldId, value) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id !== sectionId
          ? section
          : {
            ...section,
            field_values: section.field_values.map((field) =>
              field.id === fieldId ? { ...field, value } : field
            ),
          }
      ),
    }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    try {
      setIsSaving(true);
      await onSave(detail.id, {
        date: draft.date ? `${draft.date}:00` : null,
        content: draft.content,
        sections: draft.sections,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </motion.div>

      <motion.header variants={itemVariants} className="space-y-2 py-2">
        {isEditing ? (
          <input
            type="datetime-local"
            value={draft.date}
            onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
            className="max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        ) : (
          <time
            dateTime={detail.date}
            className="text-sm font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400"
          >
            {formatJournalDetailDate(detail.date)}
          </time>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Journal Entry
        </h2>
      </motion.header>

      {(detail.content || isEditing) && (
        <motion.section variants={itemVariants} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
            Content
          </h3>
          {isEditing ? (
            <textarea
              rows={6}
              value={draft.content}
              onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            />
          ) : (
            <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
              {detail.content}
            </p>
          )}
        </motion.section>
      )}

      {detail.sections?.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
            Sections
          </h3>
          <div className="grid gap-4">
            {detail.sections.map((section) => (
              <article
                key={section.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={draft.sections.find((s) => s.id === section.id)?.name ?? ""}
                    onChange={(e) => updateSectionName(section.id, e.target.value)}
                    className="mb-2 w-full border-b border-zinc-200 bg-transparent pb-2 text-lg font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:text-zinc-50"
                  />
                ) : (
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 mb-2">
                    {section.name}
                  </h4>
                )}
                <div className="flex flex-col gap-2 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {section.field_values?.map((fv) => {
                    if (!isEditing) {
                      return <FieldReadonly key={fv.id} field={fv} />;
                    }
                    const currentSection = draft.sections.find((s) => s.id === section.id);
                    const currentValue = currentSection?.field_values.find((f) => f.id === fv.id)?.value ?? "";
                    if (fv.field_type === "checkbox") {
                      return (
                        <div key={fv.id} className="flex items-center justify-between gap-3 py-3">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{fv.label}</span>
                          <input
                            type="checkbox"
                            checked={String(currentValue).toLowerCase() === "true"}
                            onChange={(e) => updateFieldValue(section.id, fv.id, e.target.checked ? "true" : "false")}
                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
                          />
                        </div>
                      );
                    }
                    if (fv.field_type === "textarea") {
                      return (
                        <div key={fv.id} className="space-y-2 py-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{fv.label}</p>
                          <textarea
                            rows={3}
                            value={currentValue}
                            onChange={(e) => updateFieldValue(section.id, fv.id, e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={fv.id} className="space-y-1 py-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{fv.label}</p>
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => updateFieldValue(section.id, fv.id, e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
