import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MembershipPlan, Trainer } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '1995-01-01',
    address: '',
    emergencyContact: '',
    planId: '',
    assignedTrainerId: '',
    weightKg: 72,
    heightCm: 176,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      api.getPlans().then((res) => {
        setPlans(res.data || []);
        if (res.data?.[0]) {
          setFormData((prev) => ({ ...prev, planId: res.data[0]._id }));
        }
      });
      api.getTrainers().then((res) => {
        setTrainers(res.data || []);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Name, email, and phone are required.');
      return;
    }

    setLoading(true);
    try {
      await api.createMember(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to register member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0e162b] border border-[#233154] rounded-2xl shadow-2xl p-6 text-[#dae2fd] my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2744]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
            <h2 className="font-display font-extrabold text-lg text-white">Enroll New Member</h2>
          </div>
          <button onClick={onClose} className="text-[#6f7e9f] hover:text-white p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jessica Sterling"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white placeholder-[#536183] focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="jessica@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white placeholder-[#536183] focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 019-4821"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white placeholder-[#536183] focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Membership Tier</label>
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
              >
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (₹{p.price.toLocaleString()} • {p.durationMonths} mo)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Assigned Coach</label>
              <select
                value={formData.assignedTrainerId}
                onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="">-- No Coach Assigned --</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.specialization.split('&')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Emergency Contact</label>
            <input
              type="text"
              placeholder="e.g. John Sterling (+1 555-019-4822)"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white placeholder-[#536183] focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Facility Notes</label>
            <textarea
              rows={2}
              placeholder="Fitness targets, medical clearance, turnstile preferences..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white placeholder-[#536183] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-3 border-t border-[#1c2744] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#808fae] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? 'Creating Member...' : 'Enroll Member & Issue ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
