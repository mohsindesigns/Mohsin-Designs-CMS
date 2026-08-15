"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Upload, Search, X, Edit3, Link as LinkIcon, RefreshCw, Plus } from "lucide-react";
import MediaSelector from "./MediaSelector";

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  altValue?: string;
  onAltChange?: (alt: string) => void;
  description?: string;
}

export default function ImageField({
  label,
  value,
  onChange,
  altValue,
  onAltChange,
  description
}: ImageFieldProps) {
  const [showSelector, setShowSelector] = useState(false);

  const handleSelect = (item: any) => {
    onChange(item.url);
    if (onAltChange && item.alt) {
      onAltChange(item.alt);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[#1d2327] uppercase block">
          {label}
        </label>
      </div>

      <div className="border border-[#c3c4c7] bg-[#f0f0f1] min-h-[150px] relative flex flex-col items-center justify-center p-4">
        {value ? (
          <div className="w-full space-y-4">
            <div className="relative border border-[#c3c4c7] bg-white p-2 shadow-sm inline-block mx-auto max-w-full">
              <img src={value} alt={altValue} className="max-h-[200px] object-contain block mx-auto" />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setShowSelector(true)}
                className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-sm hover:bg-[#135e96] transition-colors font-medium shadow-sm"
              >
                Replace Image
              </button>
              <button
                onClick={() => onChange("")}
                className="text-[#d63638] text-[13px] hover:underline px-4 py-1.5"
              >
                Remove
              </button>
            </div>

            {onAltChange && (
              <div className="mt-4 pt-4 border-t border-[#c3c4c7] w-full max-w-md mx-auto text-left">
                <label className="text-[11px] font-bold text-[#1d2327] uppercase block mb-1">
                  Alt Text (for accessibility/SEO)
                </label>
                <input
                  type="text"
                  value={altValue || ""}
                  onChange={(e) => onAltChange(e.target.value)}
                  className="w-full bg-white border border-[#c3c4c7] px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] outline-none"
                  placeholder="Describe this image..."
                />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowSelector(true)}
            className="flex flex-col items-center gap-3 text-[#2271b1] hover:text-[#135e96] transition-colors py-10"
          >
            <div className="w-12 h-12 border-2 border-dashed border-[#c3c4c7] flex items-center justify-center bg-white">
              <Plus className="w-6 h-6 text-[#c3c4c7]" />
            </div>
            <span className="text-[13px] font-medium underline decoration-1 underline-offset-4">Set featured image</span>
          </button>
        )}
      </div>

      {description && <p className="text-[12px] text-[#646970] italic mt-1 leading-tight">{description}</p>}

      <AnimatePresence>
        {showSelector && (
          <MediaSelector
            title={`Select ${label}`}
            onSelect={handleSelect}
            onClose={() => setShowSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
