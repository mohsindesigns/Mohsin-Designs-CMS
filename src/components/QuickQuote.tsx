import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../config/icons';
import { useContent } from '../hooks/useContent';
import RichTextRenderer from './ui/RichTextRenderer';

// SMS Consent Checkbox Component
const SMSConsentCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            className="relative mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`
                relative flex items-start gap-3 p-4 rounded-xl transition-all duration-500
                ${isFocused ? 'bg-primary/5 border border-primary/30' : 'bg-muted/30 border border-border/50 hover:border-primary/20'}
            `}>
                <div className="relative">
                    <input
                        type="checkbox"
                        id="smsConsentQuick"
                        checked={checked}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="absolute opacity-0 w-5 h-5 cursor-pointer"
                    />
                    <motion.div
                        animate={checked ? {
                            backgroundColor: "hsl(var(--primary))",
                            borderColor: "hsl(var(--primary))"
                        } : {
                            backgroundColor: "transparent",
                            borderColor: "hsl(var(--border))"
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300
                            ${isHovered && !checked ? 'border-primary/50' : ''}
                        `}
                    >
                        {checked && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <Icon name="Check" className="w-3 h-3 text-white" />
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <label
                    htmlFor="smsConsentQuick"
                    className="flex-1 text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
                >
                    I agree to receive informational SMS text messages from Eagle Revolution related to my request, including appointment scheduling and service updates, at the number I provided. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase. Please see{' '}
                    <Link href="/privacy" className="text-primary hover:underline transition-colors">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link href="/terms" className="text-primary hover:underline transition-colors">Terms and Conditions</Link>.
                </label>
            </div>

            {isFocused && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary rounded-full"
                />
            )}
        </motion.div>
    );
};

const QuickQuote = () => {
    const { quickQuote, services } = useContent();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [smsConsent, setSmsConsent] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState(1);

    // Get project types from actual services only
    const projectTypes = (() => {
        const servicesList = Array.isArray(services) ? services : (services as any)?.services || [];
        const publishedServices = servicesList.filter((s: any) => s.status === 'published' || s.status === undefined);
        
        return publishedServices.map((service: any) => ({
            value: service.slug || service.title.toLowerCase().replace(/ /g, '-'),
            label: service.title
        }));
    })();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate SMS consent
        if (!smsConsent) {
            alert("Please agree to receive SMS communications to continue.");
            return;
        }

        setIsSubmitting(true);

        const emailContent = `
🔨 NEW QUICK QUOTE REQUEST - EAGLE REVOLUTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Project Type: ${(projectTypes as any[]).find((t: any) => t.value === formData.projectType)?.label || 'Not specified'}
SMS Consent: Yes

📝 MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Submitted: ${new Date().toLocaleString()}
🌐 Source: Quick Quote Widget
🇺🇸 Veteran Owned & Operated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

        try {
            try {
                const response = await fetch('/api/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'Quote Request',
                        subject: `Quick Quote - ${formData.name}`,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        project_type: (projectTypes as any[]).find((t: any) => t.value === formData.projectType)?.label,
                        message: formData.message,
                        sms_consent: 'Yes'
                    })
                });

                const result = await response.json().catch(() => ({}));
                console.log('Quick Quote Response Status:', response.status);
                console.log('Quick Quote Response Body:', result);

                if (response.ok) {
                    showSuccess();
                    return;
                }
            } catch (fetchError) {
                console.error('Quick Quote fetch error:', fetchError);
            }

            const mailtoLink = `mailto:banderson@eaglerevolution.com?subject=🔨 Quick Quote - ${formData.name}&body=${encodeURIComponent(emailContent)}`;
            window.location.href = mailtoLink;
            showSuccess();

        } catch (error) {
            console.error('Submission error:', error);
            alert('Please email us directly at banderson@eaglerevolution.com');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showSuccess = () => {
        setIsSuccess(true);
        setFormData({
            name: '',
            email: '',
            phone: '',
            projectType: '',
            message: ''
        });
        setSmsConsent(false);
        setStep(1);

        setTimeout(() => {
            setIsSuccess(false);
            setIsOpen(false);
        }, 3000);
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="fixed bottom-8 right-8 z-50 group"
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 1
                }}
            >
                {!isOpen && [...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle, rgba(36, 48, 210, ${0.3 - i * 0.1}) 0%, transparent 70%)`,
                        }}
                        animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2.5,
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {isHovered && (
                    <>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-primary rounded-full"
                                initial={{
                                    x: 0,
                                    y: 0,
                                    scale: 0,
                                    opacity: 0.8
                                }}
                                animate={{
                                    x: Math.cos(i * 45 * (Math.PI / 180)) * 60,
                                    y: Math.sin(i * 45 * (Math.PI / 180)) * 60,
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </>
                )}

                <motion.div
                    className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl flex items-center justify-center cursor-pointer border-2 border-white/30"
                    animate={{
                        boxShadow: isHovered
                            ? '0 30px 50px -15px rgba(36, 48, 210, 0.7), 0 0 0 3px rgba(255,255,255,0.4)'
                            : '0 20px 40px -12px rgba(36, 48, 210, 0.5)',
                        rotate: isHovered ? [0, -5, 5, -5, 5, 0] : 0
                    }}
                    transition={{
                        rotate: {
                            duration: 0.5,
                            repeat: isHovered ? Infinity : 0,
                            repeatType: "mirror"
                        }
                    }}
                >
                    <motion.div
                        className="absolute inset-2 rounded-full bg-white/20 blur-md"
                        animate={{
                            scale: isHovered ? 1.2 : 1,
                            opacity: isHovered ? 0.8 : 0.4
                        }}
                    />

                    <motion.div
                        animate={{
                            rotate: isHovered ? 360 : 0,
                            scale: isHovered ? 1.2 : 1
                        }}
                        transition={{
                            rotate: {
                                duration: 2,
                                repeat: isHovered ? Infinity : 0,
                                ease: "linear"
                            }
                        }}
                        className="relative z-10"
                    >
                        <Icon name="Flag" className="w-7 h-7 md:w-9 md:h-9 text-white" />
                    </motion.div>

                    <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        animate={{
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="absolute right-20 top-1/2 -translate-y-1/2 bg-gradient-to-r from-secondary to-secondary/80 text-white text-sm font-medium px-5 py-2.5 rounded-2xl whitespace-nowrap shadow-2xl border border-primary/30"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon name="Sparkles" className="w-4 h-4 text-primary" />
                                    {quickQuote.button?.text || "Get Free Quote"}
                                    <Icon name="ChevronRight" className="w-4 h-4 text-primary" />
                                </span>
                                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-secondary to-secondary/80 rotate-45 border-r border-t border-primary/30" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
                        />

                        <div className="fixed inset-0 flex items-center justify-center p-4 z-[101]">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                    mass: 1
                                }}
                                className="relative w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur-2xl"
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        opacity: [0.3, 0.5, 0.3]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />

                                <div className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-primary/10">
                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />

                                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl" />
                                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-primary/20 rounded-tr-3xl" />

                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border"
                                    >
                                        <Icon name="X" className="w-5 h-5 text-muted-foreground" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {isSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                                animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                                                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                                className="absolute inset-0 bg-card/90 z-20 flex flex-col items-center justify-center p-8"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        damping: 15,
                                                        stiffness: 200
                                                    }}
                                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-2xl shadow-primary/30"
                                                >
                                                    <motion.svg
                                                        className="w-12 h-12 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </motion.svg>
                                                </motion.div>

                                                <motion.h3
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-2xl font-bold text-foreground mb-2"
                                                >
                                                    Quote Request Sent!
                                                </motion.h3>

                                                <motion.p
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="text-muted-foreground text-center"
                                                >
                                                    We'll respond within 4-8 hours.
                                                </motion.p>

                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary/20 rounded-full overflow-hidden"
                                                >
                                                    <motion.div
                                                        className="h-full bg-primary"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 3, ease: "linear" }}
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="relative p-8 md:p-10">
                                        <motion.div
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="mb-8"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Icon name="Award" className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                        {quickQuote.title || "Quick Quote"}
                                                    </h2>
                                                    <div className="text-sm text-muted-foreground">
                                                         <RichTextRenderer content={quickQuote.description || "Get your free estimate in minutes"} stripParagraphs={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="relative mb-8"
                                        >
                                            <div className="flex items-center justify-between">
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="flex flex-col items-center"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 + i * 0.1 }}
                                                    >
                                                        <motion.div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${i <= step
                                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                                : 'bg-muted text-muted-foreground'
                                                                }`}
                                                            animate={i === step ? {
                                                                scale: [1, 1.1, 1],
                                                                boxShadow: [
                                                                    '0 4px 6px -1px rgba(36, 48, 210, 0.1)',
                                                                    '0 10px 15px -3px rgba(36, 48, 210, 0.3)',
                                                                    '0 4px 6px -1px rgba(36, 48, 210, 0.1)'
                                                                ]
                                                            } : {}}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                        >
                                                            {i}
                                                        </motion.div>
                                                        <span className="text-xs font-medium text-muted-foreground hidden md:block">
                                                            {quickQuote.steps?.[i - 1] || (i === 1 ? 'Details' : i === 2 ? 'Project' : 'Message')}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="absolute top-5 left-0 right-0 h-[2px] bg-border -z-10 hidden md:block">
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: `${((step - 1) / 2) * 100}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </motion.div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <AnimatePresence mode="wait">
                                                {step === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-4"
                                                    >
                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                <Icon name="User" className="w-4 h-4 inline mr-2 text-primary" />
                                                                {quickQuote.formLabels?.name || "Your Name"}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-full px-5 py-4 bg-muted border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                                                                placeholder="John Doe"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                <Icon name="Mail" className="w-4 h-4 inline mr-2 text-primary" />
                                                                {quickQuote.formLabels?.email || "Email Address"}
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-full px-5 py-4 bg-muted border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                                                                placeholder="john@example.com"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-4"
                                                    >
                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                <Icon name="Phone" className="w-4 h-4 inline mr-2 text-primary" />
                                                                {quickQuote.formLabels?.phone || "Phone Number"}
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                                required
                                                                className="w-full px-5 py-4 bg-muted border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                                                                placeholder="(636) 449-9714"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                <Icon name="Home" className="w-4 h-4 inline mr-2 text-primary" />
                                                                {quickQuote.formLabels?.projectType || "Project Type"}
                                                            </label>
                                                            <select
                                                                name="projectType"
                                                                value={formData.projectType}
                                                                onChange={handleInputChange}
                                                                className="w-full px-5 py-4 bg-muted border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground appearance-none"
                                                            >
                                                                <option value="">Select project type</option>
                                                                {projectTypes.map((type: any) => (
                                                                    <option key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -50 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-4"
                                                    >
                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                <Icon name="MessageSquare" className="w-4 h-4 inline mr-2 text-primary" />
                                                                {quickQuote.formLabels?.message || "Tell us about your project"}
                                                            </label>
                                                            <textarea
                                                                name="message"
                                                                value={formData.message}
                                                                onChange={handleInputChange}
                                                                required
                                                                rows={5}
                                                                className="w-full px-5 py-4 bg-muted border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground resize-none"
                                                                placeholder="Briefly describe your exterior remodeling needs..."
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* SMS Consent Checkbox - shown in step 3 */}
                                            {step === 3 && (
                                                <SMSConsentCheckbox
                                                    checked={smsConsent}
                                                    onChange={(e) => setSmsConsent(e.target.checked)}
                                                />
                                            )}

                                            <div className="flex items-center justify-between pt-6 border-t border-border">
                                                {step > 1 && (
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setStep(step - 1)}
                                                        className="group px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                                                        whileHover={{ x: -3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Icon name="ChevronRight" className="w-4 h-4 rotate-180" />
                                                        Back
                                                    </motion.button>
                                                )}

                                                {step < 3 ? (
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setStep(step + 1)}
                                                        className="ml-auto px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                                                        whileHover={{ scale: 1.02, x: 3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Continue
                                                        <Icon name="ChevronRight" className="w-4 h-4" />
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isSubmitting || !smsConsent}
                                                        className="ml-auto px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        whileHover={{ scale: isSubmitting || !smsConsent ? 1 : 1.02 }}
                                                        whileTap={{ scale: isSubmitting || !smsConsent ? 1 : 0.98 }}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {quickQuote.formLabels?.submit || "Get Quote"}
                                                                <Icon name="Send" className="w-4 h-4" />
                                                            </>
                                                        )}
                                                    </motion.button>
                                                )}
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="flex items-center justify-center gap-4 pt-4 text-xs"
                                            >
                                                {(quickQuote.badges || [
                                                    { text: "Free estimate", icon: "Check" },
                                                    { text: "4-8h response", icon: "Clock" },
                                                    { text: "Veteran owned", icon: "Flag" }
                                                ]).map((badge: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                        <span className="text-muted-foreground">{badge.text}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        </form>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default QuickQuote;