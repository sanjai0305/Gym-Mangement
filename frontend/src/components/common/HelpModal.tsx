import React from 'react';
import { X, HelpCircle, BookOpen, Key, ShieldCheck, Mail, Sparkles, Terminal } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e172e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090f20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">FITCORE SaaS Support & Guide</h2>
              <p className="text-xs text-slate-400">Documentation, quick actions, and demo credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Quick Demo Credentials */}
          <div className="bg-[#14203d] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs tracking-wider uppercase mb-3">
              <Key className="w-4 h-4" /> Multi-Tenant Role Switcher
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0a1024] border border-slate-800/80">
                <span className="font-semibold text-white block">Owner / Admin:</span>
                <code className="text-slate-400">owner@fitcore.com</code> / <code className="text-emerald-400">password123</code>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1024] border border-slate-800/80">
                <span className="font-semibold text-white block">Receptionist:</span>
                <code className="text-slate-400">reception@fitcore.com</code> / <code className="text-emerald-400">password123</code>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1024] border border-slate-800/80">
                <span className="font-semibold text-white block">Coach / Trainer:</span>
                <code className="text-slate-400">trainer@fitcore.com</code> / <code className="text-emerald-400">password123</code>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1024] border border-slate-800/80">
                <span className="font-semibold text-white block">Member Portal:</span>
                <code className="text-slate-400">member@fitcore.com</code> / <code className="text-emerald-400">password123</code>
              </div>
            </div>
          </div>

          {/* Core Feature Tour */}
          <div className="space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Platform Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0a1024] border border-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Turnstile & Optical Badging</div>
                <p className="text-slate-400">Live QR code scanning with turnstile gate telemetry and attendance tracking.</p>
              </div>
              <div className="p-3 bg-[#0a1024] border border-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Financial Invoicing & P&L</div>
                <p className="text-slate-400">Generate commercial tax invoices, log operational overhead, and track margin.</p>
              </div>
              <div className="p-3 bg-[#0a1024] border border-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Workout Prescriptions</div>
                <p className="text-slate-400">Assign structured multi-day lifting protocols with tempo cues and target reps.</p>
              </div>
              <div className="p-3 bg-[#0a1024] border border-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Class Timetables</div>
                <p className="text-slate-400">Manage studio capacities, athlete enrollments, waitlists, and check-in marks.</p>
              </div>
            </div>
          </div>

          {/* Serverless & Multi-Tenancy */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-300 mb-0.5">Enterprise Security & Isolation</div>
              All data access is cryptographically authenticated via JWT with strict tenant isolation enforced by <code className="bg-emerald-900/40 px-1 py-0.5 rounded">gymId</code> on all queries.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-[#090f20] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>FITCORE Cloud Engine v2.4.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#070e1e] font-semibold rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
