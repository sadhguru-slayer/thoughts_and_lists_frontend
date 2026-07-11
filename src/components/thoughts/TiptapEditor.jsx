"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, List, ListOrdered, CheckSquare, Code, Terminal } from 'lucide-react';
import { cn } from "@/lib/utils";

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('bold') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('bulletList') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('orderedList') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('taskList') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Task List"
            >
                <CheckSquare className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('code') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Inline Code"
                title="Inline Code"
            >
                <Terminal className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                    "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                    editor.isActive('codeBlock') ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
                aria-label="Code Block"
                title="Code Block"
            >
                <Code className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, placeholder = "Take a note...", disabled, autoFocus }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: !disabled,
        autofocus: autoFocus ? 'end' : false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert prose-zinc max-w-none focus:outline-none min-h-[120px] w-full px-2',
            },
        },
    });

    return (
        <div className="w-full flex flex-col pt-2">
            <MenuBar editor={editor} />
            <div className="flex-1 w-full text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">
                <EditorContent editor={editor} disabled={disabled} />
            </div>
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #a1a1aa;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }
                .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label {
                    margin-right: 0.5rem;
                    user-select: none;
                    margin-top: 0.2rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
                    accent-color: #3b82f6;
                    width: 1.1rem;
                    height: 1.1rem;
                    cursor: pointer;
                }
                .ProseMirror ul[data-type="taskList"] li > div {
                    flex: 1;
                }
                .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                }
                .ProseMirror p {
                    margin-bottom: 0.5rem;
                }
                .ProseMirror pre {
                    background: #f4f4f5;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1rem;
                    color: #27272a;
                    font-family: monospace;
                    font-size: 0.875rem;
                    overflow-x: auto;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror code {
                    background: #f4f4f5;
                    padding: 0.15rem 0.3rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    font-size: 0.875rem;
                    color: #ef4444;
                }
                .dark .ProseMirror pre, .dark .ProseMirror code {
                    background: #27272a;
                    color: #e4e4e7;
                }
                .dark .ProseMirror code {
                    color: #fca5a5;
                }
                .ProseMirror pre code {
                    background: transparent;
                    padding: 0;
                    border-radius: 0;
                    color: inherit;
                }
                .dark .ProseMirror pre code {
                    background: transparent;
                    color: inherit;
                }
            `}</style>
        </div>
    );
}
