// app/privacy/page.tsx or src/app/privacy/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-6">
              <Icon name="Shield" className="w-4 h-4 text-primary" />
              <span className="text-primary uppercase tracking-wider text-xs font-semibold">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                <Icon name="Lock" className="w-5 h-5 text-primary" />
                Our Commitment to Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Eagle Revolution takes the security and privacy of your personal information extremely seriously. We will not trade, sell, or rent your personally identifiable information. For an overview of our privacy practices, please read below.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are strongly devoted to defending the privacy of your personal information. We have established this Privacy Policy to inform you of the type of personal information we may collect throughout your visit to our Website, why we collect your information, what we use your personal information for, when we may provide your personal information, and how you can control your personal information.
              </p>
            </div>

            {/* Acceptance of Terms */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Acceptance of This Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By visiting our Website, you are complying with the practices expressed in our Privacy Policy. If you do not concur with the terms of this Privacy Policy, please do not use the Website. We may, from time to time, revise this privacy policy, and the date of the last revision will be available at the bottom of this page.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using the Services, you are acknowledging and accepting this Privacy Policy. Your continued use of the Services after changes have been posted to the Privacy Policy will constitute your acceptance of such changes.
              </p>
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Questions?</span> If you have any inquiries about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:info@eaglerevolution.com" className="text-primary hover:underline">info@eaglerevolution.com</a>
                </p>
              </div>
            </div>

            {/* Information Collection */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">What Information Is Collected and Stored?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Eagle Revolution adheres to the uppermost standards of ethical practices in all of our processes and is devoted to protecting the privacy of all users of our Website. Our privacy policy is straightforward: Except as revealed below, we don't sell, barter, deliver or rent your personal information to any organization or individual external of Eagle Revolution.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We accumulate and store information that you enter into this Website or that you supply through our Customer Service Department. For instance, when you create an account or place an order, we accumulate and store some or all of the subsequent information that you supply: name, billing address, shipping address, email address, telephone number, credit card number, and expiration date.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This information is used to make available the products and services that you have ordered or requested, to process and ship orders, to mail order and shipping confirmations, and to supply customer service.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Anonymous Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                During your use of the Website, we may possibly collect certain information that does not recognize you independently ("Anonymous Information"). Usually, this information is gathered from "traffic data". We accumulate and store certain other information repeatedly whenever you interact with this Website, including your IP address, browser information, and reference site domain name.
              </p>
            </div>

            {/* Cookies */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Use of Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We in no way apply or install spyware on your computer, nor do we utilize spyware to recover information from your computer. In addition, like several Websites, we apply "cookies", which are records stored on your computer's hard drive by your browser.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cookies allow us to recognize account owners and optimize their shopping experience. The majority of browsers recognize cookies by design but allow you to stop them. We advise that you keep cookies "turned on" so that we are able to provide you with a user-friendly online experience on this Website.
              </p>
            </div>

            {/* Newsletter */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Our Newsletter & Email List</h2>
              <p className="text-muted-foreground leading-relaxed">
                We gather e-mail addresses and zip codes of all consumers who subscribe to our newsletter. Not including our third-party representatives, this information is not publicized with any third parties for any reason. Any person who does not want to obtain this newsletter can, at any time, follow the "Unsubscribe" directions contained in every newsletter.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Information Collected From Children</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell or ship anything ordered from this Website directly to anyone who we know to be under the age of 13, nor do we collect any personal information from a person who we identify to be under 13 years old. If you are under the age of 13, you ought to utilize this Website only with the participation of a parent or guardian and must not surrender any personal information to us.
              </p>
            </div>

            {/* SMS Disclosure */}
            <div className="bg-gradient-to-r from-primary/5 via-card to-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" className="w-5 h-5 text-primary" />
                SMS Disclosure
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Consent is not a condition of purchase. Message frequency varies. Message & data rates may apply.</p>
                <p>You can opt out at any time by replying STOP or reply HELP for more info.</p>
                <p>By clicking "Submit," I agree with Eagle Revolution Terms of Service.</p>
                <p className="text-sm">Reply STOP to stop receiving messages from us. Reply HELP for more information.</p>
                <p className="text-sm">You will receive no further messages from us. If this was an error reply UNSTOP to continue receiving messages.</p>
              </div>
            </div>

            {/* Opt-Out */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Opt-Out and Correction Procedures</h2>
              <p className="text-muted-foreground leading-relaxed">
                You can at any time opt-out of getting potential e-mails and newsletters. We offer you the option to opt out of getting communications from us at the point where we ask for information concerning you. When you initiate an account or place an order, you will have an opportunity to make your selections in this regard. You also will have an opportunity to change these selections by following the "unsubscribe" instructions contained in the promotional emails we send you.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                As our Website keeps developing, we possibly will add new services and features to our Website. On the occasion that these added extras influence our Privacy Policy, this manuscript will be revised aptly. We will place those revisions significantly so that you will constantly identify what information we collect, how we could apply that information, and whether we will reveal it.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/10 rounded-2xl border border-primary/30 p-6 md:p-8 text-center">
              <Icon name="Mail" className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Have More Questions?</h2>
              <p className="text-muted-foreground mb-4">
                Questions regarding this Privacy Policy should be directed to our Customer Service.
              </p>
              <a 
                href="mailto:info@eaglerevolution.com" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                info@eaglerevolution.com
                <Icon name="ArrowRight" className="w-4 h-4" />
              </a>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-muted-foreground/60 pt-8">
              © {new Date().getFullYear()} Eagle Revolution. All rights reserved.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
