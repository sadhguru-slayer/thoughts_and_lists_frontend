"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Braces,
  Heading2,
  Heading3,
  Quote,
  Strikethrough,
  Minus,
  X,
  Check,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const lowlight = createLowlight(common);

// ─── Shared CSS (used by both editor and readonly view) ──────────────────────
const EDITOR_STYLES = `
  /* Placeholder */
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #a1a1aa;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* Task list */
  .ProseMirror ul[data-type="taskList"],
  .rte-readonly ul[data-type="taskList"] {
    list-style: none;
    padding: 0;
  }
  .ProseMirror ul[data-type="taskList"] li,
  .rte-readonly ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.4rem;
  }
  .ProseMirror ul[data-type="taskList"] li > label,
  .rte-readonly ul[data-type="taskList"] li > label {
    margin-right: 0.5rem;
    user-select: none;
    margin-top: 0.2rem;
  }
  .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"],
  .rte-readonly ul[data-type="taskList"] li > label input[type="checkbox"] {
    accent-color: #71717a;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }
  .ProseMirror ul[data-type="taskList"] li > div,
  .rte-readonly ul[data-type="taskList"] li > div { flex: 1; }

  /* Container — prevent content from blowing out the card width */
  .ProseMirror, .rte-readonly {
    overflow-wrap: break-word;
    word-break: break-word;
    min-width: 0;
    max-width: 100%;
  }

  /* Lists */
  .ProseMirror ul, .rte-readonly ul { list-style-type: disc; padding-left: 1.5rem; }
  .ProseMirror ol, .rte-readonly ol { list-style-type: decimal; padding-left: 1.5rem; }
  .ProseMirror p, .rte-readonly p { margin-bottom: 0.4rem; overflow-wrap: break-word; word-break: break-word; }
  .ProseMirror h2, .rte-readonly h2 { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0 0.4rem; }
  .ProseMirror h3, .rte-readonly h3 { font-size: 1.05rem; font-weight: 700; margin: 0.6rem 0 0.3rem; }
  .ProseMirror blockquote, .rte-readonly blockquote {
    border-left: 3px solid #d4d4d8;
    padding-left: 1rem;
    color: #71717a;
    margin: 0.5rem 0;
    font-style: italic;
  }
  .dark .ProseMirror blockquote,
  .dark .rte-readonly blockquote { border-color: #52525b; color: #a1a1aa; }

  /* Inline code */
  .ProseMirror code, .rte-readonly code {
    background: #f4f4f5;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, monospace;
    font-size: 0.85em;
    color: #d97706;
  }
  .dark .ProseMirror code, .dark .rte-readonly code {
    background: #27272a;
    color: #fbbf24;
  }

  /* Code block wrapper — scrolls horizontally, never wraps */
  .ProseMirror pre, .rte-readonly pre {
    background: #18181b;
    color: #e4e4e7;
    border-radius: 0.5rem;
    padding: 0.85rem 1rem;
    font-family: ui-monospace, monospace;
    font-size: 0.825rem;
    line-height: 1.65;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100%;
    width: 100%;
    margin: 0.6rem 0;
    border: 1px solid #3f3f46;
    position: relative;
    white-space: pre;
    word-break: normal;
    word-wrap: normal;
  }
  .ProseMirror pre code, .rte-readonly pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: inherit;
    font-size: inherit;
    white-space: pre;
    word-break: normal;
    word-wrap: normal;
    overflow-wrap: normal;
  }

  /* ── highlight.js token colors (Tokyo Night–inspired) ── */
  .hljs { background: transparent; }
  .hljs-comment, .hljs-quote      { color: #636e72; font-style: italic; }
  .hljs-keyword, .hljs-selector-tag,
  .hljs-addition                  { color: #c792ea; }
  .hljs-number, .hljs-string, .hljs-meta .hljs-meta-string,
  .hljs-literal, .hljs-doctag,
  .hljs-regexp                    { color: #c3e88d; }
  .hljs-title, .hljs-section,
  .hljs-selector-id              { color: #82aaff; font-weight: bold; }
  .hljs-subst                    { color: #e4e4e7; }
  .hljs-class .hljs-title,
  .hljs-type                     { color: #ffcb6b; }
  .hljs-tag, .hljs-name,
  .hljs-selector-class,
  .hljs-attribute,
  .hljs-variable.language_       { color: #f07178; }
  .hljs-attr                     { color: #89ddff; }
  .hljs-symbol, .hljs-bullet,
  .hljs-link, .hljs-meta,
  .hljs-selector-attr,
  .hljs-selector-pseudo,
  .hljs-built_in                 { color: #89ddff; }
  .hljs-deletion                 { color: #ff5370; }
  .hljs-emphasis                 { font-style: italic; }
  .hljs-strong                   { font-weight: bold; }
  .hljs-formula                  { background: #1e2127; }
`;

// ─── Language selector for code blocks ───────────────────────────────────────
const CODE_LANGS = [
  "plaintext",
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
  "sql",
  "markdown",
];

function ToolbarButton({ onClick, isActive, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-lg text-xs font-medium transition-all",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        isActive
          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-inner"
          : "text-zinc-500 dark:text-zinc-400"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 self-center mx-0.5 shrink-0" />
  );
}

function MenuBar({ editor, compact = false }) {
  if (!editor) return null;

  const iconSize = compact ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-0.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm",
      compact ? "px-2 py-2 rounded-none" : "px-3 py-2 rounded-t-xl"
    )}>
      {/* Text style */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        disabled={!editor.can().toggleBold()}
        title="Bold (Ctrl+B)"
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        disabled={!editor.can().toggleItalic()}
        title="Italic (Ctrl+I)"
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        disabled={!editor.can().toggleStrike()}
        title="Strikethrough"
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Checklist"
      >
        <CheckSquare className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Code */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        disabled={!editor.can().toggleCode()}
        title="Inline Code"
      >
        <Code className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Braces className={iconSize} />
      </ToolbarButton>

      <Divider />

      {/* Extras */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className={iconSize} />
      </ToolbarButton>

      {/* Language picker — shown only when inside a code block */}
      {editor.isActive("codeBlock") && (
        <>
          <Divider />
          <Select
            value={editor.getAttributes("codeBlock").language ?? "plaintext"}
            onValueChange={(val) =>
              editor
                .chain()
                .focus()
                .setCodeBlock({ language: val })
                .run()
            }
          >
            <SelectTrigger className="w-[120px] h-7 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-zinc-700 dark:text-zinc-300 cursor-pointer outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {CODE_LANGS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}

// ─── Mobile full-screen editor modal (iOS-style sheet) ───────────────────────
function MobileEditorModal({ content, onChange, placeholder, onClose, triggerRect }) {
  const [mounted, setMounted] = useState(false);

  // The modal editor — separate instance from the inline one
  const modalEditor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: { class: "hljs" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable: true,
    autofocus: "end",
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full px-4 py-4 text-base text-zinc-900 dark:text-zinc-100 leading-relaxed",
        style: "min-height: 200px",
      },
    },
  });

  useEffect(() => {
    setMounted(true);
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDone = useCallback(() => {
    onClose();
  }, [onClose]);

  // Compute the start Y position for the animation (from where the field is)
  const startY = triggerRect
    ? Math.min(triggerRect.top, window.innerHeight - 80)
    : window.innerHeight;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="mobile-editor-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]"
        onPointerDown={handleDone}
      />
      <motion.div
        key="mobile-editor-sheet"
        initial={{ y: startY, opacity: 0.6, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
        className="fixed inset-x-0 bottom-0 z-[9999] flex flex-col bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl"
        style={{
          top: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          maxHeight: "100dvh",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 border-b border-zinc-100 dark:border-zinc-800">
          {/* Drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />

          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleDone}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 py-1 px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 select-none">
            {placeholder || "Write…"}
          </span>

          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleDone}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 py-1 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 overflow-x-auto">
          <MenuBar editor={modalEditor} compact />
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <EditorContent editor={modalEditor} />
        </div>

        <style>{EDITOR_STYLES}</style>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── Hook: detect mobile viewport ────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ─── Main RichTextEditor component ───────────────────────────────────────────
export default function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing…",
  disabled = false,
  autoFocus = false,
  minHeight = "140px",
  className,
}) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef(null);
  const [triggerRect, setTriggerRect] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: { class: "hljs" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // Only sync on desktop; on mobile the modal editor calls onChange directly
      if (!isMobile) {
        onChange?.(editor.getHTML());
      }
    },
    editable: !disabled && !isMobile, // on mobile, inline editor is read-only
    autofocus: autoFocus && !isMobile ? "end" : false,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none w-full px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync editor content when the `content` prop changes externally
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  // Keep mobile editor editable state in sync
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !isMobile);
  }, [editor, disabled, isMobile]);

  const openModal = useCallback(() => {
    if (disabled) return;
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setModalOpen(true);
  }, [disabled]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalChange = useCallback((html) => {
    onChange?.(html);
    // Also update the background inline editor so content is in sync
    if (editor) {
      const current = editor.getHTML();
      if (html !== current) {
        editor.commands.setContent(html || "", false);
      }
    }
  }, [onChange, editor]);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(
          "w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 shadow-sm overflow-hidden transition-all",
          !isMobile && "focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-400/40 dark:focus-within:ring-zinc-600/40",
          isMobile && !disabled && "cursor-pointer active:bg-zinc-50/80 dark:active:bg-zinc-900/60",
          isMobile && modalOpen && "ring-2 ring-blue-400/50 border-blue-300 dark:border-blue-700",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        onClick={isMobile ? openModal : undefined}
      >
        {/* On desktop show the toolbar; on mobile show a compact hint bar */}
        {isMobile ? (
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">
              Tap to edit
            </span>
            <div className="flex items-center gap-0.5 ml-auto opacity-40">
              <Bold className="w-3 h-3 text-zinc-500" />
              <Italic className="w-3 h-3 text-zinc-500" />
              <List className="w-3 h-3 text-zinc-500" />
            </div>
          </div>
        ) : (
          <MenuBar editor={editor} />
        )}
        <div className={cn("min-w-0 max-w-full overflow-hidden", isMobile && "pointer-events-none")}>
          <EditorContent editor={editor} />
        </div>
        <style>{EDITOR_STYLES}</style>
      </div>

      {/* Mobile full-screen editor modal */}
      {isMobile && modalOpen && (
        <MobileEditorModal
          content={content}
          onChange={handleModalChange}
          placeholder={placeholder}
          onClose={handleModalClose}
          triggerRect={triggerRect}
        />
      )}
    </>
  );
}

/**
 * Read-only view of rich text content — uses the exact same styles as the
 * editor so code blocks, syntax highlighting, and formatting all match.
 */
export function RichTextReadonly({ html, className }) {
  if (!html) return null;
  return (
    <>
      <div className="min-w-0 max-w-full overflow-hidden">
        <div
          className={cn("rte-readonly text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed", className)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <style>{EDITOR_STYLES}</style>
    </>
  );
}
