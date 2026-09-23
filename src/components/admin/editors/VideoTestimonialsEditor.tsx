"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import ImageField from "@/components/admin/ImageField";
import VideoField, { type VideoType } from "@/components/admin/VideoField";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-40 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading editor...</div>,
});

interface TestimonialItem {
  name?: string;
  role?: string;
  avatar?: string;
  videoType?: VideoType;
  videoUrl?: string;
  thumbnail?: string;
}

interface VideoTestimonialsValue {
  enabled?: boolean;
  sectionTag?: string;
  titleIntro?: string;
  titleHighlight?: string;
  description?: string;
  items?: TestimonialItem[];
}

const DEFAULT_ITEM: TestimonialItem = { name: "", role: "", avatar: "", videoType: "upload", videoUrl: "", thumbnail: "" };

// A "Video Testimonials" section: a swipeable carousel of play-button video cards that
// open fullscreen on click. This is a shared, self-contained editor block (not a full
// TemplateEditors[...] page of its own) meant to be dropped into any per-template
// editor's own tab list, the same way every other optional section (Trusted Brands,
// FAQs, etc.) gets its own tab in HomeEditor.tsx and friends. Keeping it as one shared
// component instead of copy-pasting this into all 11 template editors means a future fix
// only has to happen once.
//
// API is intentionally decoupled from any particular host editor's internal state
// shape - just `value` (the whole videoTestimonials object) and `onChange(next)` (the
// whole updated object) - so it drops into any editor's `updateSection("videoTestimonials", null, next)`
// call (every editor in this codebase supports passing `null` as the field to replace
// a whole section at once - see HomeEditor.tsx's updateSection).
export default function VideoTestimonialsEditor({
  value,
  onChange,
}: {
  value: VideoTestimonialsValue | undefined;
  onChange: (next: VideoTestimonialsValue) => void;
}) {
  const data: VideoTestimonialsValue = value || {};
  const items: TestimonialItem[] = Array.isArray(data.items) ? data.items : [];

  const patch = (fields: Partial<VideoTestimonialsValue>) => onChange({ ...data, ...fields });

  const updateItem = (index: number, fields: Partial<TestimonialItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...fields };
    patch({ items: next });
  };

  const addItem = () => patch({ items: [...items, { ...DEFAULT_ITEM }] });
  const removeItem = (index: number) => patch({ items: items.filter((_, i) => i !== index) });
  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ items: next });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
        <div>
          <h2 className="text-base font-bold text-[#1d2327]">Video Testimonials Visibility</h2>
          <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
        </div>
        <SectionToggle
          enabled={data.enabled !== false}
          onChange={(v) => patch({ enabled: v })}
          label="Video Testimonials"
        />
      </div>

      <div className="space-y-6">
        <h3 className={UI.sectionHeader}>1. Section Header</h3>
        <div className="space-y-1.5">
          <label className={UI.label}>Badge / Eyebrow</label>
          <input
            type="text"
            value={data.sectionTag ?? "CLIENT VOICES"}
            onChange={(e) => patch({ sectionTag: e.target.value })}
            className={UI.input}
            placeholder="e.g. CLIENT VOICES"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={UI.label}>Title Intro</label>
            <input
              type="text"
              value={data.titleIntro ?? "Hear What Our"}
              onChange={(e) => patch({ titleIntro: e.target.value })}
              className={UI.input}
              placeholder="e.g. Hear What Our"
            />
          </div>
          <div className="space-y-1.5">
            <label className={UI.label}>Title Highlight (Accent/Cursive)</label>
            <input
              type="text"
              value={data.titleHighlight ?? "Customers Are Saying"}
              onChange={(e) => patch({ titleHighlight: e.target.value })}
              className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
              placeholder="e.g. Customers Are Saying"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={UI.label}>Description (Optional)</label>
          <RichTextEditor
            content={data.description || ""}
            onChange={(val: string) => patch({ description: val })}
            placeholder="A short line introducing these video testimonials."
          />
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-[#f0f0f1]">
        <div className="flex justify-between items-center">
          <h3 className={UI.sectionHeader}>2. Testimonial Videos</h3>
          <button type="button" onClick={addItem} className={UI.buttonAdd + " w-auto px-4"}>
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-[13px] text-[#646970] italic border border-dashed border-[#c3c4c7] rounded-[4px] p-6 text-center">
            No testimonial videos yet - click "Add Testimonial" to add your first one.
          </p>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className={UI.card + " space-y-5 border-l-4 border-l-[#2271b1]"}>
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                <span className="text-[10px] font-bold text-[#646970] uppercase">
                  Testimonial #{index + 1}{item.name ? ` — ${item.name}` : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="text-[#646970] hover:text-[#1d2327] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className="text-[#646970] hover:text-[#1d2327] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-[#d63638] hover:text-[#b32d2e] p-1 ml-1"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={UI.label}>Name</label>
                  <input
                    type="text"
                    value={item.name || ""}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    className={UI.input}
                    placeholder="e.g. Emily Manekshaw"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Role / Company</label>
                  <input
                    type="text"
                    value={item.role || ""}
                    onChange={(e) => updateItem(index, { role: e.target.value })}
                    className={UI.input}
                    placeholder="e.g. COO, Prime Inc."
                  />
                </div>
              </div>

              <ImageField
                label="Avatar (Small round photo shown in the caption)"
                value={item.avatar || ""}
                onChange={(url) => updateItem(index, { avatar: url })}
              />

              <VideoField
                label="Testimonial Video"
                videoType={item.videoType || "upload"}
                videoUrl={item.videoUrl || ""}
                onChange={(videoType, videoUrl) => updateItem(index, { videoType, videoUrl })}
              />

              <ImageField
                label="Card Thumbnail (Optional — if blank, uses the video's own first frame, or the YouTube thumbnail for a YouTube link)"
                value={item.thumbnail || ""}
                onChange={(url) => updateItem(index, { thumbnail: url })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
