const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

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
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Handle base URL ending with slash vs not
  const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${cleanBase}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
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

  // Plans
  getPlans: () => request('/plans'),
  createPlan: (plan: any) => request('/plans', { method: 'POST', body: JSON.stringify(plan) }),
  updatePlan: (id: string, plan: any) => request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(plan) }),
  deletePlan: (id: string) => request(`/plans/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (date?: string) => request(`/attendance${date ? `?date=${date}` : ''}`),
  checkIn: (payload: { memberId: string; method?: string; turnstile?: string }) =>
    request('/attendance/check-in', { method: 'POST', body: JSON.stringify(payload) }),
  checkOut: (id: string) => request(`/attendance/${id}/check-out`, { method: 'POST' }),

  // Classes
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
  deleteExpense: (id: string) => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Workouts
  getWorkouts: (memberId?: string) => request(`/workouts${memberId ? `?memberId=${memberId}` : ''}`),
  createWorkout: (workout: any) => request('/workouts', { method: 'POST', body: JSON.stringify(workout) }),

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
