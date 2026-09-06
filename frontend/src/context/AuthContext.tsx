import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Gym, UserRole } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  gym: Gym | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (payload: { gymName: string; ownerName: string; email: string; phone?: string; password: string }) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, { email: string; name: string; title: string; avatar?: string }> = {
  OWNER: {
    email: 'owner@fitcore.com',
    name: 'Marcus Vance',
    title: 'Gym Owner & Director',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs2Bu0g46-6KuCvbRgkafVaLWWKR7E-Mbrt76lacF-4cP9vMOA7OkuJieLvUQYcoSBmirlttg8OJOYXuvOO7LApE6lZ-F-NVidj9VqeYhJKhsEssrN1rJF1WgtBNCGFhMcwMuHCWwF3NxFMeaToWf4QY7MoII-FKjCSQiycshaWEsHoo0RwTSnuT_s2gxFhYNyzFoypaFMPfCUFPAkUeAIrikKYNbeh__xMMoewZ_fNrBPlXJ0itGs',
  },
  ADMIN: {
    email: 'admin@fitcore.com',
    name: 'Sarah Jenkins',
    title: 'Operations Director',
  },
  RECEPTIONIST: {
    email: 'reception@fitcore.com',
    name: 'Mark Gable',
    title: 'Front Desk Lead',
  },
  TRAINER: {
    email: 'trainer@fitcore.com',
    name: 'Coach Tanya Sharma',
    title: 'Head Performance Coach',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1uuEaLxLdHXDv2AgjwKyoMM1r12bsOL8rKCje4F5cT1-DdJAKXSua-R9nkK48kEvcaNokg5p2UbfaR1nCCMS4fw5MA_jkonmFDwT82H89hrjbQi79oMfxEw4HBlerd55YoFkbIVQtr-FxvKWmhHG_ltjDmah4e7wIDCJQNK3RrEmDeVkuXPwdVsWQTTBqLH2TIKrLbZ7hXEBMLAJg2c-9LN5R-9-dlRggJi0NDSbPh2sTsjnvYzo',
  },
  MEMBER: {
    email: 'member@fitcore.com',
    name: 'Sophia Martinez',
    title: 'VIP Annual Member',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdPfC7U_hJjEio_dWYzL85gzRku6HHKd_uh6GJqFcsHpCn2AuhsfLhUq6DwbrmaK_oTnjjUtQ95Lw0W50sXCei4CN2opW7n4UNxjNvk0tyuu492pKUDhUWZIVbu1ch5XgboOkgCq_CftBkxDja-2JTi4EwW2IcSsa_OpPatZYiQACtkl-BM4xwK4LeWwU1Meqv57x-gUoAGkkI32NEG3fAL4NdM5IvpggPIi12dZKZ8cQji6QPjRu',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      // Auto-login as Demo Owner for smooth instant preview
      try {
        const res = await api.login('owner@fitcore.com', 'password123');
        setAuthToken(res.data.token);
        setUser(res.data.user);
        setGym(res.data.gym);
      } catch (e) {
        console.error('Auto login failed:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.me();
      setUser(res.data.user);
      setGym(res.data.gym);
    } catch (err) {
      console.warn('Stored token invalid, logging in as demo owner:', err);
      try {
        const res = await api.login('owner@fitcore.com', 'password123');
        setAuthToken(res.data.token);
        setUser(res.data.user);
        setGym(res.data.gym);
      } catch (loginErr) {
        setAuthToken(null);
        setUser(null);
        setGym(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setGym(res.data.gym);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { gymName: string; ownerName: string; email: string; phone?: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setGym(res.data.gym);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    if (demo) {
      await login(demo.email, 'password123');
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setGym(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.me();
      setUser(res.data.user);
      setGym(res.data.gym);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        gym,
        loading,
        login,
        register,
        switchDemoRole,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
