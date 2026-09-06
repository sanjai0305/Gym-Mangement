import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Attendance } from '../types';

interface AttendancePageProps {
  onOpenQRScanner: () => void;
  onSelectMember: (memberId: string) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  onOpenQRScanner,
  onSelectMember,
}) => {
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickCode, setQuickCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.getAttendance();
      setLogs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    setCheckingIn(true);
    setStatusFeedback(null);
    try {
      const res = await api.checkIn({
        memberId: quickCode.trim(),
        method: 'MANUAL',
        turnstile: 'Desk Reception Override',
      });
      setStatusFeedback(`Checked in successfully: ${res.data?.memberName || quickCode}`);
      setQuickCode('');
      fetchAttendance();
    } catch (err: any) {
      setStatusFeedback(`Failed: ${err.message}`);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.checkOut(id);
      fetchAttendance();
    } catch (err: any) {
      alert(err.message || 'Check out failed');
    }
  };

  const todayCount = logs.length;
  const currentlyInsideCount = logs.filter((l) => !l.checkOut).length;

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Turnstile Status & Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Currently On Floor</div>
          <div className="font-display font-bold text-2xl text-primary mt-1">
            {currentlyInsideCount}{' '}
            <span className="text-xs text-[#6e7e9f] font-normal">athletes</span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">Active within perimeter</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Total Check-ins Today</div>
          <div className="font-display font-bold text-2xl text-white mt-1">{todayCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Peak: 06:30 - 08:30 AM</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Turnstile #01 (North)</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">ONLINE & LATCHED</span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">Optical Relay Active</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Turnstile #02 (VIP Fast Track)</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">ONLINE & LATCHED</span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">RFID / QR Ready</div>
        </div>
      </div>

      {/* Check-In Action Bar */}
      <div className="p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-base text-white">
            Front Desk Turnstile Terminal
          </h3>
          <p className="text-xs text-[#7d8dae]">
            Scan member QR pass, swipe RFID badge, or manually verify membership code.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Manual Input */}
          <form onSubmit={handleManualCheckIn} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Enter Member ID (e.g. FIT-008921)"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#233155] text-xs font-mono text-white placeholder-[#556487] focus:outline-none focus:border-primary uppercase w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={checkingIn || !quickCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#162342] hover:bg-[#1e2f57] border border-[#283964] text-xs font-semibold text-white transition disabled:opacity-50 shrink-0"
            >
              {checkingIn ? 'Checking...' : 'Check In'}
            </button>
          </form>

          {/* Big QR Scanner Button */}
          <button
            onClick={onOpenQRScanner}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            <span>Launch Turnstile Scanner</span>
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-base">info</span>
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Attendance Logs Section */}
      <div className="border border-[#202c4b] rounded-3xl bg-[#0e172c] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-[#1f2c4b] flex items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-sm text-white">Daily Access Stream</h4>
            <p className="text-xs text-[#7b8bae]">Timestamped turnstile entries & exits</p>
          </div>
          <button
            onClick={fetchAttendance}
            className="p-2 rounded-xl text-[#7282a5] hover:text-white hover:bg-[#172340] transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Refresh stream"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121b33] text-[#7a8ba8] uppercase text-[10px] tracking-wider border-b border-[#1f2c4b]">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Member ID</th>
                <th className="p-4">Gate / Turnstile</th>
                <th className="p-4">Method</th>
                <th className="p-4">Check-In Time</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17233f]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[#707f9f]">
                    Loading turnstile telemetry...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[#707f9f]">
                    No turnstile logs recorded today.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#131d37] transition">
                    <td className="p-4">
                      <div
                        onClick={() => onSelectMember(log.memberId)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        {log.profileImage ? (
                          <img
                            src={log.profileImage}
                            alt={log.memberName}
                            className="w-8 h-8 rounded-lg object-cover border border-primary/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                            {log.memberName?.[0] || 'M'}
                          </div>
                        )}
                        <span className="font-semibold text-white group-hover:text-primary transition">
                          {log.memberName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-primary">{log.memberCode}</td>

                    <td className="p-4 text-[#8a9bbd]">{log.turnstile || 'Turnstile #01'}</td>

                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182649] text-primary border border-primary/30 font-mono">
                        {log.method}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-white">
                      {new Date(log.checkIn).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4 text-[#8a9bbd]">
                      {log.durationMinutes ? `${log.durationMinutes} mins` : 'Currently active'}
                    </td>

                    <td className="p-4 text-right">
                      {!log.checkOut ? (
                        <button
                          onClick={() => handleCheckOut(log._id)}
                          className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[#647496] text-[11px] font-mono">Departed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden p-3 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#707f9f]">Loading turnstile logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#707f9f]">No turnstile logs recorded today.</div>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-[#121c35] border border-[#1e2d4e] space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => onSelectMember(log.memberId)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    {log.profileImage ? (
                      <img
                        src={log.profileImage}
                        alt={log.memberName}
                        className="w-8 h-8 rounded-lg object-cover border border-primary/30 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {log.memberName?.[0] || 'M'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{log.memberName}</div>
                      <div className="font-mono text-[10px] text-primary">{log.memberCode}</div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182649] text-primary border border-primary/30 font-mono shrink-0">
                    {log.method}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#1a2748]">
                  <div>
                    <span className="text-[#6b7b9e] block text-[9px]">GATE</span>
                    <span className="text-[#8a9bbd] truncate block">{log.turnstile || 'Turnstile #01'}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7b9e] block text-[9px]">CHECK-IN</span>
                    <span className="font-mono text-white">
                      {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#7888ab]">
                    {log.durationMinutes ? `${log.durationMinutes} mins elapsed` : 'Currently on floor'}
                  </span>
                  {!log.checkOut ? (
                    <button
                      onClick={() => handleCheckOut(log._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                    >
                      Check Out
                    </button>
                  ) : (
                    <span className="text-[#647496] text-[10px] font-mono">Departed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
