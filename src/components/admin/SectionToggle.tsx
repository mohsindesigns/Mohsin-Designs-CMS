"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface SectionToggleProps {
  label?: string;
  enabled: boolean | undefined;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export default function SectionToggle({
  label = "Section Visibility",
  enabled = true,
  onChange,
  className = ""
}: SectionToggleProps) {
  const isEnabled = enabled !== false;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-[12px] font-semibold flex items-center gap-1.5 select-none">
        {isEnabled ? (
          <Eye className="w-3.5 h-3.5 text-[#008a20]" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-[#8c8f94]" />
        )}
        <span className={isEnabled ? "text-[#1d2327] font-medium" : "text-[#8c8f94]"}>
          {isEnabled ? "Visible" : "Hidden"}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!isEnabled);
        }}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2271b1] focus:ring-offset-1 ${
          isEnabled ? "bg-[#2271b1]" : "bg-[#c3c4c7]"
        }`}
        title={isEnabled ? "Section is visible on live website. Click to hide." : "Section is hidden on live website. Click to show."}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isEnabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
