const rawBase = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
export const BASE_URL = (!rawBase || rawBase.includes("eaglerevolution.com"))
  ? "https://mohsindesigns.com"
  : rawBase.replace(/\/+$/, "");
