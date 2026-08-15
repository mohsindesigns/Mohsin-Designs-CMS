import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Image from "next/image";
import Link from "next/link";
import RichTextRenderer from "./ui/RichTextRenderer";

gsap.registerPlugin(ScrollTrigger);

const LiquidParallax = ({ children, speed = 0.1, className = "" }: { children: React.ReactNode; speed?: number; className?: string }) => {
  const ref = useRef(null);
  const [scrollTarget, setScrollTarget] = useState<any>(undefined);
  useEffect(() => {
    setScrollTarget(ref);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.6, 0.4]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={`absolute inset-0 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HolographicInput = ({ icon: IconName, label, type = "text", options = [], ...props }: { icon: string; label: string; type?: string; options?: any[];[key: string]: any }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isFocused ? {
          opacity: 0.2,
          scale: 1.05,
        } : {
          opacity: isHovered ? 0.1 : 0,
          scale: 1,
        }}
        className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary rounded-xl blur-lg"
        transition={{ duration: 0.3 }}
      />

      <div className={`
        relative flex items-center bg-card/95 backdrop-blur-sm rounded-xl border transition-all duration-500
        ${isFocused
          ? 'border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.15)]'
          : hasValue
            ? 'border-primary/30'
            : 'border-border/80 hover:border-border/80'
        }
      `}>
        <div className={`
          absolute left-4 transition-all duration-500
          ${isFocused ? 'text-primary scale-110' : hasValue ? 'text-primary' : 'text-muted-foreground group-hover:text-muted-foreground/80'}
        `}>
          <Icon name={IconName} className="w-5 h-5" />
        </div>

        {type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-10 py-4 bg-transparent rounded-xl text-foreground text-sm focus:outline-none appearance-none cursor-pointer"
            value={props.value || ""}
            {...props}
          >
            <option value="" disabled>{label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            placeholder={label}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            {...props}
          />
        )}

        {isFocused && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary rounded-full"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>
    </div>
  );
};

const QuantumTextarea = ({ icon: IconName, label, ...props }: { icon: string; label: string;[key: string]: any }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isFocused ? {
          opacity: 0.2,
          scale: 1.02,
        } : {
          opacity: isHovered ? 0.1 : 0,
          scale: 1,
        }}
        className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary rounded-xl blur-lg"
        transition={{ duration: 0.3 }}
      />

      <div className={`
        relative flex bg-card/95 backdrop-blur-sm rounded-xl border transition-all duration-500
        ${isFocused
          ? 'border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.15)]'
          : hasValue
            ? 'border-primary/30'
            : 'border-border/80 hover:border-border/80'
        }
      `}>
        <div className={`
          absolute left-4 top-4 transition-all duration-500
          ${isFocused ? 'text-primary scale-110' : hasValue ? 'text-primary' : 'text-muted-foreground'}
        `}>
          <Icon name={IconName} className="w-5 h-5" />
        </div>

        <textarea
          placeholder={label}
          rows={5}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
          {...props}
        />
      </div>
    </div>
  );
};

const CrystalServiceCard = ({ title, desc, icon, isSelected, onClick }: { title: string; desc: string; icon: string; isSelected: boolean; onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-700
        ${isSelected
          ? 'bg-gradient-to-br from-primary/5 via-card to-primary/5 shadow-2xl'
          : 'bg-card/80 backdrop-blur-sm hover:bg-card'
        }
      `}
      style={{
        boxShadow: isSelected
          ? '0 20px 40px -15px hsl(var(--primary)/0.2), inset 0 0 0 1px hsl(var(--primary)/0.3)'
          : isHovered
            ? '0 15px 30px -12px hsl(var(--foreground)/0.1), inset 0 0 0 1px hsl(var(--primary)/0.2)'
            : '0 10px 25px -8px hsl(var(--foreground)/0.05), inset 0 0 0 1px hsl(var(--border)/0.3)'
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl"
        />
      )}

      <div className="relative">
        <motion.div
          animate={isHovered || isSelected ? {
            rotate: [0, 5, -5, 0],
            scale: 1.1
          } : {}}
          transition={{ duration: 0.5 }}
          className={`
            text-2xl sm:text-3xl mb-3 sm:mb-4 transition-colors duration-500
            ${isSelected ? 'text-primary' : 'text-primary/70 group-hover:text-primary'}
          `}
        >
          {icon}
        </motion.div>
      </div>

      <h4 className={`
        text-sm sm:text-base font-medium mb-1 sm:mb-2 transition-colors duration-500
        ${isSelected ? 'text-foreground' : 'text-foreground/80'}
      `}>
        {title}
      </h4>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
        {desc}
      </p>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
            <Icon name="Check" className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}

      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
        </>
      )}
    </motion.div>
  );
};

const StageIndicator = ({ currentStep }: { currentStep: number }) => {
  const stages = [
    { number: 1, name: "Identity", icon: "User", desc: "Your details" },
    { number: 2, name: "Specification", icon: "FileText", desc: "Project scope" },
    { number: 3, name: "Transmission", icon: "Send", desc: "Final review" },
  ];

  return (
    <div className="relative mb-12 sm:mb-16">
      <div className="absolute top-4 sm:top-6 left-0 right-0 h-[2px] bg-border hidden sm:block" />

      <motion.div
        className="absolute top-4 sm:top-6 left-0 h-[2px] bg-gradient-to-r from-primary to-primary hidden sm:block"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative flex items-start justify-between">
        {stages.map((stage) => (
          <div key={stage.number} className="flex flex-col items-center flex-1">
            <motion.div
              animate={currentStep >= stage.number ? {
                scale: 1.1,
                backgroundColor: "hsl(var(--primary))",
                borderColor: "hsl(var(--primary))",
              } : {
                scale: 1,
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              className={`
                relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 
                flex items-center justify-center mb-2 sm:mb-3
                ${currentStep >= stage.number ? 'bg-primary border-primary' : 'bg-background border-border'}
                shadow-md transition-all duration-300
              `}
            >
              {currentStep > stage.number ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Icon name="Check" className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <div className={`${currentStep >= stage.number ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  <Icon name={stage.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </motion.div>

            <span className={`
              text-[10px] sm:text-xs font-semibold tracking-wider text-center
              ${currentStep >= stage.number ? 'text-primary' : 'text-muted-foreground'}
            `}>
              <span className="hidden xs:inline">{stage.name}</span>
              <span className="xs:hidden">{stage.number}</span>
            </span>

            <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
              {stage.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const success = (useContent().quote as any).success || { title: '', message: '', response: '', buttonText: 'Close' };

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-secondary/95 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="relative bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-primary/5" />

            <div className="relative pt-10 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: 0.2
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Icon name="Check" className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl sm:text-2xl font-light text-foreground mb-2 sm:mb-3"
              >
                {success.title}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground text-xs sm:text-sm leading-relaxed"
              >
                <RichTextRenderer content={success.message} className="mb-2" stripParagraphs={true} />
                <span className="font-medium text-primary mt-2 block">
                  <RichTextRenderer content={success.response} stripParagraphs={true} />
                </span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase rounded-full shadow-lg hover:shadow-xl transition-all duration-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {success.buttonText}
              </motion.button>
            </div>

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-primary/20" />
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-primary/20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// SMS Consent Checkbox Component
const SMSConsentCheckbox = ({ checked, onChange, showError }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; showError?: boolean }) => {
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
        ${showError ? 'bg-red-500/5 border border-red-500/50' :
          isFocused ? 'bg-primary/5 border border-primary/30' :
            'bg-muted/30 border border-border/50 hover:border-primary/20'}
      `}>
        <div className="relative">
          <input
            type="checkbox"
            id="smsConsent"
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
              borderColor: showError ? "hsl(0, 84%, 60%)" : "hsl(var(--border))"
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
          htmlFor="smsConsent"
          className={`flex-1 text-[11px] sm:text-xs leading-relaxed cursor-pointer ${showError ? 'text-red-400' : 'text-muted-foreground'}`}
        >
          I agree to receive informational SMS text messages from Eagle Revolution related to my request, including appointment scheduling and service updates, at the number I provided. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase. Please see{' '}
          <Link href="/privacy" className="text-primary hover:underline transition-colors">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/terms" className="text-primary hover:underline transition-colors">Terms and Conditions</Link>.
        </label>
      </div>

      {showError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-[10px] sm:text-xs mt-1.5 ml-2"
        >
          Please agree to receive SMS communications to continue.
        </motion.p>
      )}
    </motion.div>
  );
};

const GetQuote = () => {
  const { quote } = useContent();
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [smsConsent, setSmsConsent] = useState(false);
  const [showSmsError, setShowSmsError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    projectType: '',
    timeline: '',
    message: ''
  });

  const section = (quote as any).section || { badge: '', headline: '', description: '' };
  const services: any[] = (quote as any).services || [];
  const projectTypes: any[] = (quote as any).projectTypes || [];
  const timelines: any[] = (quote as any).timelines || [];
  const success = (quote as any).success || { title: '', message: '', response: '', buttonText: 'Close' };

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validate step 1 before proceeding to step 2
  const handleStep1Continue = () => {
    if (!smsConsent) {
      setShowSmsError(true);
      return;
    }
    setShowSmsError(false);
    setFormStep(2);
  };

  // Proceed from step 2 to step 3 (no validation needed)
  const handleStep2Continue = () => {
    setFormStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate SMS consent
    if (!smsConsent) {
      setShowSmsError(true);
      setFormStep(1);
      return;
    }

    setIsSubmitting(true);

    const serviceNames = selectedServices
      .map(id => services.find((s: any) => s.id === id)?.title)
      .join(', ');

    const emailContent = `
🦅 EAGLE REVOLUTION QUOTE REQUEST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
ZIP Code: ${formData.zipCode}
Timeline: ${timelines.find((t: any) => t.value === formData.timeline)?.label || 'Not specified'}
Selected Services: ${serviceNames || 'None selected'}
SMS Consent: Yes

📝 MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Submitted: ${new Date().toLocaleString()}
🇺🇸 Veteran Owned & Operated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    try {
      const payload = {
        type: 'Quote Request',
        subject: `Eagle Revolution Quote Request - ${formData.name}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        zipCode: formData.zipCode,
        timeline: timelines.find((t: any) => t.value === formData.timeline)?.label || 'Not specified',
        services: serviceNames || 'None selected',
        message: formData.message || "New Quote Request from Homepage",
        sms_consent: 'Yes'
      };

      console.log('Sending submission:', payload);

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      console.log('API Response Status:', response.status);
      console.log('API Response Body:', result);

      if (response.ok) {
        setShowSuccess(true);
        setFormStep(1);
        setSelectedServices([]);
        setSmsConsent(false);
        setShowSmsError(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          zipCode: '',
          projectType: '',
          timeline: '',
          message: ''
        });
        return;
      } else {
        console.error('API submission failed, falling back to mailto');
        const mailtoLink = `mailto:banderson@eaglerevolution.com?subject=Quote Request - ${formData.name}&body=${encodeURIComponent(emailContent)}`;
        window.location.href = mailtoLink;
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Final submission error:', error);
      const mailtoLink = `mailto:banderson@eaglerevolution.com?subject=Quote Request - ${formData.name}&body=${encodeURIComponent(emailContent)}`;
      window.location.href = mailtoLink;
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [scrollTarget, setScrollTarget] = useState<any>(undefined);

  useEffect(() => {
    setIsClient(true);
    setScrollTarget(sectionRef);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.quote-cinematic',
        { y: 50, opacity: 0, rotateX: 5 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  // Determine which continue handler to use based on current step
  const handleContinueClick = () => {
    if (formStep === 1) {
      handleStep1Continue();
    } else if (formStep === 2) {
      handleStep2Continue();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-background py-12 sm:py-14 md:py-16 lg:py-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1000px] h-[400px] sm:h-[500px] bg-gradient-to-b from-primary/5 to-transparent opacity-60 blur-3xl" />

      <LiquidParallax speed={0.05} className="z-0">
        <div className="absolute top-20 right-0 w-2/5 h-3/5">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
            alt=""
            fill
            quality={100}
            className="object-cover opacity-[0.03]"
          />
        </div>
      </LiquidParallax>

      <LiquidParallax speed={0.08} className="z-0">
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt=""
            fill
            quality={100}
            className="object-cover opacity-[0.03]"
          />
        </div>
      </LiquidParallax>

      <div className="absolute inset-0 pointer-events-none">
        {isClient && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0, 40, 0],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 quote-cinematic">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary/80">
              {section?.badge}
            </span>
            <div className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-primary via-primary to-transparent" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4 sm:mb-6 leading-tight">
            {(section?.headlinePrefix || section?.headlineHighlight || section?.headlineSuffix) ? (
              <>
                {section?.headlinePrefix && (
                  <span>{section.headlinePrefix} </span>
                )}
                {section?.headlineHighlight && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-semibold">
                    {section.headlineHighlight}
                  </span>
                )}
                {section?.headlineSuffix && (
                  <span> {section.headlineSuffix}</span>
                )}
              </>
            ) : (
              <RichTextRenderer content={section.headline} stripParagraphs={true} />
            )}
          </h2>

          <div className="text-sm sm:text-base md:text-lg text-muted-foreground font-light max-w-2xl mx-auto px-4">
            <RichTextRenderer content={section.description} stripParagraphs={true} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-primary/10 shadow-2xl overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.rect
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                fill="none"
                stroke="url(#formGradient)"
                strokeWidth="1.2"
                strokeDasharray="8 8"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary)/0.8)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative p-5 sm:p-8 md:p-10 lg:p-12">
              <StageIndicator currentStep={formStep} />

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <HolographicInput
                          icon="User"
                          label="Full name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        <HolographicInput
                          icon="Mail"
                          type="email"
                          label="Email address"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <HolographicInput
                          icon="Phone"
                          type="tel"
                          label="Phone number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                        <HolographicInput
                          icon="MapPin"
                          type="text"
                          label="ZIP Code"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          pattern="[0-9]{5}"
                          title="Please enter a valid 5-digit ZIP code"
                        />
                      </div>

                      {/* SMS Consent Checkbox */}
                      <SMSConsentCheckbox
                        checked={smsConsent}
                        onChange={(e) => {
                          setSmsConsent(e.target.checked);
                          if (e.target.checked) setShowSmsError(false);
                        }}
                        showError={showSmsError}
                      />
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <div>
                        <label className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4 sm:mb-6">
                          Select Your Services
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {services.map((service: any) => (
                            <CrystalServiceCard
                              key={service.id}
                              title={service.title}
                              desc={service.desc}
                              icon={service.icon}
                              isSelected={selectedServices.includes(service.id)}
                              onClick={() => toggleService(service.id)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <HolographicInput
                          icon="Calendar"
                          type="select"
                          label="Timeline horizon"
                          name="timeline"
                          options={timelines}
                          value={formData.timeline}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <QuantumTextarea
                        icon="MessageSquare"
                        label="Describe your project vision, requirements, and challenges"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-card to-primary/5 rounded-xl border border-primary/10"
                      >
                        <div className="relative z-10">
                          <h4 className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-primary mb-3 sm:mb-4 flex items-center gap-2">
                            <Icon name="Sparkles" className="w-4 h-4" />
                            TRANSMISSION SUMMARY
                          </h4>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Name</p>
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {formData.name || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {formData.zipCode || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Services</p>
                              <p className="font-medium text-foreground text-xs sm:text-sm">
                                {selectedServices.length} of {services.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Timeline</p>
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {formData.timeline ? timelines.find((t: any) => t.value === formData.timeline)?.label : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-primary/10">
                  <motion.button
                    type="button"
                    onClick={() => setFormStep(Math.max(1, formStep - 1))}
                    className={`
                      relative px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-full transition-all duration-500
                      ${formStep === 1
                        ? 'opacity-0 pointer-events-none'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={formStep === 1}
                  >
                    <span className="flex items-center gap-1 sm:gap-2">
                      ← <span className="hidden xs:inline">Previous</span>
                    </span>
                  </motion.button>

                  {formStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleContinueClick}
                      className="relative px-5 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-medium rounded-full shadow-lg overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                        Continue
                        <Icon name="ArrowRight" className="w-4 h-4" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative px-6 sm:px-10 py-2.5 sm:py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-medium rounded-full shadow-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                            />
                            <span className="hidden xs:inline">Transmitting...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden xs:inline">Get Free Quote</span>
                            <span className="xs:hidden">Send</span>
                            <Icon name="Send" className="w-4 h-4" />
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.button>
                  )}
                </div>
              </form>


            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          className="relative block w-full h-16 sm:h-20 md:h-24"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#quantumWave)"
            d="M0,48L60,52.3C120,57,240,65,360,65.3C480,66,600,58,720,52C840,46,960,42,1080,46C1200,50,1320,58,1380,62L1440,66L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
          />
          <defs>
            <linearGradient id="quantumWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />
    </section>
  );
};

export default GetQuote;