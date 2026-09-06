import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Member, ClassSession, WorkoutPlan, Payment } from '../types';

interface MemberPortalPageProps {
  onOpenInvoice: (invoiceNumber: string) => void;
}

export const MemberPortalPage: React.FC<MemberPortalPageProps> = ({ onOpenInvoice }) => {
  const { user, gym } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [myClasses, setMyClasses] = useState<ClassSession[]>([]);
  const [myWorkouts, setMyWorkouts] = useState<WorkoutPlan[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemberData = async () => {
      setLoading(true);
      try {
        const [memRes, classRes, workRes, payRes] = await Promise.all([
          api.getMembers(),
          api.getClasses(),
          api.getWorkouts(),
          api.getPayments(),
        ]);

        // Find current member
        const found =
          memRes.data?.find((m: Member) => m.userId === user?._id || m.email === user?.email) ||
          memRes.data?.[0];

        setMember(found || null);

        if (found) {
          // Generate QR code for this member's ID
          const qr = await QRCode.toDataURL(found.memberId, {
            width: 260,
            margin: 2,
            color: {
              dark: '#0b1326',
              light: '#ffffff',
            },
          });
          setQrDataUrl(qr);

          // Filter member's sessions
          const enrolled = (classRes.data || []).filter((c: ClassSession) =>
            c.enrolledMemberIds?.includes(found._id) || c.enrolledMemberIds?.includes(user?._id || '')
          );
          setMyClasses(enrolled);

          // Filter member's workouts
          const workouts = (workRes.data || []).filter(
            (w: WorkoutPlan) => w.memberId === found._id
          );
          setMyWorkouts(workouts);

          // Filter payments
          const payments = (payRes.data || []).filter(
            (p: Payment) => p.memberId === found._id
          );
          setMyPayments(payments);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7080a2] animate-pulse">
        Generating member security passport...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-5xl mx-auto text-[#dae2fd]">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121c35] to-[#0d162a] border border-[#202e52] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {member?.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-primary/50 shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 text-primary font-display font-bold text-xl sm:text-2xl flex items-center justify-center border border-primary/40 shrink-0">
              {member?.name?.[0] || 'M'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">{member?.name}</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                {member?.status || 'ACTIVE'}
              </span>
            </div>
            <div className="font-mono text-xs text-primary font-bold mt-0.5">
              ID: {member?.memberId}
            </div>
            <div className="text-xs text-[#7b8cae] mt-0.5">{gym?.name} • All-Access Pass</div>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 border-[#1c2743] pt-2 sm:pt-0">
          <div className="text-xs font-mono text-[#8a9bbd]">Days Remaining</div>
          <div className="text-xl sm:text-2xl font-display font-black text-white">
            {member?.daysRemaining !== undefined && member?.daysRemaining >= 0
              ? `${member.daysRemaining} Days`
              : 'Expired'}
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Passport QR Card + Member Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Digital Member ID Card (QR Pass) */}
        <div className="md:col-span-5 p-4 sm:p-6 rounded-3xl bg-[#0b1222] border-2 border-primary/40 shadow-2xl shadow-primary/10 text-center space-y-4 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-[#1b2746] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl font-bold">bolt</span>
              <span className="font-display font-black tracking-wider text-white text-sm">
                FITCORE PASS
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE UNLOCKED</span>
          </div>

          <div className="p-3 sm:p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto max-w-full">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Member QR Code" className="w-40 h-40 sm:w-52 sm:h-52 mx-auto max-w-full" />
            ) : (
              <div className="w-40 h-40 sm:w-52 sm:h-52 bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-mono">
                Generating Code...
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="font-mono text-sm font-bold text-white tracking-widest uppercase">
              {member?.memberId}
            </div>
            <p className="text-[11px] text-[#7888ab]">
              Hold this barcode against any optical turnstile reader to unlock access.
            </p>
          </div>

          <div className="pt-3 border-t border-[#17233f] flex items-center justify-around text-xs text-[#8090b4]">
            <div>
              <div className="font-bold text-white">{member?.weightKg || 62} kg</div>
              <div className="text-[10px]">Weight</div>
            </div>
            <div className="w-px h-6 bg-[#1f2d4e]" />
            <div>
              <div className="font-bold text-white">{member?.bodyFatPercentage || 19.5}%</div>
              <div className="text-[10px]">Body Fat</div>
            </div>
            <div className="w-px h-6 bg-[#1f2d4e]" />
            <div>
              <div className="font-bold text-primary">{member?.attendanceRate || 88}%</div>
              <div className="text-[10px]">Attendance</div>
            </div>
          </div>
        </div>

        {/* Right Side: My Sessions, Routines, and Billing Receipts */}
        <div className="md:col-span-7 space-y-6">
          {/* My Booked Sessions */}
          <div className="p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2746]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                <h3 className="font-display font-bold text-base text-white">My Enrolled Classes</h3>
              </div>
              <span className="text-xs text-[#7585a7]">{myClasses.length} Booked</span>
            </div>

            {myClasses.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6e7e9f]">
                You have not booked any classes today. Head to the Class Schedule tab to reserve your
                spot.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myClasses.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-2xl bg-[#121c35] border border-[#1e2c4f] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-display font-bold text-sm text-white">{c.name}</div>
                      <div className="text-[11px] text-[#7e8eb2] mt-0.5">
                        {c.startTime} - {c.endTime} • {c.room} • Coach {c.trainerName}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Assigned Workout Routine */}
          <div className="p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2746]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">fitness_center</span>
                <h3 className="font-display font-bold text-base text-white">
                  My Prescribed Workout Routine
                </h3>
              </div>
              <span className="text-xs text-[#7585a7]">
                {myWorkouts[0]?.exercises?.length || 0} Movements
              </span>
            </div>

            {myWorkouts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6e7e9f]">
                No custom routine prescribed yet. Ask your coach to assign one.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white">
                  {myWorkouts[0]?.name}{' '}
                  <span className="text-[#7888aa] font-normal">• {myWorkouts[0]?.goal}</span>
                </div>

                <div className="space-y-2">
                  {myWorkouts[0]?.exercises?.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3 rounded-xl bg-[#121c35] border border-[#1d2b4b] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{ex.name}</span>
                      </div>
                      <div className="font-mono text-[#a5b5d8]">
                        {ex.sets} sets × {ex.reps} reps {ex.weightKg ? `(${ex.weightKg}kg)` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Invoices & Receipts */}
          <div className="p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2746]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">receipt</span>
                <h3 className="font-display font-bold text-base text-white">
                  My Payment Invoices
                </h3>
              </div>
            </div>

            {myPayments.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6e7e9f]">
                No invoices recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {myPayments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl bg-[#121c35] border border-[#1e2c4f] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">{p.invoiceNumber}</div>
                      <div className="text-[10px] text-[#7e8eb2]">
                        {p.paymentDate} • {p.paymentMethod}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400">
                        {gym?.currency || '₹'}
                        {p.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onOpenInvoice(p.invoiceNumber)}
                        className="px-2.5 py-1 rounded-lg bg-[#192747] hover:bg-[#203157] text-primary text-[11px] font-semibold transition"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
