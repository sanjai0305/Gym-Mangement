export type UserRole = 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  gymId: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  _id: string;
  name: string;
  ownerId: string;
  logo?: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  website?: string;
  openingHours: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  _id: string;
  memberId: string;
  userId?: string;
  gymId: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'PENDING';
  profileImage?: string;
  notes?: string;
  weightKg?: number;
  heightCm?: number;
  bodyFatPercentage?: number;
  attendanceRate?: number;
  assignedTrainerId?: string;
  activeMembership?: any;
  planName?: string;
  planId?: string;
  daysRemaining?: number;
  trainerName?: string;
  visitsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlan {
  _id: string;
  gymId: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  maxClasses: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  _id: string;
  gymId: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  amount: number;
  discount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'PENDING';
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  gymId: string;
  memberId: string;
  memberName?: string;
  memberCode?: string;
  profileImage?: string;
  checkIn: string;
  checkOut?: string;
  durationMinutes?: number;
  method: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC';
  date: string;
  turnstile?: string;
  createdAt: string;
}

export interface Trainer {
  _id: string;
  gymId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  certifications: string[];
  bio: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  assignedMemberIds: string[];
  rating?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSession {
  _id: string;
  gymId: string;
  name: string;
  description: string;
  trainerId: string;
  trainerName?: string;
  trainerAvatar?: string;
  trainerSpecialization?: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  enrolledMemberIds: string[];
  waitlistMemberIds: string[];
  checkedInMemberIds: string[];
  enrolledCount?: number;
  availableSlots?: number;
  isFull?: boolean;
  enrolledList?: Array<{
    _id: string;
    name: string;
    memberId: string;
    profileImage?: string;
    checkedIn: boolean;
  }>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category: 'CrossFit' | 'Yoga' | 'Cardio & HIIT' | 'Strength' | 'Zumba' | 'General';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  gymId: string;
  memberId: string;
  memberName?: string;
  memberCode?: string;
  membershipId?: string;
  transactionId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  gymId: string;
  category: 'Rent' | 'Electricity' | 'Equipment' | 'Salary' | 'Maintenance' | 'Marketing' | 'Other';
  description: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg?: number;
  restSeconds: number;
  durationMinutes?: number;
  instructions: string;
  videoUrl?: string;
}

export interface WorkoutPlan {
  _id: string;
  gymId: string;
  memberId: string;
  memberName?: string;
  memberCode?: string;
  trainerId: string;
  trainerName?: string;
  name: string;
  goal: string;
  exercises: WorkoutExercise[];
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  gymId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
