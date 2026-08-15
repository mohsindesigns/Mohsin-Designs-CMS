// app/terms/page.tsx or src/app/terms/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-6">
              <Icon name="FileText" className="w-4 h-4 text-primary" />
              <span className="text-primary uppercase tracking-wider text-xs font-semibold">Legal</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Conditions</span>
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
                <Icon name="Info" className="w-5 h-5 text-primary" />
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Eagle Revolution. By accessing or using our website, services, or products, you agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Eagle Revolution provides both <span className="text-primary font-medium">roofing and exterior remodeling services</span> (primary business) and <span className="text-primary font-medium">branded merchandise</span> (secondary business). These Terms apply to both our services and products.
              </p>
            </div>

            {/* Roofing Services */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Home" className="w-5 h-5 text-primary" />
                2. Roofing & Exterior Services
              </h2>
              
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.1 Service Estimates</h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>All estimates are valid for 30 days from the date provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Final pricing may vary based on actual job conditions discovered during work</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>A written contract will be provided before any work begins</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.2 Payment Terms</h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>A deposit may be required before work commences</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Final payment is due upon completion of work</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Accepted payment methods: Cash, Check, Credit Card, Financing (if available)</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.3 Warranties</h3>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Workmanship warranty details are specified in your service contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Material warranties are provided by the manufacturer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Warranty claims must be reported in writing within the warranty period</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.4 Cancellation & Refunds</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>You may cancel services within 3 business days of signing the contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Cancellation after materials have been ordered may incur restocking fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Completed work is non-refundable</span>
                </li>
              </ul>
            </div>

            {/* Merchandise */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ShoppingBag" className="w-5 h-5 text-primary" />
                3. Branded Merchandise
              </h2>
              
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.1 Made-to-Order Products</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All merchandise (hoodies, tees, hats, bags, etc.) is made-to-order. Each item is custom crafted specifically for you upon purchase.
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Product images are for illustration purposes; actual products may vary slightly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Please allow 7-14 business days for production and shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>For fastest turnaround, order by Sunday at 11:59 PM</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.2 Returns & Refunds</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-primary font-semibold text-sm flex items-center gap-2">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  Important Notice
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  All sales are final due to the made-to-order nature of our products. This ensures each item is crafted specifically for you.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Exceptions may be made for defective or damaged products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Defective items must be reported within 7 days with photo evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Refunds for approved defects will be processed within 7-10 business days</span>
                </li>
              </ul>
            </div>

            {/* Orders & Payment */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="CreditCard" className="w-5 h-5 text-primary" />
                4. Orders & Payment
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Payment is due at the time of order for merchandise</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We accept major credit cards and other payment methods as provided by our payment processor</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Order confirmation will be sent via email after purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>We reserve the right to refuse or cancel any order for any reason</span>
                </li>
              </ul>
            </div>

            {/* Shipping */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Truck" className="w-5 h-5 text-primary" />
                5. Shipping & Delivery
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Tracking information will be provided once your order ships</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Eagle Revolution is not responsible for delays caused by carriers or customs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Shipping costs are calculated at checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>Risk of loss passes to you upon delivery to the carrier</span>
                </li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Copyright" className="w-5 h-5 text-primary" />
                6. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Eagle Revolution and is protected by United States copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Shield" className="w-5 h-5 text-primary" />
                7. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Eagle Revolution shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website, services, or products. Our total liability shall not exceed the amount you paid to us.
              </p>
            </div>

            {/* Governing Law */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Globe" className="w-5 h-5 text-primary" />
                8. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States. Any legal action arising out of these Terms shall be brought exclusively in the courts located in the United States.
              </p>
            </div>

            {/* SMS Terms */}
            <div className="bg-gradient-to-r from-primary/5 via-card to-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" className="w-5 h-5 text-primary" />
                9. SMS/Text Messaging Terms
              </h2>
              <div className="space-y-3 text-muted-foreground text-sm">
                <p>By providing your phone number, you consent to receive SMS messages from Eagle Revolution regarding:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                    <span>Service updates and appointment reminders (roofing customers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                    <span>Order confirmations and shipping updates (merchandise customers)</span>
                  </li>
                </ul>
                <p className="mt-3">Message frequency varies. Message and data rates may apply.</p>
                <p>Reply <span className="text-primary font-semibold">STOP</span> to opt out at any time. Reply <span className="text-primary font-semibold">HELP</span> for assistance.</p>
                <p className="text-xs text-muted-foreground/70 mt-2">Consent is not a condition of purchase for any products or services.</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-primary/10 via-card to-primary/10 rounded-2xl border border-primary/30 p-6 md:p-8 text-center">
              <Icon name="Mail" className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <a 
                href="mailto:info@eaglerevolution.com" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                info@eaglerevolution.com
                <Icon name="ArrowRight" className="w-4 h-4" />
              </a>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground/60 pt-8">
              © {new Date().getFullYear()} Eagle Revolution. All rights reserved.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
