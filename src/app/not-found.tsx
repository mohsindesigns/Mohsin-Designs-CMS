import CtaButton from "@/components/ui/CtaButton";
import Link from "@/components/ui/Link";

export default function NotFound() {
  return (
    <div className="py-24 flex items-center justify-center min-h-[60vh] bg-white">
      <div className="text-center px-4 max-w-lg mx-auto">
        <span className="inline-block px-3 py-1 bg-blue-50 text-[#0306AC] text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-blue-100">
          404 Error
        </span>
 <h1 className="mb-3 text-5xl sm:text-6xl font-bold text-[#1d2327] font-heading">
          Page Not Found
        </h1>
        <p className="mb-8 text-sm sm:text-base text-[#646970] leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist.
        </p>
        <CtaButton href="/" className="cta-on-light">Return to Homepage</CtaButton>
      </div>
    </div>
  );
}
