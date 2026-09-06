import React, { useState } from 'react';
import { api } from '../services/api';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenSignIn,
  onOpenRegister,
}) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    gymName: '',
    email: '',
    phone: '',
    subject: 'Request Enterprise Demo',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendContactMessage(contactForm);
      setContactSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1e] text-[#dae2fd] selection:bg-primary selection:text-[#0b1326]">
      {/* Navigation Bar */}
      <nav className="h-16 sm:h-20 border-b border-[#18233e] bg-[#070e1e]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-[#a3e635] flex items-center justify-center text-[#0b1326] font-extrabold shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">bolt</span>
          </div>
          <div>
            <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white">FITCORE</span>
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
              SAAS
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#9ab0d9]">
          <a href="#features" className="hover:text-white transition">
            Platform Capabilities
          </a>
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
          <a href="#contact" className="hover:text-white transition">
            Book Demo
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSignIn}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#15223e] border border-[#23335b] transition min-h-[38px]"
          >
            Sign In
          </button>
          <button
            onClick={onEnterApp}
            className="px-3 sm:px-4 py-2 rounded-xl bg-primary text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition active:scale-95 min-h-[38px] whitespace-nowrap"
          >
            Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 px-4 sm:px-6 md:px-12 overflow-hidden border-b border-[#17233f]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#15223e15_1px,transparent_1px),linear-gradient(to_bottom,#15223e15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14213d] border border-primary/30 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Next-Gen Multi-Tenant Gym Architecture</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-6xl text-white tracking-tight leading-[1.15]">
            The Precision Operating System <br />
            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#84cc16]">High-Performance Gyms</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#91a3cb] leading-relaxed">
            Eliminate revenue leakage, automate turnstile biometric check-ins, manage class rosters, and provide members with elite digital passports — all in one unified, multi-tenant cloud platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-sm shadow-xl shadow-primary/20 hover:brightness-110 transition transform active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Explore Live Dashboard</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#121d37] hover:bg-[#1a284c] border border-[#24355d] text-white font-semibold text-sm transition min-h-[44px]"
            >
              Create New Gym Facility
            </button>
          </div>

          {/* Metric highlights preview */}
          <div className="pt-8 sm:pt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1931] border border-[#1d2a4a] text-left">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-white">99.8%</div>
              <div className="text-[11px] sm:text-xs text-[#7e8eb2] mt-1">Turnstile Uptime SLA</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1931] border border-[#1d2a4a] text-left">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-primary">&lt; 200ms</div>
              <div className="text-[11px] sm:text-xs text-[#7e8eb2] mt-1">QR Verification</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1931] border border-[#1d2a4a] text-left">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-white">100%</div>
              <div className="text-[11px] sm:text-xs text-[#7e8eb2] mt-1">Data Isolation</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1931] border border-[#1d2a4a] text-left">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-emerald-400">Zero</div>
              <div className="text-[11px] sm:text-xs text-[#7e8eb2] mt-1">Unpaid Leaks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
            End-To-End Infrastructure
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
            Engineered for High-Throughput Facilities
          </h2>
          <p className="text-xs md:text-sm text-[#8799c0]">
            From boutique CrossFit boxes to multi-level commercial athletic clubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Optical & QR Gate Access</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Real-time validation against active membership status. Instant denial of expired or frozen accounts prevents unbilled entry.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Automated Tax Invoicing</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Compliant tax receipts with itemized GST, transaction IDs, offline cash logging, UPI receipts, and 1-click printable PDF templates.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Class Rosters & Waitlists</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Auto-capped session capacities, automatic promotion from waitlists, and tablet-optimized roster check-in for instructors.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">fitness_center</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Personal Training & Workouts</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Trainers build sets, reps, and tempo guidance. Members track their custom routines directly on their mobile portal.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-400/15 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Granular Staff RBAC</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Segregated views for Owners, Operations Admins, Receptionists, Coaches, and Members. Sensitive financials remain strictly protected.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e172e] border border-[#1e2c4f] space-y-4 hover:border-primary/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-400/15 text-rose-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">Renewal Watchlist & P&L</h3>
            <p className="text-xs text-[#8c9ec3] leading-relaxed">
              Instant alerts 7 days before membership expiry. One-click WhatsApp renewal links recover churn before it happens.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 border-t border-[#17233f] bg-[#050b18]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
              Simple Transparent Licensing
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Built to Scale with Your Roster
            </h2>
            <p className="text-xs md:text-sm text-[#7e90b7]">
              Every plan includes unlimited staff accounts, cloud backups, and turnstile API connectivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-[#0c1428] border border-[#1e2c4f] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-display font-bold text-lg text-white">Starter Facility</div>
                <div className="text-xs text-[#8091b7]">Ideal for private training studios & boutique gyms.</div>
                <div className="pt-2">
                  <span className="text-3xl font-display font-extrabold text-white">₹3,499</span>
                  <span className="text-xs text-[#8091b7]"> / month</span>
                </div>
                <div className="space-y-2 pt-4 text-xs text-[#a0b0d3]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Up to 250 Active Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>QR Turnstile Access Point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Tax Invoicing & Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Class Timetable & Booking</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 rounded-xl bg-[#14203b] hover:bg-[#1b2b4e] border border-[#23335b] text-xs font-semibold text-white transition"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="p-8 rounded-3xl bg-[#101a33] border-2 border-primary/50 relative flex flex-col justify-between space-y-6 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-[#0b1326] text-[10px] font-mono font-extrabold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="font-display font-bold text-lg text-white">Performance Hub</div>
                <div className="text-xs text-[#8091b7]">Full-scale commercial gym facilities & clubs.</div>
                <div className="pt-2">
                  <span className="text-3xl font-display font-extrabold text-white">₹7,999</span>
                  <span className="text-xs text-[#8091b7]"> / month</span>
                </div>
                <div className="space-y-2 pt-4 text-xs text-[#b8c8ed]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Up to 1,500 Active Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Multi-Gate Turnstile Synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>WhatsApp Churn & Expiry Automation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Trainer Commission & Routine Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Full P&L Expense Tracking</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenRegister}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition active:scale-95"
              >
                Activate Performance Hub
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-[#0c1428] border border-[#1e2c4f] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-display font-bold text-lg text-white">Franchise & Chain</div>
                <div className="text-xs text-[#8091b7]">Multi-branch operators requiring centralized control.</div>
                <div className="pt-2">
                  <span className="text-3xl font-display font-extrabold text-white">₹16,499</span>
                  <span className="text-xs text-[#8091b7]"> / month</span>
                </div>
                <div className="space-y-2 pt-4 text-xs text-[#a0b0d3]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Unlimited Members & Branch Locations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Cross-Facility Universal Passes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Dedicated Solution Architect & 24/7 SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                    <span>Custom ERP / Hardware API Integrations</span>
                  </div>
                </div>
              </div>
              <a
                href="#contact"
                className="w-full py-2.5 rounded-xl bg-[#14203b] hover:bg-[#1b2b4e] border border-[#23335b] text-xs font-semibold text-white text-center block transition"
              >
                Contact Enterprise Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Demo Booking Form */}
      <section id="contact" className="py-24 px-6 md:px-12 border-t border-[#17233f]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
              Facility Inquiries
            </span>
            <h2 className="font-display font-extrabold text-3xl text-white">
              Upgrade Your Athletic Facility Today
            </h2>
            <p className="text-xs text-[#8a9bbd] leading-relaxed">
              Schedule a personal walkthrough with one of our gym infrastructure engineers. We’ll show you how to configure multi-gate turnstiles, migrate existing rosters, and eliminate membership leakage.
            </p>

            <div className="space-y-3 pt-2 text-xs text-[#b0c0e5]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <span>+1 (555) 019-2831 / support@fitcore.io</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span>Global Multi-Tenant Cloud Infrastructure</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 rounded-3xl bg-[#0d162a] border border-[#202e52] shadow-2xl">
            {contactSubmitted ? (
              <div className="p-4 sm:p-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">Inquiry Received!</h3>
                <p className="text-xs text-[#8d9ebf]">
                  A FITCORE enterprise specialist will contact you within 2 business hours.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="mt-4 px-4 py-2.5 rounded-xl bg-[#172340] text-xs text-white min-h-[40px]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#8092b7] block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Marcus Vance"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111c34] border border-[#202f52] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#8092b7] block mb-1">
                      Gym / Chain Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Titan Performance"
                      value={contactForm.gymName}
                      onChange={(e) => setContactForm({ ...contactForm, gymName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111c34] border border-[#202f52] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#8092b7] block mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@titangym.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111c34] border border-[#202f52] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#8092b7] block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111c34] border border-[#202f52] text-xs text-white focus:outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#8092b7] block mb-1">
                    Facility Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your member count, turnstile hardware, or branches..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111c34] border border-[#202f52] text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? 'Submitting...' : 'Request VIP Technical Demo'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-[#16213b] text-center text-xs text-[#637295] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© 2026 FITCORE Technologies Inc. Multi-tenant Gym Management Architecture.</div>
        <div className="flex items-center gap-6">
          <button onClick={onEnterApp} className="hover:text-primary transition">
            Launch Dashboard
          </button>
          <button onClick={onOpenSignIn} className="hover:text-primary transition">
            Staff Sign In
          </button>
        </div>
      </footer>
    </div>
  );
};
