import mongoose, { Schema, Document, Model } from 'mongoose';

// ==================== USER MODEL ====================
export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER';
  gymId: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'],
      default: 'MEMBER',
      index: true,
    },
    gymId: { type: String, required: true, index: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ==================== GYM MODEL ====================
export interface IGym extends Document {
  name: string;
  ownerId: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  openingHours: string;
  timezone: string;
  currency: string;
  taxPercentage?: number;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GymSchema = new Schema<IGym>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true, index: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '06:00 AM - 10:00 PM' },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: '₹' },
    taxPercentage: { type: Number, default: 18 },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

// ==================== MEMBER MODEL ====================
export interface IMember extends Document {
  memberId: string;
  gymId: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address: string;
  emergencyContact: string;
  joiningDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED';
  profileImage?: string;
  notes?: string;
  weightKg?: number;
  heightCm?: number;
  bodyFatPercentage?: number;
  attendanceRate?: number;
  assignedTrainerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    memberId: { type: String, required: true, unique: true, index: true },
    gymId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dateOfBirth: { type: String },
    address: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    joiningDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'FROZEN', 'CANCELLED'], default: 'ACTIVE', index: true },
    profileImage: { type: String },
    notes: { type: String, default: '' },
    weightKg: { type: Number, default: 70 },
    heightCm: { type: Number, default: 175 },
    bodyFatPercentage: { type: Number, default: 18 },
    attendanceRate: { type: Number, default: 100 },
    assignedTrainerId: { type: String, index: true },
  },
  { timestamps: true }
);
MemberSchema.index({ gymId: 1, email: 1 });

// ==================== MEMBERSHIP PLAN MODEL ====================
export interface IMembershipPlan extends Document {
  gymId: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  maxClasses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    gymId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1 },
    features: [{ type: String }],
    maxClasses: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ==================== MEMBERSHIP MODEL ====================
export interface IMembership extends Document {
  gymId: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  amount: number;
  discount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'REFUNDED';
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED';
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    gymId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    planId: { type: String, required: true, index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE', 'REFUNDED'],
      default: 'PAID',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'FROZEN', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ==================== ATTENDANCE MODEL ====================
export interface IAttendance extends Document {
  gymId: string;
  memberId: string;
  checkIn: string;
  checkOut?: string;
  durationMinutes?: number;
  method: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC';
  date: string;
  turnstile?: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    gymId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String },
    durationMinutes: { type: Number },
    method: { type: String, enum: ['MANUAL', 'QR_CODE', 'BIOMETRIC'], default: 'MANUAL' },
    date: { type: String, required: true, index: true },
    turnstile: { type: String, default: 'Turnstile #01' },
  },
  { timestamps: true }
);
AttendanceSchema.index({ gymId: 1, memberId: 1, date: 1 });

// ==================== TRAINER MODEL ====================
export interface ITrainer extends Document {
  gymId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  certifications: string[];
  bio?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  assignedMemberIds: string[];
  rating: number;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    gymId: { type: String, required: true, index: true },
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    specialization: { type: String, default: 'General Strength' },
    experienceYears: { type: Number, default: 1 },
    certifications: [{ type: String }],
    bio: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'], default: 'ACTIVE' },
    assignedMemberIds: [{ type: String }],
    rating: { type: Number, default: 5.0 },
    avatar: { type: String },
  },
  { timestamps: true }
);

// ==================== CLASS SESSION MODEL ====================
export interface IClassSession extends Document {
  gymId: string;
  name: string;
  description?: string;
  trainerId: string;
  trainerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  enrolledMemberIds: string[];
  waitlistMemberIds: string[];
  checkedInMemberIds: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSessionSchema = new Schema<IClassSession>(
  {
    gymId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    trainerId: { type: String, required: true, index: true },
    trainerName: { type: String },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: 'Main Studio' },
    capacity: { type: Number, required: true, min: 1 },
    enrolledMemberIds: [{ type: String }],
    waitlistMemberIds: [{ type: String }],
    checkedInMemberIds: [{ type: String }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    category: { type: String, default: 'CrossFit' },
  },
  { timestamps: true }
);

// ==================== PAYMENT MODEL ====================
export interface IPayment extends Document {
  gymId: string;
  memberId: string;
  memberName?: string;
  membershipId?: string;
  transactionId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    gymId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    memberName: { type: String },
    membershipId: { type: String },
    transactionId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'],
      default: 'CARD',
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'PAID',
    },
    paymentDate: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// ==================== EXPENSE MODEL ====================
export interface IExpense extends Document {
  gymId: string;
  title: string;
  category: 'MAINTENANCE' | 'EQUIPMENT' | 'SALARIES' | 'UTILITIES' | 'MARKETING' | 'OTHER';
  amount: number;
  date: string;
  paymentMethod: string;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    gymId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['MAINTENANCE', 'EQUIPMENT', 'SALARIES', 'UTILITIES', 'MARKETING', 'OTHER'],
      default: 'OTHER',
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true, index: true },
    paymentMethod: { type: String, default: 'BANK_TRANSFER' },
    vendor: { type: String },
    receiptUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// ==================== WORKOUT PLAN MODEL ====================
export interface IWorkoutPlan extends Document {
  gymId: string;
  memberId: string;
  trainerId?: string;
  title: string;
  objective: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  days: any[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    gymId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    trainerId: { type: String },
    title: { type: String, required: true },
    objective: { type: String, default: 'General Fitness' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    days: [{ type: Schema.Types.Mixed }],
    notes: { type: String },
  },
  { timestamps: true }
);

// ==================== NOTIFICATION MODEL ====================
export interface INotification extends Document {
  gymId: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    gymId: { type: String, required: true, index: true },
    userId: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'INFO' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

// Export Mongoose Models (with safe recompilation guard for hot reload)
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const GymModel: Model<IGym> = mongoose.models.Gym || mongoose.model<IGym>('Gym', GymSchema);
export const MemberModel: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
export const MembershipPlanModel: Model<IMembershipPlan> = mongoose.models.MembershipPlan || mongoose.model<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);
export const MembershipModel: Model<IMembership> = mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);
export const AttendanceModel: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
export const TrainerModel: Model<ITrainer> = mongoose.models.Trainer || mongoose.model<ITrainer>('Trainer', TrainerSchema);
export const ClassSessionModel: Model<IClassSession> = mongoose.models.ClassSession || mongoose.model<IClassSession>('ClassSession', ClassSessionSchema);
export const PaymentModel: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export const ExpenseModel: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export const WorkoutPlanModel: Model<IWorkoutPlan> = mongoose.models.WorkoutPlan || mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
export const NotificationModel: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
