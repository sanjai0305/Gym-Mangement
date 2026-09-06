import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassSession } from '../types';
import { useAuth } from '../context/AuthContext';

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [selectedDay, setSelectedDay] = useState('Today');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.getClasses();
      setClasses(res.data || []);
      if (res.data?.[0] && !selectedClass) {
        setSelectedClass(res.data[0]);
      } else if (selectedClass) {
        const updated = res.data.find((c: any) => c._id === selectedClass._id);
        if (updated) setSelectedClass(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleBook = async (classId: string) => {
    setBookingLoading(true);
    try {
      await api.enrollInClass(classId);
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    setBookingLoading(true);
    try {
      await api.cancelEnrollment(classId);
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Cancel failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleAttendance = async (classId: string, memberId: string) => {
    try {
      await api.toggleCheckInClass(classId, memberId);
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Toggle attendance failed');
    }
  };

  const days = ['Today', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Day Selector Navigation */}
      <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b] flex items-center gap-2 overflow-x-auto">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDay === d
                ? 'bg-primary text-[#0b1326] shadow-md shadow-primary/20'
                : 'text-[#8596bd] hover:bg-[#141f39] hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Main Grid: Class Timetable + Active Roster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Scheduled Athletic Sessions
            </h3>
            <span className="text-xs text-[#7b8bae]">{classes.length} Sessions Available</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#6e7e9f]">Loading session schedule...</div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6e7e9f]">No classes scheduled.</div>
          ) : (
            <div className="space-y-4">
              {classes.map((item) => {
                const enrolled = item.enrolledMemberIds?.length || 0;
                const capacity = item.capacity || 20;
                const percentFull = Math.min((enrolled / capacity) * 100, 100);
                const isEnrolled =
                  user?._id && item.enrolledMemberIds?.includes(user._id);
                const isSelected = selectedClass?._id === item._id;

                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedClass(item)}
                    className={`p-5 rounded-3xl bg-[#0e172c] border transition cursor-pointer space-y-4 ${
                      isSelected
                        ? 'border-primary shadow-lg shadow-primary/10'
                        : 'border-[#1e2a4a] hover:border-[#2f406c]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-white">
                            {item.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182649] text-primary border border-primary/30 font-mono font-semibold">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#8797bc] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-xs text-white">
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="text-[11px] text-primary font-medium mt-0.5">
                          {item.room}
                        </div>
                      </div>
                    </div>

                    {/* Coach details & Capacity progress bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#17233f]">
                      <div className="flex items-center gap-2.5">
                        {item.trainerAvatar ? (
                          <img
                            src={item.trainerAvatar}
                            alt={item.trainerName}
                            className="w-7 h-7 rounded-lg object-cover border border-primary/30"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                            {item.trainerName?.[0] || 'C'}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white">
                          Coach {item.trainerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            {enrolled} / {capacity} spots
                          </div>
                          <div className="w-28 h-1.5 rounded-full bg-[#16223d] overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentFull >= 90
                                  ? 'bg-rose-400'
                                  : 'bg-gradient-to-r from-primary to-[#a3e635]'
                              }`}
                              style={{ width: `${percentFull}%` }}
                            />
                          </div>
                        </div>

                        {/* Booking action button */}
                        {isEnrolled ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelBooking(item._id);
                            }}
                            disabled={bookingLoading}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition"
                          >
                            Cancel Spot
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBook(item._id);
                            }}
                            disabled={bookingLoading || enrolled >= capacity}
                            className="px-3.5 py-1.5 rounded-xl bg-primary text-[#0b1326] font-display font-bold text-xs hover:brightness-110 disabled:opacity-50 transition active:scale-95 shadow-sm"
                          >
                            {enrolled >= capacity ? 'Waitlist' : 'Book Spot'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Active Roster Inspector */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-[#0e172c] border border-[#202c4b] sticky top-28 space-y-5">
            {selectedClass ? (
              <>
                <div className="pb-4 border-b border-[#1a2647] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-primary tracking-wider">
                      Active Roster Inspector
                    </span>
                    <h4 className="font-display font-bold text-base text-white mt-0.5">
                      {selectedClass.name}
                    </h4>
                    <div className="text-xs text-[#8090b4] mt-0.5">
                      {selectedClass.startTime} • {selectedClass.room} • Coach {selectedClass.trainerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-extrabold text-primary">
                      {selectedClass.enrolledMemberIds?.length || 0} / {selectedClass.capacity}
                    </div>
                    <div className="text-[10px] text-[#7181a4]">Capacity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#8091b5] uppercase tracking-wider">
                    Enrolled Athletes ({selectedClass.enrolledList?.length || 0})
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {selectedClass.enrolledList?.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#6e7e9f]">
                        No members enrolled yet in this session.
                      </div>
                    ) : (
                      selectedClass.enrolledList?.map((m) => (
                        <div
                          key={m._id}
                          className="p-3 rounded-2xl bg-[#121c35] border border-[#1e2c4f] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {m.profileImage ? (
                              <img
                                src={m.profileImage}
                                alt={m.name}
                                className="w-8 h-8 rounded-lg object-cover border border-primary/30"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                                {m.name[0]}
                              </div>
                            )}
                            <div className="truncate">
                              <div className="font-semibold text-white truncate">{m.name}</div>
                              <div className="font-mono text-[10px] text-primary">{m.memberId}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleAttendance(selectedClass._id, m._id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition ${
                              m.checkedIn
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-[#182544] text-[#8696bd] hover:text-white border border-[#23355d]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {m.checkedIn ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span>{m.checkedIn ? 'Attended' : 'Mark Present'}</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-[#6e7e9f]">
                Select a class to inspect the attendee roster.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
