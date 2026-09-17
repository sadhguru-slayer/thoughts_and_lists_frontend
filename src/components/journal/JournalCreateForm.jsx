"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Trash2, X, GripVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/lib/ModalContext";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

function newClientKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `k-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sectionFromTemplate(template) {
  const fields = [...template.fields].sort((a, b) => a.order - b.order);
  return {
    clientKey: newClientKey(),
    templateId: template.id,
    name: template.name,
    reusable: true,
    fieldValues: fields.map((f) => ({
      clientKey: newClientKey(),
      templateFieldId: f.id,
      label: f.label,
      field_type: f.field_type,
      value: f.field_type === "checkbox" ? "false" : "",
    })),
  };
}

function sectionFromLatestStructureEntry(apiSection, templates, index = 0) {
  const tid = apiSection.template_id != null ? Number(apiSection.template_id) : null;
  const template = tid != null ? templates.find((t) => t.id === tid) : null;
  const rawFields = apiSection.fields ?? [];
  const fieldValues = rawFields.map((f, idx) => {
    let templateFieldId;
    if (template?.fields) {
      const ordered = [...template.fields].sort((a, b) => a.order - b.order);
      const match = ordered.find(
        (x) => x.label === f.label && x.field_type === f.field_type
      ) ?? ordered[idx];
      templateFieldId = match?.id;
    }
    return {
      clientKey: `field-latest-${tid || "custom"}-${index}-${idx}`,
      templateFieldId,
      label: f.label,
      field_type: f.field_type,
      value: f.field_type === "checkbox" ? "false" : "",
    };
  });
  return {
    clientKey: `sec-latest-${tid || "custom"}-${index}`,
    templateId: tid,
    name: apiSection.name ?? "",
    reusable: true,
    fieldValues,
  };
}

function emptyCustomSection(reusable = true) {
  return {
    clientKey: newClientKey(),
    templateId: null,
    name: "",
    reusable,
    fieldValues: [],
  };
}

function initialDraftSectionsFromLatest(latestStructure, templates) {
  if (!latestStructure?.sections?.length) return [];
  return latestStructure.sections.map((sec, idx) =>
    sectionFromLatestStructureEntry(sec, templates, idx)
  );
}

const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "richtext", label: "Rich text (editor)" },
  { value: "checkbox", label: "Checkbox" },
];

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-600 dark:focus-visible:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass =
  "text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2";

// ─── Styled Checkbox ──────────────────────────────────────────────────────────
// Large, touch-friendly checkbox using a hidden native input + visual element
function StyledCheckbox({ checked, onChange, disabled, size = "md" }) {
  const sizeClasses = size === "lg"
    ? "w-7 h-7 rounded-lg"
    : "w-6 h-6 rounded-md";

  return (
    <label className={cn("relative inline-flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span
        className={cn(
          "flex items-center justify-center border-2 transition-all",
          sizeClasses,
          checked
            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100"
            : "bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-600"
        )}
      >
        {checked && (
          <Check
            className={cn(
              "text-white dark:text-zinc-900",
              size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
            )}
            strokeWidth={3}
          />
        )}
      </span>
    </label>
  );
}

// ─── Remove / Delete circle button ───────────────────────────────────────────
function RemoveButton({ onClick, disabled, variant = "x", title = "Remove" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={cn(
        "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-50",
        variant === "trash"
          ? "bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          : "bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
      )}
    >
      {variant === "trash" ? (
        <Trash2 className="w-3.5 h-3.5" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ─── Sortable field row ───────────────────────────────────────────────────────
function SortableCustomFieldRow({ fv, onChange, onRemove, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fv.clientKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const renderInput = () => {
    if (fv.field_type === "checkbox") {
      return (
        <div className="flex flex-1 items-center justify-between gap-4 px-4 py-3.5">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
            {fv.label}
          </span>
          <div className="flex items-center gap-3">
            <StyledCheckbox
              size="lg"
              checked={fv.value === "true" || fv.value === true}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            />
            <RemoveButton
              onClick={onRemove}
              disabled={disabled}
              variant="trash"
              title="Remove field"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 py-3 pr-3 space-y-2">
        <div className="flex items-center justify-between gap-2 pl-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {fv.label}
          </label>
          <RemoveButton
            onClick={onRemove}
            disabled={disabled}
            variant="x"
            title="Remove field"
          />
        </div>
        {fv.field_type === "richtext" ? (
          <RichTextEditor
            content={fv.value ?? ""}
            onChange={(html) => onChange(html)}
            disabled={disabled}
            placeholder={`Write ${fv.label}…`}
            minHeight="120px"
          />
        ) : fv.field_type === "textarea" ? (
          <textarea
            rows={3}
            disabled={disabled}
            value={fv.value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        ) : (
          <input
            type="text"
            disabled={disabled}
            value={fv.value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-1.5 rounded-2xl transition-colors",
        isDragging
          ? "bg-zinc-100 dark:bg-zinc-800 shadow-md ring-1 ring-zinc-300 dark:ring-zinc-600"
          : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
      )}
    >
      {/* Drag handle — always visible on mobile, hover-only on desktop */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={cn(
          "mt-4 ml-2 flex-shrink-0 cursor-grab active:cursor-grabbing p-1.5 rounded-lg",
          "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
          // On desktop hide until hover; on mobile always show (touch UX)
          "sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100",
          fv.field_type === "checkbox" ? "mt-3.5" : ""
        )}
        title="Drag to reorder"
        aria-label="Drag to reorder field"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {renderInput()}
    </div>
  );
}

// ─── Add custom fields row ────────────────────────────────────────────────────
function AddCustomFields({ sectionKey, onAddField, disabled }) {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Add field
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <input
          type="text"
          disabled={disabled}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Field label…"
          className={cn(inputClass, "flex-1")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (newLabel.trim()) {
                onAddField(sectionKey, newLabel, newType);
                setNewLabel("");
                setNewType("text");
              }
            }
          }}
        />
        <div className="flex gap-2">
          <Select disabled={disabled} value={newType} onValueChange={setNewType}>
            <SelectTrigger className={cn(inputClass, "h-auto py-3 w-full sm:w-40 shrink-0")}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((ft) => (
                <SelectItem key={ft.value} value={ft.value}>
                  {ft.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            disabled={disabled || !newLabel.trim()}
            onClick={() => {
              onAddField(sectionKey, newLabel, newType);
              setNewLabel("");
              setNewType("text");
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
export default function JournalCreateForm({
  templates = [],
  latestStructure = null,
  onCancel,
  onSubmit,
  onDeleteTemplate,
}) {
  const { showConfirm } = useModal();
  const [localDatetime, setLocalDatetime] = useState("");
  const [ready, setReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setLocalDatetime(toDatetimeLocalValue(new Date()));
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const hasInitializedRef = useRef(false);
  const [content, setContent] = useState("");
  const [userHasEdited, setUserHasEdited] = useState(false);
  const [draftSections, setDraftSections] = useState(() => {
    const initial = initialDraftSectionsFromLatest(latestStructure, templates);
    if (initial.length > 0) {
      hasInitializedRef.current = true;
    }
    return initial;
  });

  useEffect(() => {
    if (!userHasEdited && !hasInitializedRef.current && latestStructure?.sections?.length) {
      setDraftSections(initialDraftSectionsFromLatest(latestStructure, templates));
      hasInitializedRef.current = true;
    }
  }, [latestStructure, templates, userHasEdited]);

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newCustomSectionReusable, setNewCustomSectionReusable] = useState(true);

  const addFromTemplate = () => {
    const id = selectedTemplateId === "" ? NaN : Number.parseInt(selectedTemplateId, 10);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setUserHasEdited(true);
    setDraftSections((s) => [...s, sectionFromTemplate(template)]);
    setSelectedTemplateId("");
  };

  const addCustomSection = () => {
    setUserHasEdited(true);
    setDraftSections((s) => [
      ...s,
      emptyCustomSection(newCustomSectionReusable),
    ]);
  };

  const setSectionReusable = (clientKey, reusable) => {
    setUserHasEdited(true);
    setDraftSections((s) =>
      s.map((sec) => (sec.clientKey === clientKey ? { ...sec, reusable } : sec))
    );
  };

  const removeSection = (clientKey) => {
    setUserHasEdited(true);
    setDraftSections((s) => s.filter((x) => x.clientKey !== clientKey));
  };

  const setSectionName = (clientKey, name) => {
    setDraftSections((s) =>
      s.map((sec) => (sec.clientKey === clientKey ? { ...sec, name } : sec))
    );
  };

  const setFieldValue = (sectionClientKey, fieldClientKey, value) => {
    setDraftSections((s) =>
      s.map((sec) =>
        sec.clientKey !== sectionClientKey
          ? sec
          : {
            ...sec,
            fieldValues: sec.fieldValues.map((fv) =>
              fv.clientKey === fieldClientKey ? { ...fv, value } : fv
            ),
          }
      )
    );
  };

  const addCustomField = (clientKey, label, field_type) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setDraftSections((s) =>
      s.map((sec) =>
        sec.clientKey !== clientKey
          ? sec
          : {
            ...sec,
            fieldValues: [
              ...sec.fieldValues,
              {
                clientKey: newClientKey(),
                templateFieldId: undefined,
                label: trimmed,
                field_type,
                value: field_type === "checkbox" ? "false" : "",
              },
            ],
          }
      )
    );
  };

  const removeCustomField = (sectionClientKey, fieldClientKey) => {
    setDraftSections((s) =>
      s.map((sec) =>
        sec.clientKey !== sectionClientKey
          ? sec
          : {
            ...sec,
            fieldValues: sec.fieldValues.filter((fv) => fv.clientKey !== fieldClientKey),
          }
      )
    );
  };

  const handleDragEnd = (sectionClientKey, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDraftSections((prev) =>
      prev.map((section) => {
        if (section.clientKey !== sectionClientKey) return section;
        const oldIndex = section.fieldValues.findIndex((f) => f.clientKey === active.id);
        const newIndex = section.fieldValues.findIndex((f) => f.clientKey === over.id);
        return {
          ...section,
          fieldValues: arrayMove(section.fieldValues, oldIndex, newIndex),
        };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.replace(/<[^>]*>/g, "").trim() ? content : "";
    if (!trimmedContent && draftSections.length === 0) return;
    if (!ready || !localDatetime) return;
    const date = new Date(localDatetime);
    if (Number.isNaN(date.getTime())) return;

    const sections = draftSections.map((s) => ({
      name: s.name,
      templateId: s.templateId,
      reusable: Boolean(s.reusable),
      fieldValues: s.fieldValues.map((fv) => ({
        label: fv.label,
        field_type: fv.field_type,
        value: fv.value,
        field_id: fv.templateFieldId,
      })),
    }));

    try {
      setIsSubmitting(true);
      await onSubmit({
        date: localDatetime.length === 16 ? `${localDatetime}:00` : localDatetime,
        content: trimmedContent,
        sections,
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const hasRichContent = content.replace(/<[^>]*>/g, "").trim().length > 0;

  const canSubmit =
    ready &&
    !!localDatetime &&
    (hasRichContent || draftSections.length > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onSubmit={handleSubmit}
      className={cn("space-y-6 pb-12", isSubmitting && "opacity-80 pointer-events-none")}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors py-2 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-5 py-2 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-40"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            "Save Entry"
          )}
        </button>
      </div>

      <div className="space-y-5">
        {/* Date & Time */}
        <div>
          <label htmlFor="journal-date" className={labelClass}>
            Date & Time
          </label>
          <input
            id="journal-date"
            type="datetime-local"
            value={localDatetime}
            onChange={(e) => setLocalDatetime(e.target.value)}
            disabled={!ready || isSubmitting}
            className={cn(inputClass, "max-w-md", "dark:[color-scheme:dark]")}
          />
        </div>

        {/* Main content — Rich Text Editor */}
        <div>
          <label className={labelClass}>
            Entry <span className="lowercase font-medium tracking-normal ml-1">(Optional if adding sections)</span>
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            disabled={isSubmitting}
            placeholder="What's on your mind?"
            minHeight="180px"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="pt-2 space-y-4">
        {/* Section controls header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Structure
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Template selector */}
            {templates.length > 0 && (
              <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-44 bg-transparent text-xs font-semibold border-none outline-none dark:text-zinc-200 px-3 py-1.5 cursor-pointer focus:ring-0">
                    <SelectValue placeholder="Add from template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={addFromTemplate}
                  disabled={selectedTemplateId === "" || isSubmitting}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Insert
                </button>
                {onDeleteTemplate && (
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: "Deactivate Template?",
                        description: "Make this template inactive? You won't be able to insert it again.",
                        confirmText: "Deactivate",
                        variant: "warning",
                      });
                      if (!confirmed) return;

                      try {
                        setIsSubmitting(true);
                        await onDeleteTemplate(selectedTemplateId);
                        setSelectedTemplateId("");
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={selectedTemplateId === "" || isSubmitting}
                    className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 ml-1 text-red-600 transition disabled:opacity-50 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400"
                    title="Remove template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Custom section controls */}
            <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 py-1.5 pl-3 pr-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider select-none">
                <StyledCheckbox
                  checked={newCustomSectionReusable}
                  disabled={isSubmitting}
                  onChange={(e) => setNewCustomSectionReusable(e.target.checked)}
                />
                Reusable
              </label>
              <button
                type="button"
                onClick={addCustomSection}
                disabled={isSubmitting}
                className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 dark:bg-emerald-600 dark:text-emerald-50 dark:hover:bg-emerald-500 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Custom
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {draftSections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/30 px-6 py-12 text-center dark:bg-zinc-900/20">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              No sections active. Use a template or build your own custom structure above.
            </p>
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-6 pt-2">
            <AnimatePresence>
              {draftSections.map((sec) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  key={sec.clientKey}
                  className="group relative rounded-3xl border border-zinc-200/80 bg-white backdrop-blur-md p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden"
                >
                  {/* Section header row */}
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 space-y-3 w-full min-w-0">
                      {/* Badge + reusable toggle */}
                      <div className="flex flex-wrap items-center gap-3">
                        {sec.templateId != null ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            Template
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shrink-0">
                            Custom
                          </span>
                        )}
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 select-none">
                          <StyledCheckbox
                            checked={sec.reusable !== false}
                            disabled={isSubmitting}
                            onChange={(e) => setSectionReusable(sec.clientKey, e.target.checked)}
                          />
                          {sec.templateId != null ? "Reusable" : "Save as template"}
                        </label>
                      </div>

                      {/* Section title input */}
                      <div className="w-full">
                        <label className="sr-only" htmlFor={`name-${sec.clientKey}`}>
                          Section Title
                        </label>
                        <input
                          id={`name-${sec.clientKey}`}
                          type="text"
                          value={sec.name}
                          disabled={isSubmitting}
                          onChange={(e) => setSectionName(sec.clientKey, e.target.value)}
                          placeholder="Section Title"
                          className="w-full text-xl font-bold bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100 border-b-2 border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 transition-colors pb-1"
                        />
                      </div>
                    </div>

                    {/* Section delete — large touch target on mobile */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeSection(sec.clientKey)}
                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all disabled:opacity-50"
                      title="Remove section"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Field rows */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(sec.clientKey, event)}
                  >
                    <SortableContext
                      items={sec.fieldValues.map((f) => f.clientKey)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2.5">
                        {sec.fieldValues.map((fv) => (
                          <SortableCustomFieldRow
                            key={fv.clientKey}
                            fv={fv}
                            disabled={isSubmitting}
                            onChange={(v) => setFieldValue(sec.clientKey, fv.clientKey, v)}
                            onRemove={() => removeCustomField(sec.clientKey, fv.clientKey)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add field */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <AddCustomFields
                      sectionKey={sec.clientKey}
                      onAddField={addCustomField}
                      disabled={isSubmitting}
                    />
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end pt-8">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-blue-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving Journal...</>
          ) : (
            "Save Journal Entry"
          )}
        </button>
      </div>
    </motion.form>
  );
}