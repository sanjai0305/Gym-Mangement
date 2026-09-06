import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MembershipPlan } from '../types';

export const SettingsPage: React.FC = () => {
  const { gym, refreshUser } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    openingHours: '',
    currency: '₹',
    timezone: 'Asia/Kolkata',
  });

  // New Plan form state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: 'Weekend Warrior Pass',
    description: 'Access exclusively on Friday evening, Saturday & Sunday.',
    price: 3999,
    durationMonths: 1,
    features: ['Weekend Floor Access', 'Steam & Sauna', '1 Guest Pass'],
    maxClasses: 4,
  });

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name || '',
        email: gym.email || '',
        phone: gym.phone || '',
        whatsapp: gym.whatsapp || '',
        address: gym.address || '',
        openingHours: gym.openingHours || '',
        currency: gym.currency || '₹',
        timezone: gym.timezone || 'Asia/Kolkata',
      });
    }

    api.getPlans().then((res) => setPlans(res.data || []));
  }, [gym]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateGymSettings(form);
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan(newPlan);
      setShowPlanModal(false);
      const res = await api.getPlans();
      setPlans(res.data || []);
    } catch (e: any) {
      alert(e.message || 'Failed to create plan');
    }
  };

  const handleResetDemo = async () => {
    if (
      !confirm(
        'Reset sandbox database to fresh seed state? All mock data will be restored to initial defaults.'
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      await api.resetDemoData();
      alert('Demo data successfully reset to initial defaults.');
      window.location.reload();
    } catch (e: any) {
      alert(e.message || 'Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto text-[#dae2fd]">
      {/* Facility Profile Form */}
      <div className="p-8 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-6">
        <div className="pb-4 border-b border-[#1b2746] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Facility Configuration & Branding
            </h3>
            <p className="text-xs text-[#7c8cae]">
              Manage public identifiers, turnstile timezone, and receipt formatting.
            </p>
          </div>

          {saveSuccess && (
            <span className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                Gym / Facility Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                Receipt Currency Symbol
              </label>
              <input
                type="text"
                required
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                Billing & Support Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                Desk Telephone
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                WhatsApp Churn Alert Number
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
              Physical Facility Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#213054] text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Membership Plans Tiers Manager */}
      <div className="p-8 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-6">
        <div className="pb-4 border-b border-[#1b2746] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Membership Plans & Tiers</h3>
            <p className="text-xs text-[#7c8cae]">
              Configure pricing, durations, and access privileges for new enrollments.
            </p>
          </div>

          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162343] hover:bg-[#1f305a] border border-[#263762] text-xs font-semibold text-white transition"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Tier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p._id}
              className="p-5 rounded-2xl bg-[#121c35] border border-[#1e2d4e] flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="font-display font-bold text-sm text-white">{p.name}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
                    {p.durationMonths} MO
                  </span>
                </div>
                <div className="text-xl font-display font-extrabold text-white mt-2">
                  {form.currency}
                  {p.price.toLocaleString()}
                </div>
                <p className="text-xs text-[#8090b4] mt-1">{p.description}</p>
                <div className="space-y-1.5 pt-3 text-[11px] text-[#a0b0d3]">
                  {p.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-primary">check</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger / Demo Reset Zone */}
      <div className="p-8 rounded-3xl bg-[#181124] border border-rose-500/30 space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-rose-300">
            Database Sandbox & Demo Reset
          </h3>
          <p className="text-xs text-[#a08fae] mt-1">
            Need to clear custom records and restore original seed members, classes, and revenue
            telemetry? You can trigger a factory reset at any time.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          <span>{resetting ? 'Resetting Sandbox...' : 'Reset Sandbox to Default Data'}</span>
        </button>
      </div>

      {/* Add Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e162b] border border-[#233154] rounded-2xl p-6 shadow-2xl space-y-4 text-[#dae2fd]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2744]">
              <h3 className="font-display font-bold text-base text-white">Create Membership Tier</h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-[#6e7d9f] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">Tier Name</label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                    Price ({form.currency})
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.durationMonths}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, durationMonths: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-[#7e8eb2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-[#0b1326] font-display font-bold text-xs hover:brightness-110"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
