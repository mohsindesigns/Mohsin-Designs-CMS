// app/terms/page.tsx or src/app/terms/page.tsx
"use client";

import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { motion } from "framer-motion";
import { Icon } from "../../config/icons";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08)_0%,_transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <PageBreadcrumbs
              align="center"
              className="mb-6"
              items={[{ name: "Home", url: "/" }, { name: "Terms & Conditions", url: "/terms/" }]}
            />
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-6">
              <Icon name="FileText" className="w-4 h-4 text-primary" />
              <span className="text-primary uppercase tracking-wider text-xs font-semibold">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4">
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Service</span>
            </h1>
            <p suppressHydrationWarning className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Introduction */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Info" className="w-5 h-5 text-primary" />
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Mohsin Designs. These Terms of Service ("Terms") govern your access to and use of the website{' '}
                <a href="https://mohsindesigns.com" className="text-primary hover:underline">mohsindesigns.com</a>{' '}
                and any related services, including our review integration widget, dashboards, and SaaS products (collectively, the "Services") provided by Mohsin Designs ("we," "us," or "our").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Services, you agree to be bound by these Terms. If you do not agree, do not use the Services.
              </p>
            </div>

            {/* Definitions */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="BookOpen" className="w-5 h-5 text-primary" />
                2. Definitions
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">"User," "you," or "your"</span> refers to anyone who accesses or uses the Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">"Account"</span> means the account you create with us to access certain features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">"Content"</span> refers to text, images, reviews, data, and other materials displayed via the Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">"Google Data"</span> means information accessed from your Google Business Profile through Google APIs</span>
                </li>
              </ul>
            </div>

            {/* Description of Services */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Briefcase" className="w-5 h-5 text-primary" />
                3. Description of Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We provide:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Web design and development services for clients on a project basis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Reputation management products, including a widget that displays your authentic Google Business Profile reviews on websites you control</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>A SaaS dashboard (in development) for tagging projects to locations and pairing them with Google reviews</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Services may evolve, and we may add, modify, or discontinue features at our discretion with reasonable notice.
              </p>
            </div>

            {/* Eligibility */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="UserCheck" className="w-5 h-5 text-primary" />
                4. Eligibility and Account Registration
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">To use certain Services, you must:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Have the legal authority to enter into these Terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Provide accurate, complete, and current information during registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Maintain the security of your account credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for all activity that occurs under your account.
              </p>
            </div>

            {/* Google Business Profile Integration */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Star" className="w-5 h-5 text-primary" />
                5. Google Business Profile Integration
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">When you connect your Google Business Profile to our Services:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You confirm you are the rightful owner or authorized manager of the Business Profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You grant us read-only access to your Business Profile data (reviews, business information, ratings) for the sole purpose of displaying and managing this information through the Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We will not modify your Business Profile, post on your behalf, respond to reviews on your behalf, or take any automated actions on your account unless explicitly authorized</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You may revoke access at any time via your Google Account permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Our use of Google user data complies with the Google API Services User Data Policy, including the Limited Use requirements</span>
                </li>
              </ul>
            </div>

            {/* Acceptable Use */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Ban" className="w-5 h-5 text-primary" />
                6. Acceptable Use
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Use the Services for any unlawful, fraudulent, or harmful purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Connect Business Profiles you do not own or are not authorized to manage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Misrepresent reviews, fabricate reviews, or display reviews from businesses without their explicit consent</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Attempt to gain unauthorized access to our systems or other users' data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Reverse engineer, decompile, or otherwise attempt to extract source code</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Scrape, copy, or harvest data from the Services using automated tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Use the Services to spam, harass, or distribute malicious content</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Resell, redistribute, or sublicense the Services without our written permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="X" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Violate any applicable law, regulation, or third-party rights</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these rules.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Copyright" className="w-5 h-5 text-primary" />
                7. Intellectual Property
              </h2>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Our IP</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Services, including code, design, logos, trademarks, and documentation, are owned by Mohsin Designs and protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable license to use the Services in accordance with these Terms.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Your IP</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You retain ownership of content you provide. By submitting content (including connecting your Business Profile), you grant us a non-exclusive license to use, store, display, and process that content as necessary to provide the Services.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Third-Party IP</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Services display Google Business Profile reviews, which remain the property of their respective authors and Google. Review data is displayed in accordance with Google's policies, including required attribution.
              </p>
            </div>

            {/* Payment and Subscriptions */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="CreditCard" className="w-5 h-5 text-primary" />
                8. Payment and Subscriptions
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">For paid Services:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Fees are stated at the time of purchase and may be one-time or recurring</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Payments are processed by third-party providers; we do not store full payment details</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Subscription fees are billed in advance and are non-refundable except as required by law</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We may change pricing with at least 30 days' notice for active subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You can cancel anytime; cancellation takes effect at the end of the current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Failure to pay may result in suspension or termination of Services</span>
                </li>
              </ul>
            </div>

            {/* Disclaimers */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="AlertTriangle" className="w-5 h-5 text-primary" />
                9. Disclaimers
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 uppercase text-sm tracking-wide">
                The Services are provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">We do not warrant that:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>The Services will be uninterrupted, error-free, or secure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Google APIs we depend on will remain available or unchanged</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Any specific business outcomes will result from using the Services</span>
                </li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Shield" className="w-5 h-5 text-primary" />
                10. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 uppercase text-sm tracking-wide">
                To the maximum extent permitted by law:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We shall not be liable for indirect, incidental, special, consequential, or punitive damages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We are not liable for any loss arising from third-party services, including Google APIs</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Some jurisdictions do not allow these limitations, so they may not apply to you.
              </p>
            </div>

            {/* Indemnification */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Gavel" className="w-5 h-5 text-primary" />
                11. Indemnification
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree to indemnify and hold Mohsin Designs harmless from any claims, damages, losses, or expenses (including reasonable legal fees) arising from:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Your use of the Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Your violation of these Terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Your violation of any third-party rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Content you submit or Business Profiles you connect</span>
                </li>
              </ul>
            </div>

            {/* Termination */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="XCircle" className="w-5 h-5 text-primary" />
                12. Termination
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Either party may terminate this agreement at any time:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You can stop using the Services and delete your account at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We may suspend or terminate your access for violation of these Terms, non-payment, or extended inactivity</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-2">Upon termination:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Your access to the Services ends immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We will delete your Google OAuth tokens and cached review data within 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Provisions that by their nature should survive (IP, liability, indemnification) will continue to apply</span>
                </li>
              </ul>
            </div>

            {/* Changes to These Terms */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="RefreshCw" className="w-5 h-5 text-primary" />
                13. Changes to These Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may update these Terms from time to time. We will post changes here and update the "Last Updated" date. For material changes, we may notify you via email or dashboard notice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Continued use of the Services after changes constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Governing Law and Disputes */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Scale" className="w-5 h-5 text-primary" />
                14. Governing Law and Disputes
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms are governed by the laws of the specific area, without regard to conflict of law principles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or the Services shall be resolved in the courts. You and Mohsin Designs agree to first attempt to resolve disputes informally by contacting us at{' '}
                <a href="mailto:info@mohsindesigns.com" className="text-primary hover:underline">info@mohsindesigns.com</a>{' '}
                before pursuing legal action.
              </p>
            </div>

            {/* Miscellaneous */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ListChecks" className="w-5 h-5 text-primary" />
                15. Miscellaneous
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Entire Agreement:</span> these Terms (with our Privacy Policy) constitute the full agreement between you and us</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Severability:</span> if any provision is found unenforceable, the remaining provisions remain in effect</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">No Waiver:</span> our failure to enforce any right or provision is not a waiver of that right</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Assignment:</span> you may not assign these Terms; we may assign them in connection with a merger or sale of the business</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Force Majeure:</span> neither party is liable for delays caused by events beyond reasonable control (natural disasters, government actions, infrastructure failures)</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/10 rounded-2xl border border-primary/30 p-6 md:p-8 text-center">
              <Icon name="Mail" className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                Questions about these Terms? Contact us:
              </p>
              <a
                href="mailto:info@mohsindesigns.com"
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                info@mohsindesigns.com
                <Icon name="ArrowRight" className="w-4 h-4" />
              </a>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground/60 pt-8">
              © {new Date().getFullYear()} Mohsin Designs. All rights reserved.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
