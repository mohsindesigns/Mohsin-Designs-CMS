"use client";

import { withTrailingSlash } from"@/lib/url";
import Link from"@/components/ui/Link";
import { usePathname } from"next/navigation";
import { forwardRef } from"react";
import { cn } from"@/lib/utils";

interface NavLinkProps {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = withTrailingSlash(pathname ||"") === withTrailingSlash(href);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName ="NavLink";

export { NavLink };
