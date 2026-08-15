import React from 'react';
import * as LucideIcons from 'lucide-react';

// For Google, we can use a custom icon
const Google = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// We keep a static map for custom icons, aliases, and direct imports to maintain backwards compatibility
export const iconMap: Record<string, any> = {
    Home: LucideIcons.Home,
    Building2: LucideIcons.Building2,
    Wrench: LucideIcons.Wrench,
    Star: LucideIcons.Star,
    Shield: LucideIcons.Shield,
    Clock: LucideIcons.Clock,
    Mail: LucideIcons.Mail,
    Phone: LucideIcons.Phone,
    MapPin: LucideIcons.MapPin,
    Calendar: LucideIcons.Calendar,
    ArrowRight: LucideIcons.ArrowRight,
    Check: LucideIcons.Check,
    X: LucideIcons.X,
    Menu: LucideIcons.Menu,
    ChevronDown: LucideIcons.ChevronDown,
    ChevronRight: LucideIcons.ChevronRight,
    ChevronLeft: LucideIcons.ChevronLeft,
    Facebook: LucideIcons.Facebook,
    Twitter: LucideIcons.Twitter,
    Instagram: LucideIcons.Instagram,
    Linkedin: LucideIcons.Linkedin,
    Youtube: LucideIcons.Youtube,
    Award: LucideIcons.Award,
    Sparkles: LucideIcons.Sparkles,
    Flag: LucideIcons.Flag,
    Users: LucideIcons.Users,
    Briefcase: LucideIcons.Briefcase,
    MessageSquare: LucideIcons.MessageSquare,
    FileText: LucideIcons.FileText,
    Image: LucideIcons.Image,
    CreditCard: LucideIcons.CreditCard,
    DollarSign: LucideIcons.DollarSign,
    ThumbsUp: LucideIcons.ThumbsUp,
    User: LucideIcons.User,
    Send: LucideIcons.Send,
    ClipboardCheck: LucideIcons.ClipboardCheck,
    TreePine: LucideIcons.TreePine,
    Droplets: LucideIcons.Droplets,
    Hammer: LucideIcons.Hammer,
    Sun: LucideIcons.Sun,
    CloudRain: LucideIcons.CloudRain,
    Layout: LucideIcons.Layout,
    Square: LucideIcons.Square,
    Building: LucideIcons.Building,
    Plus: LucideIcons.Plus,
    Minus: LucideIcons.Minus,
    Search: LucideIcons.Search,
    Infinity: LucideIcons.Infinity,
    Volume2: LucideIcons.Volume2,
    VolumeX: LucideIcons.VolumeX,
    Play: LucideIcons.Play,
    Pause: LucideIcons.Pause,
    ChevronUp: LucideIcons.ChevronUp,
    Google,
    Quote: LucideIcons.Quote,
    CheckCircle: LucideIcons.CheckCircle,
    Gem: LucideIcons.Gem,
    Globe: LucideIcons.Globe,
    Scale: LucideIcons.Scale,
    ShieldCheck: LucideIcons.ShieldCheck,
    Target: LucideIcons.Target,
    TrendingUp: LucideIcons.TrendingUp,
    Zap: LucideIcons.Zap,
    BadgeCheck: LucideIcons.BadgeCheck,
    Lock: LucideIcons.Lock,
    MessageCircle: LucideIcons.MessageCircle,
    Info: LucideIcons.Info,
    ShoppingBag: LucideIcons.ShoppingBag,
    AlertCircle: LucideIcons.AlertCircle,
    Truck: LucideIcons.Truck,
    Copyright: LucideIcons.Copyright,
    // Aliases for alternate naming used in data files
    Warranty: LucideIcons.Shield,
    LinkedIn: LucideIcons.Linkedin,
    Verified: LucideIcons.BadgeCheck,
    Chat: LucideIcons.MessageCircle,
};

// Helper component to render icons - Fixed to properly render React components and support all Lucide icons
export const Icon = ({ name, className = "w-5 h-5", ...props }: {
    name: string;
    className?: string;
    [key: string]: any;
}) => {
    if (!name) {
        return null;
    }

    // Strip "Lucide" or "lucide-" prefixes if present
    let cleanName = name;
    if (cleanName.startsWith('Lucide')) {
        cleanName = cleanName.substring(6);
    } else if (cleanName.startsWith('lucide-')) {
        cleanName = cleanName.substring(7);
        // Convert kebab-case to PascalCase (e.g., cloud-rain -> CloudRain)
        cleanName = cleanName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }

    // 1. Check custom iconMap
    let IconComponent = iconMap[cleanName];

    // 2. Check full LucideIcons set
    if (!IconComponent) {
        IconComponent = (LucideIcons as any)[cleanName];
    }

    // 3. Case-insensitive and capitalization fallbacks
    if (!IconComponent) {
        const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        IconComponent = (LucideIcons as any)[capitalizedName] || iconMap[capitalizedName];
        
        if (!IconComponent) {
            const lowerName = cleanName.toLowerCase();
            const foundKey = Object.keys(LucideIcons).find(key => key.toLowerCase() === lowerName);
            if (foundKey) {
                IconComponent = (LucideIcons as any)[foundKey];
            }
        }
    }

    // 4. Default fallback so it never returns empty/null when an icon is configured
    if (!IconComponent) {
        console.warn(`Icon "${name}" (cleaned: "${cleanName}") not found in icons config or lucide-react`);
        IconComponent = LucideIcons.CircleHelp || LucideIcons.HelpCircle || LucideIcons.Star;
    }

    return React.createElement(IconComponent, { className, ...props });
};