"use client";

import React, { useEffect, useRef } from "react";

interface QuillEditorProps {
  content: any;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
}

function normalizeContent(c: any): string {
  if (!c) return "";
  if (Array.isArray(c)) return c.join("");
  if (typeof c === "string") return c;
  try { return String(c); } catch { return ""; }
}

export default function QuillEditor({ content, onChange, label, placeholder }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isUpdating = useRef(false);
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Visual
      if (quillRef.current) {
        isUpdating.current = true;
        const normalized = normalizeContent(content);
        const editorEl = editorRef.current?.querySelector(".ql-editor");
        if (editorEl) {
          editorEl.innerHTML = normalized;
        }
        isUpdating.current = false;
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  useEffect(() => {
    if (quillRef.current || !editorRef.current) return;

    // Dynamically import Quill to avoid SSR issues
    import("quill").then(({ default: Quill }) => {
      if (!editorRef.current || quillRef.current) return;

      // Add Quill CSS if not already added
      if (!document.querySelector('link[data-quill-css]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css";
        link.setAttribute("data-quill-css", "true");
        document.head.appendChild(link);
      }

      const quill = new Quill(editorRef.current!, {
        theme: "snow",
        placeholder: placeholder || "Start writing...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      quillRef.current = quill;

      // Set initial content silently without focus/scrolling
      const initial = normalizeContent(content);
      if (initial) {
        const delta = quill.clipboard.convert(initial);
        quill.setContents(delta, "silent");
      }

      // Listen for changes
      const handleTextChange = () => {
        if (isUpdating.current) return;
        const html = editorRef.current?.querySelector(".ql-editor")?.innerHTML || "";
        // Avoid passing empty placeholder content
        const cleaned = html === "<p><br></p>" ? "" : html;
        onChangeRef.current(cleaned);
      };

      quill.on("text-change", handleTextChange);

      quillRef.current._cleanup = () => {
        quill.off("text-change", handleTextChange);
      };
    });

    return () => {
      // Cleanup
      if (quillRef.current) {
        if (typeof quillRef.current._cleanup === "function") {
          quillRef.current._cleanup();
        }
        quillRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run ONCE on mount

  // Sync content dynamically if updated externally and editor is not focused
  useEffect(() => {
    if (!quillRef.current || isHtmlMode) return;
    const normalized = normalizeContent(content);
    const editorEl = editorRef.current?.querySelector(".ql-editor");
    const currentHtml = editorEl?.innerHTML || "";
    const cleanedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;

    if (cleanedCurrent !== normalized && !quillRef.current.hasFocus()) {
      isUpdating.current = true;
      const delta = quillRef.current.clipboard.convert(normalized);
      quillRef.current.setContents(delta, "silent");
      isUpdating.current = false;
    }
  }, [content, isHtmlMode]);

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
        className="border border-[#c3c4c7] rounded-sm overflow-hidden focus-within:border-[#2271b1] focus-within:ring-1 focus-within:ring-[#2271b1] transition-all quill-admin-wrapper"
      >
        <div ref={editorRef} />
      </div>

      {isHtmlMode && (
        <textarea
          value={normalizeContent(content)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[220px] p-4 font-mono text-[13px] text-[#1d2327] bg-white border border-[#c3c4c7] rounded-sm focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          placeholder="Paste or write HTML here..."
        />
      )}
      <style jsx global>{`
        .quill-admin-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #c3c4c7 !important;
          background: #f6f7f7;
          padding: 4px 6px;
          font-family: inherit;
        }
        .quill-admin-wrapper .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 14px;
        }
        .quill-admin-wrapper .ql-editor {
          min-height: 180px;
          color: #1d2327;
          padding: 12px 16px;
        }
        .quill-admin-wrapper .ql-editor.ql-blank::before {
          color: #8c8f94;
          font-style: normal;
        }
        .quill-admin-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-admin-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2271b1;
        }
        .quill-admin-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-admin-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #2271b1;
        }
        .quill-admin-wrapper .ql-toolbar .ql-picker-label:hover,
        .quill-admin-wrapper .ql-toolbar .ql-picker-label.ql-active {
          color: #2271b1;
        }
      `}</style>
    </div>
  );
}
