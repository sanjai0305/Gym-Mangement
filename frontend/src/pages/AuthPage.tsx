import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthPageProps {
  initialMode?: 'signin' | 'register';
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onSuccess,
  onBackToHome,
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign in form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(regData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRole = async (role: UserRole) => {
    setLoading(true);
    try {
      await switchDemoRole(role);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1e] text-[#dae2fd] flex flex-col justify-between p-3 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full py-2">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#8b9bc1] hover:text-white transition min-h-[38px]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[#a3e635] flex items-center justify-center text-[#0b1326] font-extrabold shadow-md">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <span className="font-display font-extrabold text-white tracking-wider">FITCORE</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto w-full my-4 sm:my-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Side: Real Credentials Form */}
        <div className="md:col-span-7 bg-[#0d162b] border border-[#202e52] rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1b2746]">
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                {mode === 'signin' ? 'Access Facility Portal' : 'Register Gym Facility'}
              </h2>
              <p className="text-xs text-[#8090b4] mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your dashboard, roster, or member pass.'
                  : 'Deploy a multi-tenant cloud workspace for your athletic gym.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8697bd] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@fitcore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#8697bd]">Password</label>
                  <span className="text-[11px] text-[#6e7e9f]">(Demo default: password123)</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition disabled:opacity-50 min-h-[44px]"
              >
                {loading ? 'Authenticating...' : 'Sign In to Hub'}
              </button>

              <div className="text-center text-xs text-[#7f8fad] pt-2">
                Need a new gym workspace?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Create Facility
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8697bd] block mb-1">
                  Facility / Gym Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron & Pulse Athletic Club"
                  value={regData.gymName}
                  onChange={(e) => setRegData({ ...regData, gymName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8697bd] block mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    value={regData.ownerName}
                    onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8697bd] block mb-1">
                    Owner Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2831"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8697bd] block mb-1">
                  Owner Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@mygym.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8697bd] block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary min-h-[42px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-extrabold text-xs shadow-lg shadow-primary/25 hover:brightness-110 transition disabled:opacity-50 min-h-[44px]"
              >
                {loading ? 'Bootstrapping Facility...' : 'Create Gym & Launch SaaS'}
              </button>

              <div className="text-center text-xs text-[#7f8fad] pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Instant 1-Click Role Sandbox Simulation */}
        <div className="md:col-span-5 bg-[#0a1224] border border-[#1d2a4a] rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">touch_app</span>
            <h3 className="font-display font-bold text-sm text-white">1-Click Demo Personas</h3>
          </div>
          <p className="text-xs text-[#7b8cae] leading-relaxed">
            Test and evaluate real Role-Based Access Control (RBAC) instantly without typing credentials.
          </p>

          <div className="space-y-2.5 pt-2">
            {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
              const demo = DEMO_USERS[roleKey];
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleSimulateRole(roleKey)}
                  className="w-full p-3 rounded-2xl bg-[#111c34] hover:bg-[#18274a] border border-[#1f2d50] hover:border-primary/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#162444] border border-[#23355e] flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-[#0b1326] transition">
                      {roleKey[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{demo.name}</div>
                      <div className="text-[10px] text-[#7888aa]">{demo.title}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#182647] font-mono text-primary group-hover:bg-primary/20">
                    {roleKey}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#526080]">
        FITCORE SaaS Platform • Tenant Isolation Enabled
      </div>
    </div>
  );
};
