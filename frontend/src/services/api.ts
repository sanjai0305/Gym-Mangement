const rawApiUrl = (import.meta.env.VITE_API_URL as string) || '';

// If VITE_API_URL is configured, normalize it; otherwise default to '/api' for local/same-origin proxying
const API_BASE = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('fitcore_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('fitcore_token', token);
  } else {
    localStorage.removeItem('fitcore_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_BASE}${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
    });
  } catch (networkError: any) {
    console.error(`[API Network Error] Failed to reach ${targetUrl}:`, networkError);
    if (!rawApiUrl && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      throw new Error(
        'VITE_API_URL is not configured in your Vercel frontend project settings. Please set VITE_API_URL=https://<your-backend>.vercel.app/api and redeploy.'
      );
    }
    throw new Error(
      `Unable to connect to backend at ${targetUrl}. Please check your internet connection or verify VITE_API_URL deployment settings.`
    );
  }

  // Parse response defensively
  let data: any;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: `Server returned invalid JSON (${response.status})` };
    }
  } else {
    const text = await response.text();
    // Detect if Vercel returned an index.html rewrite or 404/500 HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error(
        `Backend endpoint '${cleanEndpoint}' returned an HTML page (${response.status}). Verify backend deployment and VITE_API_URL.`
      );
    }
    data = { success: response.ok, message: text || `HTTP ${response.status} ${response.statusText}` };
  }

  if (!response.ok || data.success === false) {
    const errMsg = data.message || (Array.isArray(data.errors) ? data.errors.join(', ') : `Request failed with status ${response.status}`);
    throw new Error(errMsg);
  }

  return data;
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload: { gymName: string; ownerName: string; email: string; phone?: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => {
    setAuthToken(null);
    return request('/auth/logout', { method: 'POST' });
  },
  refreshToken: () => request('/auth/refresh', { method: 'POST' }),
  me: () => request('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Dashboard Overview
  getDashboardOverview: () => request('/dashboard/overview'),

  // Members
  getMembers: (params?: { search?: string; status?: string; tier?: string; trainerId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request(`/members${q ? `?${q}` : ''}`);
  },
  getMemberById: (id: string) => request(`/members/${id}`),
  createMember: (memberData: any) =>
    request('/members', { method: 'POST', body: JSON.stringify(memberData) }),
  updateMember: (id: string, memberData: any) =>
    request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(memberData) }),
  deleteMember: (id: string) => request(`/members/${id}`, { method: 'DELETE' }),
  freezeMember: (id: string, reason?: string) =>
    request(`/members/${id}/freeze`, { method: 'POST', body: JSON.stringify({ reason }) }),
  renewMembership: (id: string, planId: string) =>
    request(`/members/${id}/renew`, { method: 'POST', body: JSON.stringify({ planId }) }),

  // Plans & Memberships
  getPlans: () => request('/plans'),
  getMemberships: () => request('/memberships'),
  createPlan: (plan: any) => request('/plans', { method: 'POST', body: JSON.stringify(plan) }),
  createMembership: (plan: any) => request('/memberships', { method: 'POST', body: JSON.stringify(plan) }),
  updatePlan: (id: string, plan: any) => request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(plan) }),
  updateMembership: (id: string, plan: any) => request(`/memberships/${id}`, { method: 'PUT', body: JSON.stringify(plan) }),
  deletePlan: (id: string) => request(`/plans/${id}`, { method: 'DELETE' }),
  deleteMembership: (id: string) => request(`/memberships/${id}`, { method: 'DELETE' }),

  // Attendance & Turnstiles
  getAttendance: (date?: string) => request(`/attendance${date ? `?date=${date}` : ''}`),
  checkIn: (payload: { memberId: string; method?: string; turnstile?: string }) =>
    request('/attendance/check-in', { method: 'POST', body: JSON.stringify(payload) }),
  checkOut: (idOrPayload: string | { id?: string; memberId?: string; attendanceId?: string }) => {
    if (typeof idOrPayload === 'string') {
      return request(`/attendance/${idOrPayload}/check-out`, { method: 'POST' });
    }
    return request('/attendance/check-out', { method: 'POST', body: JSON.stringify(idOrPayload) });
  },

  // Classes & Scheduling
  getClasses: (date?: string) => request(`/classes${date ? `?date=${date}` : ''}`),
  createClass: (payload: any) => request('/classes', { method: 'POST', body: JSON.stringify(payload) }),
  updateClass: (id: string, payload: any) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteClass: (id: string) => request(`/classes/${id}`, { method: 'DELETE' }),
  enrollInClass: (classId: string, memberId?: string) =>
    request(`/classes/${classId}/enroll`, { method: 'POST', body: JSON.stringify({ memberId }) }),
  cancelEnrollment: (classId: string, memberId?: string) =>
    request(`/classes/${classId}/cancel`, { method: 'POST', body: JSON.stringify({ memberId }) }),
  toggleCheckInClass: (classId: string, memberId: string) =>
    request(`/classes/${classId}/toggle-checkin`, { method: 'POST', body: JSON.stringify({ memberId }) }),

  // Trainers
  getTrainers: () => request('/trainers'),
  createTrainer: (trainer: any) => request('/trainers', { method: 'POST', body: JSON.stringify(trainer) }),
  updateTrainer: (id: string, trainer: any) => request(`/trainers/${id}`, { method: 'PUT', body: JSON.stringify(trainer) }),
  deleteTrainer: (id: string) => request(`/trainers/${id}`, { method: 'DELETE' }),

  // Payments & Invoices
  getPayments: () => request('/payments'),
  recordPayment: (payment: any) => request('/payments', { method: 'POST', body: JSON.stringify(payment) }),
  getInvoice: (invoiceNumber: string) => request(`/payments/invoice/${invoiceNumber}`),

  // Expenses
  getExpenses: () => request('/expenses'),
  addExpense: (expense: any) => request('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: string, expense: any) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id: string) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Workouts
  getWorkouts: (memberId?: string) => request(`/workouts${memberId ? `?memberId=${memberId}` : ''}`),
  createWorkout: (workout: any) => request('/workouts', { method: 'POST', body: JSON.stringify(workout) }),
  updateWorkout: (id: string, workout: any) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(workout) }),
  deleteWorkout: (id: string) => request(`/workouts/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Gym Settings
  getGymSettings: () => request('/gym/settings'),
  updateGymSettings: (settings: any) => request('/gym/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Public Contact & Reset Demo
  sendContactMessage: (msg: any) => request('/contact', { method: 'POST', body: JSON.stringify(msg) }),
  resetDemoData: () => request('/system/reset-demo', { method: 'POST' }),
};
