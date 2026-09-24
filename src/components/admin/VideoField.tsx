"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Upload, Link as LinkIcon, Film, X, AlertTriangle } from "lucide-react";
import MediaSelector from "./MediaSelector";
import { parseVideoEmbed } from "@/lib/videoEmbed";

export type VideoType = "upload" | "embed" | "url";

interface VideoFieldProps {
  label?: string;
  videoType: VideoType;
  videoUrl: string;
  onChange: (videoType: VideoType, videoUrl: string) => void;
}

const SOURCE_TABS: { id: VideoType; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Upload from PC", icon: Upload },
  { id: "embed", label: "YouTube / Vimeo Link", icon: LinkIcon },
  { id: "url", label: "Direct Video URL", icon: Film },
];

// Picks the video for one testimonial card, three ways: upload a file through the media
// library, paste a YouTube/Vimeo link (parsed + validated via src/lib/videoEmbed.ts, same
// allowlist approach as the existing map-embed field), or paste a direct video file URL
// already hosted elsewhere. Modeled on ImageField.tsx's shape, but video-aware.
export default function VideoField({ label = "Testimonial Video", videoType, videoUrl, onChange }: VideoFieldProps) {
  const [showSelector, setShowSelector] = useState(false);

  // Deliberately no local buffering of videoUrl (unlike a form draft) - this field lives
  // inside a repeatable list where React can reuse a component instance across a
  // different array index after add/remove/reorder, and a useState initializer alone
  // would go stale against the new item's real value. Using the prop directly as the
  // controlled value, like ImageField.tsx does, keeps it always correct.
  const urlDraft = videoUrl || "";
  const activeType: VideoType = videoType || "upload";
  const parsedEmbed = activeType === "embed" ? parseVideoEmbed(urlDraft) : null;
  // A YouTube/Vimeo link pasted into the "Direct Video URL" tab can't play in a <video>
  // tag; the live site detects it and plays it as an embed, so preview it the same way.
  const urlTabEmbed = activeType === "url" ? parseVideoEmbed(urlDraft) : null;

  const handleTabChange = (type: VideoType) => {
    // Switching source type starts that tab fresh rather than carrying over a URL that
    // was only ever valid for the previous type (an uploaded media URL isn't a YouTube
    // link, etc.).
    onChange(type, "");
  };

  const handleUrlCommit = (value: string) => {
    onChange(activeType, value);
  };

  return (
    <div className="space-y-2 mb-6">
      <label className="text-[11px] font-bold text-[#1d2327] uppercase block">{label}</label>

      <div className="flex flex-wrap gap-1 border-b border-[#c3c4c7]">
        {SOURCE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? "border-[#2271b1] text-[#2271b1]"
                  : "border-transparent text-[#646970] hover:text-[#1d2327]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="border border-[#c3c4c7] bg-[#f0f0f1] min-h-[150px] relative flex flex-col items-center justify-center p-4">
        {activeType === "upload" && (
          videoUrl ? (
            <div className="w-full space-y-4">
              <div className="relative border border-[#c3c4c7] bg-black p-1 shadow-sm mx-auto max-w-md">
                <video src={videoUrl} controls className="max-h-[220px] w-full object-contain block" />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setShowSelector(true)}
                  className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-sm hover:bg-[#135e96] transition-colors font-medium shadow-sm"
                >
                  Replace Video
                </button>
                <button
                  type="button"
                  onClick={() => onChange("upload", "")}
                  className="text-[#d63638] text-[13px] hover:underline px-4 py-1.5"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              className="flex flex-col items-center gap-3 text-[#2271b1] hover:text-[#135e96] transition-colors py-10"
            >
              <div className="w-12 h-12 border-2 border-dashed border-[#c3c4c7] flex items-center justify-center bg-white">
                <Upload className="w-6 h-6 text-[#c3c4c7]" />
              </div>
              <span className="text-[13px] font-medium underline decoration-1 underline-offset-4">
                Choose or upload a video
              </span>
            </button>
          )
        )}

        {activeType === "embed" && (
          <div className="w-full space-y-3">
            <input
              type="text"
              value={urlDraft}
              onChange={(e) => handleUrlCommit(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full bg-white border border-[#c3c4c7] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] px-3 py-2 text-[13px] rounded-[3px] outline-none"
            />
            {urlDraft && !parsedEmbed?.embedUrl && (
              <p className="flex items-center gap-1.5 text-[12px] text-[#d63638]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Doesn't look like a YouTube or Vimeo link yet - it won't show on the live
                site until this resolves to one.
              </p>
            )}
            {parsedEmbed?.embedUrl && (
              <div className="aspect-video w-full max-w-md mx-auto border border-[#c3c4c7] bg-black overflow-hidden">
                <iframe
                  src={parsedEmbed.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            )}
          </div>
        )}

        {activeType === "url" && (
          <div className="w-full space-y-3">
            <input
              type="text"
              value={urlDraft}
              onChange={(e) => handleUrlCommit(e.target.value)}
              placeholder="https://cdn.example.com/testimonial.mp4"
              className="w-full bg-white border border-[#c3c4c7] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] px-3 py-2 text-[13px] rounded-[3px] outline-none"
            />
            {urlTabEmbed?.embedUrl ? (
              <>
                <p className="text-[12px] text-[#646970]">
                  This is a YouTube/Vimeo link - it will play as an embedded video on the live site.
                </p>
                <div className="aspect-video w-full max-w-md mx-auto border border-[#c3c4c7] bg-black overflow-hidden">
                  <iframe src={urlTabEmbed.embedUrl} className="w-full h-full" allowFullScreen title="Video preview" />
                </div>
              </>
            ) : (
              urlDraft && (
                <div className="border border-[#c3c4c7] bg-black p-1 max-w-md mx-auto">
                  <video src={urlDraft} controls className="max-h-[200px] w-full object-contain block" />
                </div>
              )
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSelector && (
          <MediaSelector
            title="Select a video"
            accept="video/*"
            onSelect={(item) => onChange("upload", item.url)}
            onClose={() => setShowSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
