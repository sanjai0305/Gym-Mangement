import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassSession, Member, Trainer } from '../types';

interface TrainerPortalPageProps {
  onSelectMember: (memberId: string) => void;
  onNavigate: (view: string) => void;
}

export const TrainerPortalPage: React.FC<TrainerPortalPageProps> = ({
  onSelectMember,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [trainerInfo, setTrainerInfo] = useState<Trainer | null>(null);
  const [coachingClasses, setCoachingClasses] = useState<ClassSession[]>([]);
  const [assignedClients, setAssignedClients] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerStation = async () => {
      setLoading(true);
      try {
        const [tRes, cRes, mRes] = await Promise.all([
          api.getTrainers(),
          api.getClasses(),
          api.getMembers(),
        ]);

        const trainer =
          tRes.data?.find((t: Trainer) => t.userId === user?._id || t.email === user?.email) ||
          tRes.data?.[0];
        setTrainerInfo(trainer || null);

        if (trainer) {
          const classes = (cRes.data || []).filter(
            (c: ClassSession) => c.trainerId === trainer._id || c.trainerName?.includes(trainer.name.split(' ')[0])
          );
          setCoachingClasses(classes);

          const clients = (mRes.data || []).filter(
            (m: Member) => m.assignedTrainerId === trainer._id || trainer.assignedMemberIds?.includes(m._id)
          );
          setAssignedClients(clients);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerStation();
  }, [user]);

  const handleToggleCheckIn = async (classId: string, memberId: string) => {
    try {
      await api.toggleCheckInClass(classId, memberId);
      const res = await api.getClasses();
      const updated = (res.data || []).filter(
        (c: ClassSession) => c.trainerId === trainerInfo?._id || c.trainerName?.includes(trainerInfo?.name.split(' ')[0] || '')
      );
      setCoachingClasses(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-8 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Coach Bio Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          {trainerInfo?.avatar ? (
            <img
              src={trainerInfo.avatar}
              alt={trainerInfo.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-primary/40 shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-300 font-display font-bold text-xl sm:text-2xl flex items-center justify-center border border-amber-500/30 shrink-0">
              {trainerInfo?.name?.[0] || 'C'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">{trainerInfo?.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                HEAD COACH
              </span>
            </div>
            <div className="text-xs text-primary font-semibold mt-0.5">
              {trainerInfo?.specialization || 'Olympic Weightlifting & Strength Conditioning'}
            </div>
            <div className="text-xs text-[#7e8eb2] mt-0.5">
              {trainerInfo?.experienceYears} Years Exp • Certifications:{' '}
              {trainerInfo?.certifications?.join(', ')}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('workouts')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 shrink-0 min-h-[42px]"
        >
          <span className="material-symbols-outlined text-base">fitness_center</span>
          <span>Open Routine Builder</span>
        </button>
      </div>

      {/* Grid: My Classes to Coach + Assigned Athletic Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Classes Scheduled for this Coach */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2746]">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                My Coaching Sessions Today
              </h3>
              <p className="text-xs text-[#7d8dae]">Interactive tablet check-in for attendees</p>
            </div>
            <span className="text-xs font-mono text-primary font-bold">
              {coachingClasses.length} Sessions
            </span>
          </div>

          <div className="space-y-4">
            {coachingClasses.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-[#121c35] border border-[#1e2d4e] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-bold text-sm text-white">{item.name}</div>
                    <div className="text-xs text-[#8090b4]">
                      {item.startTime} - {item.endTime} • {item.room}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">
                    {item.enrolledList?.length || 0} / {item.capacity} Enrolled
                  </span>
                </div>

                {/* Attendee check-in list */}
                <div className="space-y-2 pt-1 border-t border-[#1a2644]">
                  <div className="text-[11px] font-semibold text-[#7080a2] uppercase tracking-wider">
                    Quick Attendance Check
                  </div>
                  {item.enrolledList?.map((m) => (
                    <div
                      key={m._id}
                      className="p-2 rounded-xl bg-[#0b1224] border border-[#1b2746] flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{m.name}</span>
                      <button
                        onClick={() => handleToggleCheckIn(item._id, m._id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                          m.checkedIn
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#152039] text-[#7888ad] hover:text-white'
                        }`}
                      >
                        {m.checkedIn ? '✓ Present' : 'Mark Present'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Personal Training Clients */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2746]">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Assigned Athlete Clients
              </h3>
              <p className="text-xs text-[#7d8dae]">Body composition and workout tracking</p>
            </div>
            <span className="text-xs font-mono text-primary font-bold">
              {assignedClients.length} Athletes
            </span>
          </div>

          <div className="space-y-3">
            {assignedClients.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6e7e9f]">
                No athletes currently assigned.
              </div>
            ) : (
              assignedClients.map((client) => (
                <div
                  key={client._id}
                  onClick={() => onSelectMember(client._id)}
                  className="p-4 rounded-2xl bg-[#121c35] border border-[#1e2d4e] hover:border-primary/40 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {client.profileImage ? (
                      <img
                        src={client.profileImage}
                        alt={client.name}
                        className="w-10 h-10 rounded-xl object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">
                        {client.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{client.name}</div>
                      <div className="text-[11px] text-[#7181a4]">{client.planName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-white">
                      {client.weightKg || 62} kg • {client.bodyFatPercentage || 19.5}% BF
                    </div>
                    <div className="text-[10px] text-primary font-mono mt-0.5">
                      {client.attendanceRate || 88}% Attendance
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
