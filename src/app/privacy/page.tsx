// app/privacy/page.tsx or src/app/privacy/page.tsx
"use client";

import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { motion } from "framer-motion";
import { Icon } from "../../config/icons";

export default function PrivacyPolicyPage() {
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
              items={[{ name: "Home", url: "/" }, { name: "Privacy Policy", url: "/privacy/" }]}
            />
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-6">
              <Icon name="Shield" className="w-4 h-4 text-primary" />
              <span className="text-primary uppercase tracking-wider text-xs font-semibold">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Policy</span>
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
                Mohsin Designs ("we," "our," or "us") operates the website{' '}
                <a href="https://mohsindesigns.com" className="text-primary hover:underline">mohsindesigns.com</a>{' '}
                and provides web design, development, and reputation management services, including a Google reviews integration widget and a project-location-review SaaS platform (collectively, the "Services").
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Privacy Policy explains how we collect, use, store, share, and protect information when you visit our website, use our Services, or connect your Google Business Profile to our platform.
              </p>
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  By using our Services, you agree to the terms of this Privacy Policy.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Database" className="w-5 h-5 text-primary" />
                2. Information We Collect
              </h2>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.1 Information You Provide Directly</h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Contact information:</span> name, email address, phone number, business name when you contact us or sign up for our Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Account information:</span> login credentials and preferences for our dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Communications:</span> messages, support requests, and feedback you send us</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Payment information:</span> billing details for paid Services (processed by third-party payment providers; we do not store full card numbers)</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.2 Information from Google Services</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When you authorize our platform to access your Google Business Profile via Google OAuth 2.0, we receive:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Business Profile information:</span> business name, address, phone, category, hours, and website</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Reviews:</span> review text, reviewer display name, reviewer profile photo, star rating, publish date, and review responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Aggregate metrics:</span> total review count and average rating</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">OAuth refresh tokens:</span> stored encrypted to enable scheduled review fetching on your behalf</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We only access data within the scope you explicitly authorize during the Google consent flow. We do not modify your Business Profile, post on your behalf, or take any automated actions on your account.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.3 Information Collected Automatically</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Usage data:</span> pages visited, features used, timestamps, referring URLs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Device data:</span> browser type, operating system, IP address, screen resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Cookies and similar technologies:</span> see Section 8, Cookies and Tracking</span>
                </li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Settings" className="w-5 h-5 text-primary" />
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use collected information to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Provide, operate, and maintain the Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Display your authentic Google reviews on websites and dashboards you control or have authorized</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Refresh and cache your reviews on a scheduled basis (typically weekly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Communicate with you about your account, support requests, and Service updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Process payments and manage billing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Improve our Services and develop new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Detect, prevent, and address fraud, security issues, and abuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </div>

            {/* Google API Services User Data Policy */}
            <div className="bg-gradient-to-r from-primary/5 via-card to-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ShieldCheck" className="w-5 h-5 text-primary" />
                4. Google API Services User Data Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. Specifically:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We use Google user data only to provide the features you authorized — primarily displaying your Google Business Profile reviews on websites you control</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We do not use Google user data for serving advertisements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We do not allow humans to read Google user data unless we have obtained your explicit consent, it is required for security, to comply with applicable law, or for internal operations after data has been aggregated and anonymized</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We do not transfer Google user data to third parties except as necessary to provide the Services, comply with law, or as part of a merger or acquisition with continued privacy protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We do not sell Google user data</span>
                </li>
              </ul>
            </div>

            {/* How We Store and Protect Data */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Lock" className="w-5 h-5 text-primary" />
                5. How We Store and Protect Data
              </h2>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Data is stored on secure servers with industry-standard encryption (TLS in transit, AES-256 at rest where applicable)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Google OAuth refresh tokens are stored encrypted and accessed only by authorized server processes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Access to production data is restricted to authorized personnel under strict need-to-know basis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We maintain regular security reviews and follow best practices for vulnerability management</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                While we take reasonable measures to protect your information, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* Data Retention */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Clock" className="w-5 h-5 text-primary" />
                6. Data Retention
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Account data:</span> retained while your account is active and for up to 90 days after account closure for backup and dispute resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Google Business Profile data and reviews:</span> cached for the duration of your connection; deleted within 30 days of you disconnecting your Google account or closing your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">OAuth refresh tokens:</span> deleted immediately upon disconnection or revocation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Billing records:</span> retained as required by tax and accounting laws (typically 7 years)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Logs and analytics:</span> retained for up to 12 months</span>
                </li>
              </ul>
            </div>

            {/* Sharing Your Information */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Share2" className="w-5 h-5 text-primary" />
                7. Sharing Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We share data only in these circumstances:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Service providers:</span> trusted third parties who help us operate our Services (hosting, email delivery, payment processing, analytics) under confidentiality agreements</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Legal requirements:</span> when required by law, court order, or government request</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">Business transfers:</span> in connection with a merger, acquisition, or sale of assets, with continued privacy protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span><span className="font-medium text-foreground">With your consent:</span> when you explicitly authorize sharing</span>
                </li>
              </ul>
            </div>

            {/* Cookies and Tracking */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Cookie" className="w-5 h-5 text-primary" />
                8. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use cookies and similar technologies to:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Keep you signed in</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Remember your preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Measure how the Services are used</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Improve security</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. Disabling cookies may affect some Service functionality.
              </p>
            </div>

            {/* Your Rights and Choices */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="UserCheck" className="w-5 h-5 text-primary" />
                9. Your Rights and Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Access the personal information we hold about you</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Correct inaccurate information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Delete your account and associated data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Revoke Google access at any time from your Google Account permissions page. Once revoked, we will stop accessing your Google Business Profile and delete cached data within 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Export your data in a portable format</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Object to certain processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Withdraw consent for processing based on consent</span>
                </li>
              </ul>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  To exercise these rights, email us at{' '}
                  <a href="mailto:info@mohsindesigns.com" className="text-primary hover:underline">info@mohsindesigns.com</a>.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Baby" className="w-5 h-5 text-primary" />
                10. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us information, please contact us and we will delete it.
              </p>
            </div>

            {/* International Data Transfers */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Globe" className="w-5 h-5 text-primary" />
                11. International Data Transfers
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our servers may be located in many countries, including the United States and Singapore. By using our Services, you consent to the transfer of your information to these locations, which may have different data protection laws than your country.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ExternalLink" className="w-5 h-5 text-primary" />
                12. Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our Services integrate with third-party services including Google (Business Profile, OAuth). These services have their own privacy policies, which we encourage you to review:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We are not responsible for the privacy practices of third-party services.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="RefreshCw" className="w-5 h-5 text-primary" />
                13. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. For significant changes, we may also notify you by email.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of the Services after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/10 rounded-2xl border border-primary/30 p-6 md:p-8 text-center">
              <Icon name="Mail" className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us. We aim to respond to all inquiries within 7 business days.
              </p>
              <a
                href="mailto:info@mohsindesigns.com"
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                info@mohsindesigns.com
                <Icon name="ArrowRight" className="w-4 h-4" />
              </a>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-muted-foreground/60 pt-8">
              © {new Date().getFullYear()} Mohsin Designs. All rights reserved.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
