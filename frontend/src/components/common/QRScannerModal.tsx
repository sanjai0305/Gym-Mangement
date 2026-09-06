import React, { useState } from 'react';
import { api } from '../../services/api';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onCheckInSuccess,
}) => {
  const [memberCode, setMemberCode] = useState('');
  const [turnstile, setTurnstile] = useState('Turnstile #01 - North Entrance');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    member?: any;
  } | null>(null);

  if (!isOpen) return null;

  const handleScanOrSubmit = async (codeToUse?: string) => {
    const code = codeToUse || memberCode;
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.checkIn({
        memberId: code.trim(),
        method: 'QR_CODE',
        turnstile,
      });

      setResult({
        success: true,
        message: res.message || 'Turnstile unlocked. Access Granted!',
      });
      onCheckInSuccess();
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Access Denied: Invalid Credentials or Expired Membership.',
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleMembers = [
    { code: 'FIT-008921', name: 'Sophia Martinez (Active VIP)' },
    { code: 'FIT-006219', name: 'Elena Rostova (Active Core)' },
    { code: 'FIT-005501', name: 'Devin Cole (Expired - Test Reject)' },
    { code: 'FIT-009014', name: 'Liam Gallagher (Frozen - Test Reject)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e162b] border border-[#233155] rounded-3xl p-6 shadow-2xl text-[#dae2fd] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b2542]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">
              qr_code_scanner
            </span>
            <h2 className="font-display font-extrabold text-base text-white">
              Turnstile QR Access Terminal
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6f7e9f] hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="my-5 relative rounded-2xl overflow-hidden bg-[#060c1c] border-2 border-dashed border-[#25365e] p-6 text-center">
          <div className="w-36 h-36 mx-auto border-2 border-primary/60 rounded-xl relative flex items-center justify-center bg-primary/5">
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

            {/* Laser scanning line */}
            <div className="absolute inset-x-0 h-0.5 bg-primary/80 shadow-[0_0_12px_#ccff80] animate-[bounce_2s_infinite]" />
            <span className="material-symbols-outlined text-4xl text-primary/40">barcode_scanner</span>
          </div>

          <p className="text-xs text-[#7e8cae] mt-3 font-mono">
            Optical Sensor & RFID Reader Online
          </p>
        </div>

        {/* Access Status Banner */}
        {result && (
          <div
            className={`p-4 mb-4 rounded-2xl border flex items-center gap-3 animate-in fade-in duration-150 ${
              result.success
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-2xl shrink-0">
              {result.success ? 'check_circle' : 'cancel'}
            </span>
            <div className="text-xs font-semibold leading-relaxed">{result.message}</div>
          </div>
        )}

        {/* Manual Barcode / Member ID Input */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
              Select Turnstile Gate
            </label>
            <select
              value={turnstile}
              onChange={(e) => setTurnstile(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#121b33] border border-[#222f51] text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="Turnstile #01 - North Entrance">Turnstile #01 - North Entrance</option>
              <option value="Turnstile #02 - VIP Fast Track">Turnstile #02 - VIP Fast Track</option>
              <option value="Turnstile #03 - Studio Turf Access">Turnstile #03 - Studio Turf Access</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8a9bbd] block mb-1">
              Scan or Enter Member ID / Barcode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. FIT-008921"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanOrSubmit()}
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#121b33] border border-[#222f51] text-xs font-mono text-white placeholder-[#515e7f] focus:outline-none focus:border-primary uppercase"
              />
              <button
                onClick={() => handleScanOrSubmit()}
                disabled={loading || !memberCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-primary text-[#0b1326] font-display font-bold text-xs hover:brightness-110 disabled:opacity-50 transition active:scale-95"
              >
                {loading ? 'Verifying...' : 'Check In'}
              </button>
            </div>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-[#667497] uppercase tracking-wider mb-2">
              Quick Simulate (Demo Passes)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleMembers.map((m) => (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => {
                    setMemberCode(m.code);
                    handleScanOrSubmit(m.code);
                  }}
                  className="p-2 rounded-xl bg-[#121c35] hover:bg-[#182649] border border-[#202e50] text-left transition"
                >
                  <div className="font-mono text-primary font-bold text-xs">{m.code}</div>
                  <div className="text-[10px] text-[#8695b7] truncate">{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
