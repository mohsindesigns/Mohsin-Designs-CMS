import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            screens: {
                xs: "480px",
            },
            spacing: {
                // "4.5" (1.125rem / 18px) sits between the default p-4 and p-5 steps. It's used
                // in a handful of places (e.g. the service-detail contact form card's mobile
                // padding) but was never added to the scale, so p-4.5/py-4.5/etc silently
                // compiled to nothing - those elements rendered with ZERO padding on any
                // viewport where a responsive override didn't also apply, which is most phones.
                "4.5": "1.125rem",
                // "15" (3.75rem / 60px) - same gap, used once for a decorative element's
                // horizontal offset (left-15), which was rendering at the CSS default
                // (left: auto) instead of being offset at all.
                "15": "3.75rem",
            },
            fontFamily: {
                // Exactly two brand fonts, everywhere:
                //   heading (Lora)          -> all headings, body copy defaults
                //   accent / cursive (Dancing Script) -> the highlighted word inside a heading
                // `sans`, `mono` and `serif` are remapped here too so any stray use of those
                // built-in Tailwind utilities can't leak a browser-default font onto the page.
                heading: ['var(--font-heading)', 'serif'],
                body: ['var(--font-body)', 'sans-serif'],
                sans: ['var(--font-body)', 'sans-serif'],
                mono: ['var(--font-body)', 'sans-serif'],
                serif: ['var(--font-heading)', 'serif'],
                accent: ['Dancing Script', 'cursive'],
                cursive: ['Dancing Script', 'cursive'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                deep: "hsl(var(--deep))",
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    light: "hsl(var(--surface-light))",
                },
                "text-dark": "hsl(var(--text-dark))",
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                // American Flag Colors - Direct hex values for custom use
                american: {
                    red: "#E32B2B",
                    navy: "#1A2A4A",
                    white: "#FFFFFF",
                    blue: "#002664", // Deeper navy blue option
                    scarlet: "#B22234", // Alternative red
                },
                // User Brand Colors
                brand: {
                    yellow: "var(--color-yellow)",
                    blue: "var(--color-blue)",
                    "blue-mid": "var(--color-blue-dark)",
                    "blue-deep": "#010356",
                    dark: "var(--color-dark)",
                    card: "var(--color-brand-card)",
                    "card-deep": "#090814",
                    light: "var(--color-brand-light)",
                    "zinc-50": "var(--color-light)",
                    "zinc-100": "#F3F4F6",
                    "zinc-150": "#ECEDF0",
                    "zinc-200": "var(--color-border)",
                    "zinc-300": "#D1D5DB",
                    "zinc-400": "#9CA3AF",
                    "zinc-500": "var(--color-gray)",
                    "zinc-550": "#61616A",
                    "zinc-555": "#5F5F68",
                    "zinc-600": "#4B5563",
                    "zinc-605": "#4A5462",
                    "zinc-655": "#414B5A",
                    "zinc-700": "#374151",
                    "zinc-800": "#1F2937",
                    // ── Unified mode-switching accent (blue in light, yellow in dark) ──
                    accent: "var(--color-brand-accent)",
                    "accent-hover": "var(--color-brand-accent-hover)",
                    "accent-subtle": "var(--color-brand-accent-subtle)",
                    "accent-glow": "var(--color-brand-accent-glow)",
                    // Star ratings — always yellow
                    star: "var(--color-star-rating)",
                },
                // These add IN-BETWEEN shades to Tailwind's own built-in palettes (e.g.
                // zinc-355, sky-550) that several components reference but were never part
                // of Tailwind's default scale (which only has 50/100/200/.../900/950) or
                // this config - those classes were silently compiling to nothing. Adding
                // just the missing keys here merges with, rather than replaces, the
                // built-in shades.
                zinc: {
                    350: "#BABAC1",
                    355: "#B7B7BE",
                    455: "#878790",
                    550: "#61616A",
                    555: "#5F5F68",
                },
                slate: {
                    655: "#3C4A5E",
                },
                indigo: {
                    105: "#DFE6FF",
                    650: "#493FD7",
                },
                sky: {
                    550: "#0894D8",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                // "xs" isn't part of Tailwind 3's default scale (it's a v4-only addition) but
                // several small mockup badges/pills in Portfolio.tsx use rounded-xs / rounded-b-xs
                // expecting a subtle corner - those were silently rendering perfectly square.
                xs: "0.125rem",
            },
            // Same story as the color/spacing gaps above: Tailwind's duration scale only has
            // 75/100/150/200/300/500/700/1000 by default, but several components use
            // duration-250/350/355/400. Those compiled to nothing, so `transition-all
            // duration-355` etc. silently ran at the transition utility's own built-in 150ms
            // default instead of the intended duration - not invisible, just the wrong speed.
            transitionDuration: {
                "250": "250ms",
                "350": "350ms",
                "355": "355ms",
                "400": "400ms",
            },
            // scale-103 (a couple of "image zooms slightly on hover" effects) isn't in
            // Tailwind's default scale set (75/90/95/100/105/110/125/150) either - the
            // hover effect was silently doing nothing.
            scale: {
                "103": "1.03",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0", opacity: "0" },
                    to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
                    to: { height: "0", opacity: "0" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "slide-up": {
                    from: { transform: "translateY(20px)", opacity: "0" },
                    to: { transform: "translateY(0)", opacity: "1" },
                },
                "pulse-subtle": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.8" },
                },
                // Used by the decorative "pointer" arrow next to the cursive annotation on
                // LocationTemplate's presence section (animate-bounce-slow) - was never defined,
                // so the arrow just sat static instead of gently bobbing. The 15deg tilt is baked
                // into every frame so it composes correctly with that element's own rotate-[15deg]
                // utility class instead of the animation's translateY wiping the rotation out.
                "bounce-slow": {
                    "0%, 100%": { transform: "translateY(0) rotate(15deg)" },
                    "50%": { transform: "translateY(-6px) rotate(15deg)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "accordion-up": "accordion-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                "bounce-slow": "bounce-slow 2.2s ease-in-out infinite",
                "fade-in": "fade-in 0.5s ease-out",
                "slide-up": "slide-up 0.6s ease-out",
                "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography"),
    ],
} satisfies Config;