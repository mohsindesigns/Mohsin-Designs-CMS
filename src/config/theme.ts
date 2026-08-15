export const theme = {
    colors: {
        primary: {
            DEFAULT: "hsl(var(--primary))",
            light: "hsl(var(--primary)/0.8)",
            dark: "hsl(var(--primary)/1.2)",
            foreground: "hsl(var(--primary-foreground))",
        },
        background: {
            DEFAULT: "hsl(var(--background))",
            card: "hsl(var(--card))",
            muted: "hsl(var(--muted))",
        },
        foreground: {
            DEFAULT: "hsl(var(--foreground))",
            muted: "hsl(var(--muted-foreground))",
            card: "hsl(var(--card-foreground))",
        },
        border: {
            DEFAULT: "hsl(var(--border))",
            primary: "hsl(var(--primary)/0.3)",
        },
        gradients: {
            primary: "from-primary to-primary/80",
            hero: "from-slate-900 via-slate-800 to-slate-900",
        }
    },
    spacing: {
        section: "py-20 md:py-24 lg:py-28",
        container: "max-w-7xl mx-auto px-4 sm:px-6 md:px-8",
        sectionSmall: "py-12 md:py-14 lg:py-16",
    },
    animations: {
        duration: {
            fast: "300ms",
            normal: "500ms",
            slow: "700ms",
        },
        ease: "[0.16, 1, 0.3, 1]",
    }
};

export type Theme = typeof theme;