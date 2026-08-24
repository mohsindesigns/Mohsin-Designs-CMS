import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 flex items-center justify-center min-h-[60vh] bg-white">
      <div className="text-center px-4 max-w-lg mx-auto">
        <span className="inline-block px-3 py-1 bg-blue-50 text-[#0306AC] text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-blue-100">
          404 Error
        </span>
        <h1 className="mb-3 text-5xl sm:text-6xl font-bold text-[#1d2327] font-serif">
          Page Not Found
        </h1>
        <p className="mb-8 text-sm sm:text-base text-[#646970] leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#0306AC] text-white text-sm font-semibold rounded-full hover:bg-[#02058a] transition-all shadow-md hover:shadow-lg"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
