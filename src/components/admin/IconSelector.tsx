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
  label = "Select Icon" 
}: { 
  value: string; 
  onChange: (val: string) => void;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const limit = 80; 
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
  const CheckIcon = (LucideIcons as any)["Check"];

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-primary/50 transition-all text-left shadow-sm group"
        >
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <SafeIcon icon={SelectedIconComp} className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium text-slate-700 flex-1">{value || "Choose an icon..."}</span>
          <SafeIcon icon={ChevronDownIcon} className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60]" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <SafeIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto p-2 grid grid-cols-4 gap-2 custom-scrollbar">
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
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all gap-2 group ${
                        isSelected 
                          ? "bg-primary text-white shadow-lg" 
                          : "hover:bg-slate-50 text-slate-600 hover:text-primary"
                      }`}
                      title={name}
                    >
                      <SafeIcon icon={IconComp} className="w-5 h-5" />
                      <span className="text-[8px] font-bold truncate w-full text-center uppercase tracking-tighter">
                        {name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <SafeIcon icon={CheckIcon} className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
