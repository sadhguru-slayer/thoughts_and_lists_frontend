"use client";

import { formatJournalDetailDate } from "@/lib/formatDate";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, GripVertical, Pencil, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { notify } from "@/lib/notify";
import RichTextEditor, { RichTextReadonly } from "@/components/ui/RichTextEditor";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Read-only field renderer ─────────────────────────────────────────────────
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
          className={`inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-300 ${
            checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform duration-300 ${
              checked ? "translate-x-5" : "translate-x-0"
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

  if (field.field_type === "richtext") {
    return (
      <div className="space-y-2 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {field.label}
        </p>
        <RichTextReadonly
          html={field.value}
          className="bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"
        />
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

// ─── Sortable draggable field row (edit mode) ─────────────────────────────────
function SortableFieldRow({ fv, sectionId, currentValue, onUpdate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fv.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const renderInput = () => {
    if (fv.field_type === "checkbox") {
      return (
        <div className="flex items-center justify-between gap-3 py-3 flex-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {fv.label}
          </span>
          <input
            type="checkbox"
            checked={String(currentValue).toLowerCase() === "true"}
            onChange={(e) => onUpdate(sectionId, fv.id, e.target.checked ? "true" : "false")}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
          />
        </div>
      );
    }
    if (fv.field_type === "textarea") {
      return (
        <div className="space-y-2 py-2 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {fv.label}
          </p>
          <textarea
            rows={3}
            value={currentValue}
            onChange={(e) => onUpdate(sectionId, fv.id, e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
      );
    }
    if (fv.field_type === "richtext") {
      return (
        <div className="space-y-2 py-2 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {fv.label}
          </p>
          <RichTextEditor
            content={currentValue}
            onChange={(val) => onUpdate(sectionId, fv.id, val)}
            placeholder={`Enter ${fv.label.toLowerCase()}...`}
          />
        </div>
      );
    }
    return (
      <div className="space-y-1 py-1 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {fv.label}
        </p>
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onUpdate(sectionId, fv.id, e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 group rounded-xl transition-colors ${
        isDragging
          ? "bg-zinc-100/80 dark:bg-zinc-800/80 shadow-md ring-1 ring-zinc-300 dark:ring-zinc-600"
          : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3 flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        title="Drag to reorder"
        aria-label="Drag to reorder field"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {renderInput()}
    </div>
  );
}

// ─── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function toDatetimeLocalValue(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function JournalDetail({ detail, onBack, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const buildInitialState = (det) => ({
    date: toDatetimeLocalValue(det.date),
    content: det.content ?? "",
    sections: (det.sections ?? []).map((section) => ({
      id: section.id,
      name: section.name ?? "",
      // field_values holds ordered list; each item has id, value, label, field_type
      field_values: (section.field_values ?? []).map((field) => ({
        id: field.id,
        label: field.label,
        field_type: field.field_type,
        value: field.value ?? "",
      })),
    })),
  });

  const initialState = useMemo(() => buildInitialState(detail), [detail]);
  const [draft, setDraft] = useState(initialState);

  const startEditing = () => {
    setDraft(buildInitialState(detail));
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
      notify.promise(Promise.resolve(onDelete(detail.id)), {
        loading: "Deleting…",
        success: "Journal deleted",
        error: "Failed to delete",
      });
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

  // Called when a drag ends inside a specific section
  const handleDragEnd = (sectionId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const oldIndex = section.field_values.findIndex((f) => f.id === active.id);
        const newIndex = section.field_values.findIndex((f) => f.id === over.id);
        return {
          ...section,
          field_values: arrayMove(section.field_values, oldIndex, newIndex),
        };
      }),
    }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    try {
      setIsSaving(true);

      await onSave(detail.id, {
        date: draft.date ? `${draft.date}:00` : null,
        content: draft.content,
        sections: draft.sections.map((s) => ({
          uuid: s.id,
          name: s.name,
          // Send each field's current position as `order`
          field_values: s.field_values.map((fv, index) => ({
            uuid: fv.id,
            value: fv.value,
            order: index,
          })),
        })),
      });

      setIsEditing(false);
      notify.success("Journal updated");
    } catch (error) {
      notify.error("Failed to save journal");
      console.error("Failed to save journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Word count (stripped of HTML tags)
  const wordCount = useMemo(() => {
    const raw = detail.content ? detail.content.replace(/<[^>]*>?/gm, " ").trim() : "";
    return raw ? raw.split(/\s+/).filter(Boolean).length : 0;
  }, [detail.content]);

  // dnd-kit sensors (pointer with 5px activation distance to avoid accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20"
    >
      {/* ── Top action bar ───────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-900 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 active:scale-95"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/60 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </motion.div>

      {/* ── Header / date ────────────────────────────────────────────────── */}
      <motion.header variants={itemVariants} className="space-y-2 py-2">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <input
              type="datetime-local"
              value={draft.date}
              onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
              className="max-w-xs rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:[color-scheme:dark]"
            />
          ) : (
            <time
              dateTime={detail.date}
              className="text-xs font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400"
            >
              {formatJournalDetailDate(detail.date)}
            </time>
          )}
          {wordCount > 0 && (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              {wordCount} words
            </span>
          )}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Journal Entry
        </h2>
      </motion.header>

      {/* ── Free-text content ─────────────────────────────────────────────── */}
      {(detail.content || isEditing) && (
        <motion.section
          variants={itemVariants}
          className="rounded-3xl border border-zinc-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
            Content
          </h3>
          {isEditing ? (
            <RichTextEditor
              content={draft.content}
              onChange={(val) => setDraft((prev) => ({ ...prev, content: val }))}
              placeholder="Write your journal entry here..."
            />
          ) : (
            <RichTextReadonly html={detail.content} />
          )}
        </motion.section>
      )}

      {/* ── Structured sections ───────────────────────────────────────────── */}
      {detail.sections?.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Structured Sections
            </h3>
            {isEditing && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 uppercase tracking-wider">
                Drag to reorder fields
              </span>
            )}
          </div>

          <div className="grid gap-4">
            {detail.sections.map((section) => {
              const draftSection = draft.sections.find((s) => s.id === section.id);

              return (
                <article
                  key={section.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/80"
                >
                  {/* Section name */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={draftSection?.name ?? ""}
                      onChange={(e) => updateSectionName(section.id, e.target.value)}
                      className="mb-4 w-full border-b border-zinc-200 bg-transparent pb-2 text-lg font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:text-zinc-50"
                    />
                  ) : (
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 mb-3">
                      {section.name}
                    </h4>
                  )}

                  {/* Fields */}
                  {isEditing && draftSection ? (
                    // ── Drag-and-drop zone ──────────────────────────────────
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(section.id, event)}
                    >
                      <SortableContext
                        items={draftSection.field_values.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {draftSection.field_values.map((fv) => (
                            <SortableFieldRow
                              key={fv.id}
                              fv={fv}
                              sectionId={section.id}
                              currentValue={fv.value}
                              onUpdate={updateFieldValue}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    // ── Read-only ───────────────────────────────────────────
                    <div className="flex flex-col gap-2 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      {section.field_values?.map((fv) => (
                        <FieldReadonly key={fv.id} field={fv} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
