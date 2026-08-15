"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "../../hooks/useContent";
import { Icon } from "../../config/icons";
import RichTextRenderer from "../ui/RichTextRenderer";
import PageInlineFaqs from "@/components/PageInlineFaqs";

const HolographicInput = ({ icon: IconName, label, type = "text", ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    return (
        <div className="relative group">
            <div className={`relative flex items-center bg-card rounded-xl border transition-all duration-300 ${isFocused ? 'border-primary shadow-lg shadow-primary/10' : hasValue ? 'border-primary/40' : 'border-border hover:border-border/80'}`}>
                <div className={`absolute left-4 transition-colors duration-300 ${isFocused || hasValue ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Icon name={IconName} className="w-5 h-5" />
                </div>
                <input
                    type={type}
                    placeholder={label}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => {
                        setHasValue(!!e.target.value);
                        props.onChange?.(e);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                    {...props}
                />
            </div>
        </div>
    );
};

export default function ContactTemplate({ pageData }: { pageData?: any }) {
    const { contactPage: globalContactData, footer } = useContent();

    // Prioritize page-specific content over global content
    const contactData = pageData?.content?.contactPage || globalContactData;
    const footerContact = footer?.contact || {};
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    // Fallback data if CMS has no data yet
    const header = contactData?.header || {};
    const badge = header.badge || "Contact Us";
    const headline = header.headline || "Get In Touch";
    const description = header.description || "We'd love to hear from you. Fill out the form and we'll get back to you shortly.";
    const formFields = contactData?.formFields || [
        { name: "name", label: "Full Name", type: "text", required: true, icon: "User" },
        { name: "email", label: "Email Address", type: "email", required: true, icon: "Mail" },
        { name: "phone", label: "Phone Number", type: "tel", required: false, icon: "Phone" },
        { name: "message", label: "Your Message", type: "textarea", required: true, icon: "MessageSquare" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: 'Contact Form',
                    subject: `New Contact Form Submission - ${formData.name || 'Unknown'}`,
                })
            });

            const result = await response.json().catch(() => ({}));
            if (response.ok || result.success || result.submissionId) {
                setShowSuccess(true);
                setFormData({});
            } else {
                console.error('Submission failed:', response.status, result);
                alert(`Error: ${result.error || 'Submission failed'}`);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inlineFields = formFields.filter((f: any) => f.type !== "textarea");
    const textareaFields = formFields.filter((f: any) => f.type === "textarea");

    const info = contactData?.info || {};
    const infoCards = contactData?.infoCards || [];

    // Map infoCards to the info structure if info is empty — also fall back to footer contact
    const finalInfo = {
        phone: info.phone || infoCards.find((c: any) => c.type === 'phone')?.value || footerContact.phone || "",
        email: info.email || infoCards.find((c: any) => c.type === 'email')?.value || footerContact.email || "",
        address: info.address || infoCards.find((c: any) => c.type === 'location')?.value || footerContact.address || "",
        hours: info.hours || footerContact.hours || ""
    };

    return (
        <main className="relative bg-background py-24 min-h-screen overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent opacity-60 blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 relative">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
                            {badge}
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-light text-foreground mb-6 leading-tight">
                            {headline}
                        </h1>
                        <div className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            <RichTextRenderer content={description} />
                        </div>
                    </motion.div>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-8 sm:p-12 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Inline fields grid */}
                        {inlineFields.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {inlineFields.map((field: any, idx: number) => (
                                    <HolographicInput
                                        key={idx}
                                        icon={field.icon || "User"}
                                        label={field.label}
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={(e: any) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        required={field.required}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Textarea fields */}
                        {textareaFields.map((field: any, idx: number) => (
                            <div key={`ta-${idx}`} className="relative">
                                <div className="relative flex bg-card rounded-xl border border-border focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-300">
                                    <div className="absolute left-4 top-4 text-muted-foreground">
                                        <Icon name={field.icon || "MessageSquare"} className="w-5 h-5" />
                                    </div>
                                    <textarea
                                        placeholder={field.label}
                                        name={field.name}
                                        rows={5}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        required={field.required}
                                        className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                        ))}

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Business Vitals Section */}
                {(finalInfo.phone || finalInfo.email || finalInfo.address || finalInfo.hours) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                    >
                        {finalInfo.phone && (
                            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Icon name="Phone" className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Phone</h3>
                                <p className="text-foreground font-medium">{finalInfo.phone}</p>
                            </div>
                        )}
                        {finalInfo.email && (
                            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Icon name="Mail" className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Email</h3>
                                <p className="text-foreground font-medium break-all">{finalInfo.email}</p>
                            </div>
                        )}
                        {finalInfo.address && (
                            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Icon name="MapPin" className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Address</h3>
                                <p className="text-foreground font-medium">{finalInfo.address}</p>
                            </div>
                        )}
                        {finalInfo.hours && (
                            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Icon name="Clock" className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Hours</h3>
                                <p className="text-foreground font-medium">{finalInfo.hours}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card rounded-3xl p-10 text-center max-w-md w-full shadow-2xl border border-border"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
                                <Icon name="Check" className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Message Sent!</h2>
                            <p className="text-muted-foreground mb-8">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}