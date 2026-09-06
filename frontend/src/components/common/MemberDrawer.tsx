import React, { useState } from 'react';
import { Member } from '../../types';
import { api } from '../../services/api';

interface MemberDrawerProps {
  member: Member | null;
  onClose: () => void;
  onMemberUpdated: () => void;
  onViewWorkouts?: (memberId: string) => void;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  member,
  onClose,
  onMemberUpdated,
  onViewWorkouts,
}) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('Medical recovery');

  if (!member) return null;

  const handleFreeze = async () => {
    setLoadingAction(true);
    try {
      await api.freezeMember(member._id, freezeReason);
      setFeedbackMessage(`Membership frozen for ${member.name}.`);
      setShowFreezeModal(false);
      onMemberUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to freeze membership');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRenew = async () => {
    if (!confirm(`Renew membership for ${member.name} under current plan?`)) return;
    setLoadingAction(true);
    try {
      // Use planId if existing, or default basic plan
      await api.renewMembership(member._id, member.planId || 'plan-premium-annual');
      setFeedbackMessage(`Membership renewed successfully for ${member.name}!`);
      onMemberUpdated();
    } catch (e: any) {
      alert(e.message || 'Renewal failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'EXPIRED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'FROZEN':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div
        id="member-detail-drawer"
        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0e162b] border-l border-[#202c4b] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 text-[#dae2fd]"
      >
        {/* Drawer Header */}
        <div>
          <div className="p-6 border-b border-[#1c2744] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">badge</span>
              <h2 className="font-display font-extrabold text-base text-white">Member Dossier</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7382a5] hover:text-white hover:bg-[#18233e] transition"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {feedbackMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Profile Overview */}
          <div className="p-6 border-b border-[#1c2744]">
            <div className="flex items-center gap-4 mb-4">
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/40 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 text-primary font-display font-bold text-2xl flex items-center justify-center border border-primary/40">
                  {member.name[0]}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-lg text-white">{member.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${getStatusColor(
                      member.status
                    )}`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-primary font-medium tracking-wide">
                  {member.memberId}
                </div>
                <div className="text-xs text-[#808fae] capitalize mt-0.5">
                  Joined: {new Date(member.joiningDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141e37] border border-[#212f53] text-xs text-[#b8c6e8] hover:text-white transition"
              >
                <span className="material-symbols-outlined text-sm text-primary">mail</span>
                <span className="truncate">{member.email}</span>
              </a>
              <a
                href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141e37] border border-[#212f53] text-xs text-[#b8c6e8] hover:text-white transition"
              >
                <span className="material-symbols-outlined text-sm text-emerald-400">chat</span>
                <span className="truncate">{member.phone}</span>
              </a>
            </div>
          </div>

          {/* Biometrics & Telemetry */}
          <div className="p-6 border-b border-[#1c2744]">
            <h4 className="text-xs uppercase font-semibold text-[#6e7d9e] tracking-wider mb-3">
              Biometrics & Attendance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#121b33] border border-[#1e2a4a]">
                <div className="text-[11px] text-[#7b8aa9]">Weight</div>
                <div className="text-base font-display font-bold text-white mt-0.5">
                  {member.weightKg || 62.0} <span className="text-xs font-normal text-[#8695b7]">kg</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121b33] border border-[#1e2a4a]">
                <div className="text-[11px] text-[#7b8aa9]">Body Fat</div>
                <div className="text-base font-display font-bold text-white mt-0.5">
                  {member.bodyFatPercentage || 19.5} <span className="text-xs font-normal text-[#8695b7]">%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121b33] border border-[#1e2a4a]">
                <div className="text-[11px] text-[#7b8aa9]">Attendance Rate</div>
                <div className="text-base font-display font-bold text-primary mt-0.5">
                  {member.attendanceRate || 88}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121b33] border border-[#1e2a4a]">
                <div className="text-[11px] text-[#7b8aa9]">Total Visits</div>
                <div className="text-base font-display font-bold text-white mt-0.5">
                  {member.visitsCount || 42}{' '}
                  <span className="text-xs font-normal text-[#8695b7]">sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Plan & Validity */}
          <div className="p-6 border-b border-[#1c2744]">
            <h4 className="text-xs uppercase font-semibold text-[#6e7d9e] tracking-wider mb-3">
              Active Membership
            </h4>
            <div className="p-4 rounded-xl bg-[#141f3b] border border-[#233156] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-white">{member.planName}</div>
                  <div className="text-xs text-[#8d9cbe]">Dedicated Facility Tier</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-primary">
                    {member.daysRemaining !== undefined && member.daysRemaining >= 0
                      ? `${member.daysRemaining} days left`
                      : 'Expired'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#0a1020] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#a3e635] rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(((member.daysRemaining || 0) / 365) * 100, 5),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-[#7f8dae]">
                <span>Assigned Coach:</span>
                <span className="font-semibold text-white">{member.trainerName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="p-6">
              <h4 className="text-xs uppercase font-semibold text-[#6e7d9e] tracking-wider mb-2">
                Trainer & Front Desk Notes
              </h4>
              <p className="text-xs text-[#9eb0d6] bg-[#121c35] p-3 rounded-xl border border-[#212d4d] leading-relaxed">
                {member.notes}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="p-6 border-t border-[#1c2744] bg-[#091022] flex items-center gap-3">
          <button
            id="btn-drawer-renew"
            onClick={handleRenew}
            disabled={loadingAction}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] hover:brightness-110 text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/20 transition active:scale-95 disabled:opacity-50"
          >
            Renew Plan
          </button>

          <button
            id="btn-drawer-freeze"
            onClick={() => setShowFreezeModal(true)}
            disabled={loadingAction || member.status === 'FROZEN'}
            className="py-2.5 px-4 rounded-xl bg-[#16213d] hover:bg-[#1d2b4f] border border-[#26355b] text-xs font-semibold text-[#bcc9eb] transition disabled:opacity-50"
          >
            {member.status === 'FROZEN' ? 'Frozen' : 'Freeze'}
          </button>

          {onViewWorkouts && (
            <button
              id="btn-drawer-workouts"
              onClick={() => onViewWorkouts(member._id)}
              className="p-2.5 rounded-xl bg-[#16213d] hover:bg-[#1d2b4f] border border-[#26355b] text-primary transition"
              title="View Workout Plan"
            >
              <span className="material-symbols-outlined text-lg">fitness_center</span>
            </button>
          )}
        </div>
      </div>

      {/* Freeze Confirmation Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#11192e] border border-[#263456] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">Freeze Membership</h3>
            <p className="text-xs text-[#8f9ebf]">
              Freezing will temporarily suspend facility turnstile access for {member.name}.
            </p>
            <div>
              <label className="text-xs text-[#8292b3] block mb-1">Reason for freeze</label>
              <input
                type="text"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0b1224] border border-[#222f51] text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFreezeModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-[#8190b2] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFreeze}
                disabled={loadingAction}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Confirm Freeze
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
