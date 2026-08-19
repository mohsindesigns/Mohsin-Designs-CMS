"use client";

import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";

/**
 * ULTRA-MINIMAL RESILIENCY VERSION
 * Removed framer-motion to eliminate it as a potential source of "undefined" components.
 * Simplified structure to standard HTML elements.
 */

const SafeIcon = ({ icon: IconComp, className, ...props }: any) => {
  if (!IconComp) {
    return <div className={className} style={{ width: '1em', height: '1em', display: 'inline-block' }} />;
  }

  // React components are functions or objects (like forwardRef)
  const isComponent = typeof IconComp === 'function' || 
                      (typeof IconComp === 'object' && IconComp !== null && IconComp.$$typeof);

  if (!isComponent) {
    return <div className={className} style={{ width: '1em', height: '1em', display: 'inline-block' }} />;
  }

  try {
    return <IconComp className={className} {...props} />;
  } catch (e) {
    return <div className={className} style={{ width: '1em', height: '1em', display: 'inline-block' }} />;
  }
};

const ICON_NAMES = Array.from(new Set(Object.keys(LucideIcons).filter(
  (key) => {
    const item = (LucideIcons as any)[key];
    if (!item || key === "default" || !/^[A-Z]/.test(key)) return false;
    
    // Ensure it's a valid React component
    return typeof item === "function" || 
           (typeof item === "object" && item !== null && (item as any).$$typeof);
  }
))).sort();

export default function IconSelector({ 
  value, 
  onChange, 
  label,
  align = "right"
}: { 
  value: string; 
  onChange: (val: string) => void;
  label?: string;
  align?: "left" | "right";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const limit = 100; 
    if (!search) return ICON_NAMES.slice(0, limit); 
    return ICON_NAMES.filter(name => 
      name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, limit);
  }, [search]);

  const resolveIcon = (iconName: string) => {
    const icons = LucideIcons as any;
    if (iconName && icons[iconName]) return icons[iconName];
    
    const fallbacks: Record<string, string> = {
      "HelpCircle": "CircleHelp",
      "CircleHelp": "HelpCircle",
      "CheckCircle": "CircleCheck",
      "CircleCheck": "CheckCircle",
      "Shield": "Shield",
      "Zap": "Zap",
      "Settings": "Settings"
    };
    
    if (iconName && fallbacks[iconName] && icons[fallbacks[iconName]]) {
      return icons[fallbacks[iconName]];
    }
    
    return icons["CircleHelp"] || icons["HelpCircle"] || icons["Search"] || icons["Info"];
  };

  const SelectedIconComp = resolveIcon(value);
  const ChevronDownIcon = (LucideIcons as any)["ChevronDown"];
  const SearchIcon = (LucideIcons as any)["Search"];

  return (
    <div className="space-y-1 relative">
      {label && (
        <label className="text-[10px] font-bold text-[#50575e] uppercase tracking-wider block">{label}</label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white border border-[#8c8f94] rounded-[3px] hover:border-[#2271b1] transition-all text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2271b1]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 bg-[#f0f0f1] rounded flex items-center justify-center shrink-0">
              <SafeIcon icon={SelectedIconComp} className="w-3.5 h-3.5 text-[#1d2327]" />
            </div>
            <span className="text-xs font-semibold text-[#1d2327] truncate">{value || "Select icon"}</span>
          </div>
          <SafeIcon icon={ChevronDownIcon} className={`w-3.5 h-3.5 text-[#50575e] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9990]" 
              onClick={() => setIsOpen(false)} 
            />
            <div className={`absolute top-full ${align === "left" ? "left-0" : "right-0"} mt-1 w-72 sm:w-80 min-w-[260px] max-w-[calc(100vw-32px)] bg-white border border-[#c3c4c7] rounded-[4px] shadow-2xl z-[9999] overflow-hidden`}>
              <div className="p-2 border-b border-[#f0f0f1] bg-[#f6f7f7]">
                <div className="relative">
                  <SafeIcon icon={SearchIcon} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8f94]" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search icons (e.g. phone, mail, globe)..."
                    className="w-full bg-white pl-8 pr-3 py-1.5 rounded-[3px] border border-[#8c8f94] text-xs focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] outline-none"
                  />
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto p-2 grid grid-cols-4 sm:grid-cols-5 gap-1.5 custom-scrollbar">
                {filteredIcons.map((name) => {
                  const IconComp = (LucideIcons as any)[name];
                  const isSelected = value === name;
                  
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-[3px] transition-all gap-1 text-center group cursor-pointer ${
                        isSelected 
                          ? "bg-[#2271b1] text-white shadow-sm font-bold" 
                          : "hover:bg-[#f0f0f1] text-[#2c3338] hover:text-[#2271b1]"
                      }`}
                      title={name}
                    >
                      <SafeIcon icon={IconComp} className="w-4 h-4 shrink-0" />
                      <span className="text-[9px] truncate w-full text-center tracking-tight leading-tight">
                        {name}
                      </span>
                    </button>
                  );
                })}
                {filteredIcons.length === 0 && (
                  <div className="col-span-4 sm:col-span-5 text-center text-xs text-[#8c8f94] py-4">
                    No icons found for &quot;{search}&quot;
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
