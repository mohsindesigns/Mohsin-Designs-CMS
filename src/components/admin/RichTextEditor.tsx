"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Heading1, Heading2,
  Heading3, Heading4, RemoveFormatting, Info
} from "lucide-react";
import MediaSelector from "./MediaSelector";

interface RichTextEditorProps {
  content: any; // accepts string | string[] | null | undefined from DB
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  showStatusBar?: boolean;
}

// Normalize any content type to a safe HTML string
function normalizeContent(c: any): string {
  if (!c) return "";
  if (Array.isArray(c)) return c.join("");
  if (typeof c === "string") return c;
  try { return String(c); } catch { return ""; }
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all ${
      isActive
        ? "bg-[#2271b1] text-white"
        : "text-[#50575e] hover:bg-[#f0f0f1] hover:text-[#1d2327]"
    } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  label,
  showStatusBar,
}: RichTextEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editor) {
        editor.commands.setContent(normalizeContent(content));
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Capture initial content ONCE — editor owns its state after mount.
  const initialContent = useRef(normalizeContent(content));

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary no-underline hover:opacity-80 transition-opacity",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg my-4" },
      }),
    ],
    content: initialContent.current,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-[14px] text-[#1d2327] bg-white",
      },
    },
  });

  // Sync content dynamically when changed externally and editor is not focused
  useEffect(() => {
    if (!editor) return;
    const normalized = normalizeContent(content);
    if (editor.getHTML() !== normalized && !editor.isFocused) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!mounted || !editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    let finalUrl = url;
    if (
      url &&
      !url.startsWith("http") &&
      !url.startsWith("/") &&
      !url.startsWith("#") &&
      !url.startsWith("mailto:")
    ) {
      if (url.includes(".")) finalUrl = `https://${url}`;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
  };

  const addImage = (media: any) => {
    if (media?.url) {
      editor
        .chain()
        .focus()
        .setImage({ src: media.url, alt: media.alt || media.name })
        .run();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        {label && (
          <label className="text-[13px] font-bold text-[#1d2327]">{label}</label>
        )}
        <button
          type="button"
          onClick={toggleHtmlMode}
          className="text-xs text-[#2271b1] hover:text-[#135e96] font-semibold flex items-center gap-1"
        >
          {isHtmlMode ? "✏️ Edit Visually" : "💻 Edit HTML"}
        </button>
      </div>

      <div 
        style={{ display: isHtmlMode ? "none" : "block" }} 
        className="border border-[#c3c4c7] rounded-sm bg-white overflow-hidden focus-within:border-[#2271b1] focus-within:ring-1 focus-within:ring-[#2271b1] transition-all"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1 border-b border-[#c3c4c7] bg-[#f6f7f7]">
          <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-[#dcdcde]">
            <MenuButton
              title="Heading 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
            >
              <Heading1 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Heading 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Heading 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
            >
              <Heading3 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Heading 4"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              isActive={editor.isActive("heading", { level: 4 })}
            >
              <Heading4 className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-[#dcdcde]">
            <MenuButton
              title="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            >
              <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            >
              <Italic className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
            >
              <UnderlineIcon className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-[#dcdcde]">
            <MenuButton
              title="Bullet List"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            >
              <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Ordered List"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
            >
              <ListOrdered className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-[#dcdcde]">
            <MenuButton
              title="Link"
              onClick={setLink}
              isActive={editor.isActive("link")}
            >
              <LinkIcon className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              title="Insert Image"
              onClick={() => setIsMediaOpen(true)}
            >
              <ImageIcon className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5">
            <MenuButton
              title="Clear Formatting"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              <RemoveFormatting className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 ml-auto pl-2 border-l border-[#dcdcde]">
            <MenuButton
              title="Document Structure"
              onClick={() => setShowOverview(!showOverview)}
              isActive={showOverview}
            >
              <Info className="w-4 h-4" />
            </MenuButton>
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative flex items-stretch">
          <div className={`relative flex-1 ${showOverview ? "border-r border-[#c3c4c7]" : ""}`}>
            <EditorContent editor={editor} />
            {editor.isEmpty && (
              <div className="absolute top-3 left-4 pointer-events-none text-[#8c8f94] text-[14px]">
                {placeholder || "Start writing..."}
              </div>
            )}
          </div>

          {showOverview && (
            <div className="w-56 bg-[#f6f7f7] flex-shrink-0 flex flex-col">
              <div className="p-3 border-b border-[#dcdcde] bg-white sticky top-0 z-10 flex justify-between items-center">
                <span className="font-bold text-[11px] text-[#646970] uppercase tracking-wider">
                  Structure
                </span>
                <div className="text-[10px] text-[#8c8f94] font-medium">
                  {editor.state.doc.textContent.length} chars
                </div>
              </div>
              <div className="p-3 overflow-y-auto max-h-[300px] space-y-1">
                {(() => {
                  const headings: { id: string; level: number; pos: number; text: string }[] = [];
                  editor.state.doc.descendants((node, pos) => {
                    if (node.type.name === "heading") {
                      headings.push({
                        id: `h-${pos}`,
                        level: node.attrs.level,
                        pos,
                        text: node.textContent,
                      });
                    }
                  });
                  if (headings.length === 0)
                    return (
                      <div className="text-[12px] text-[#8c8f94] italic">No headings.</div>
                    );
                  return headings.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        editor.chain().focus().setTextSelection(item.pos).run();
                      }}
                      className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-[#e6f0fa] transition-colors"
                    >
                      <span className="text-[9px] font-bold bg-[#d2e3f7] text-[#2271b1] px-1 py-0.5 rounded">
                        H{item.level}
                      </span>
                      <span className="text-[12px] text-[#1d2327] truncate">
                        {item.text || "Empty"}
                      </span>
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {isHtmlMode && (
        <textarea
          value={normalizeContent(content)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[220px] p-4 font-mono text-[13px] text-[#1d2327] bg-white border border-[#c3c4c7] rounded-sm focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          placeholder="Paste or write HTML here..."
        />
      )}

      {isMediaOpen && (
        <MediaSelector
          onClose={() => setIsMediaOpen(false)}
          onSelect={(media) => {
            addImage(media);
            setIsMediaOpen(false);
          }}
          title="Select Image for Content"
        />
      )}

      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          min-height: 200px;
        }
        .ProseMirror h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h4 { font-size: 1.1em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .ProseMirror a { color: #2430D2; text-decoration: none !important; }
        .ProseMirror a:hover { text-decoration: none !important; opacity: 0.8; }
        .ProseMirror blockquote { border-left: 3px solid #dcdcde; padding-left: 1em; font-style: italic; margin-bottom: 1em; }
        .ProseMirror p { margin-bottom: 0.75em; }
      `}</style>
    </div>
  );
}
