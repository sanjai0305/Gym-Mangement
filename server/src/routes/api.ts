import { Router, Response } from 'express';
import { AuthService } from '../services/authService';
import { MemberService } from '../services/memberService';
import { AttendanceService } from '../services/attendanceService';
import { ClassService } from '../services/classService';
import { PaymentService } from '../services/paymentService';
import { ExpenseService } from '../services/expenseService';
import { WorkoutService } from '../services/workoutService';
import { DashboardService } from '../services/dashboardService';
import { dbService } from '../models/db';
import { authenticate, requireRoles, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// ==================== VALIDATION HELPERS ====================
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => phone.length >= 7;

// ==================== AUTH ROUTES ====================

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const result = await AuthService.login(email, password);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Login failed' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { gymName, ownerName, email, phone, password } = req.body;
    if (!gymName?.trim() || !ownerName?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: 'Gym name, owner name, email, and password are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const result = await AuthService.register({ gymName, ownerName, email, phone: phone || '', password });
    res.status(201).json({ success: true, message: 'Gym registered successfully', data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Registration failed' });
  }
});

router.get('/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.getCurrentUser(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

router.post('/auth/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
    }
    await AuthService.changePassword(req.user!.userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const result = await AuthService.forgotPassword(email);
    res.json({ success: true, message: result.message, resetToken: result.resetToken });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }
    await AuthService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password has been reset successfully. Please log in with your new credentials.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== DASHBOARD OVERVIEW ====================

router.get('/dashboard/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await DashboardService.getAdminDashboardData(req.user!.gymId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== MEMBERS ROUTES ====================

router.get('/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // If member role, only return their own record
    if (req.user!.role === 'MEMBER') {
      const db = dbService.getRawDb();
      const ownMember = db.members.find(
        (m) => m.gymId === req.user!.gymId && (m._id === req.user!.userId || m.email.toLowerCase() === req.user!.email.toLowerCase())
      );
      return res.json({ success: true, count: ownMember ? 1 : 0, data: ownMember ? [ownMember] : [] });
    }

    const { search, status, tier, trainerId } = req.query;
    const members = await MemberService.getMembers(req.user!.gymId, {
      search: search as string,
      status: status as string,
      tier: tier as string,
      trainerId: trainerId as string,
    });
    res.json({ success: true, count: members.length, data: members });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/members/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Member authorization isolation check
    if (req.user!.role === 'MEMBER') {
      const db = dbService.getRawDb();
      const targetMember = db.members.find((m) => m._id === req.params.id && m.gymId === req.user!.gymId);
      if (targetMember && targetMember.email.toLowerCase() !== req.user!.email.toLowerCase() && targetMember._id !== req.user!.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only access your own profile.' });
      }
    }

    const member = await MemberService.getMemberById(req.user!.gymId, req.params.id);
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

router.post('/members', authenticate, requireRoles('OWNER', 'ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Member name, email, and phone number are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    const member = await MemberService.createMember(req.user!.gymId, req.body);
    res.status(201).json({ success: true, message: 'Member created successfully', data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/members/:id', authenticate, requireRoles('OWNER', 'ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await MemberService.updateMember(req.user!.gymId, req.params.id, req.body);
    res.json({ success: true, message: 'Member updated successfully', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/members/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await MemberService.deleteMember(req.user!.gymId, req.params.id);
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/members/:id/freeze', authenticate, requireRoles('OWNER', 'ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const member = await MemberService.freezeMember(req.user!.gymId, req.params.id, req.body.reason);
    res.json({ success: true, message: `Membership frozen for ${member.name}`, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/members/:id/renew', authenticate, requireRoles('OWNER', 'ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'Plan ID is required to renew membership.' });
    }
    const membership = await MemberService.renewMembership(req.user!.gymId, req.params.id, planId);
    res.json({ success: true, message: 'Membership renewed successfully', data: membership });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== MEMBERSHIP PLANS ====================

router.get('/plans', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plans = dbService.getMembershipPlans(req.user!.gymId);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/plans', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, durationMonths } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Plan name is required.' });
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
    }
    const numDuration = Number(durationMonths);
    if (isNaN(numDuration) || numDuration < 1) {
      return res.status(400).json({ success: false, message: 'Duration must be at least 1 month.' });
    }

    const db = dbService.getRawDb();
    const nowIso = new Date().toISOString();
    const newPlan = {
      _id: `plan-${Date.now()}`,
      gymId: req.user!.gymId,
      name: name.trim(),
      description: req.body.description || '',
      price: numPrice,
      durationMonths: numDuration,
      features: Array.isArray(req.body.features) ? req.body.features : ['Gym Floor Access', 'Locker Room'],
      maxClasses: Number(req.body.maxClasses) || 10,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.membershipPlans.push(newPlan);
    dbService.persist();
    res.status(201).json({ success: true, message: 'Membership plan created successfully', data: newPlan });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/plans/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const index = db.membershipPlans.findIndex((p) => p._id === req.params.id && p.gymId === req.user!.gymId);
    if (index === -1) throw new Error('Plan not found');
    db.membershipPlans[index] = { ...db.membershipPlans[index], ...req.body, updatedAt: new Date().toISOString() };
    dbService.persist();
    res.json({ success: true, message: 'Plan updated', data: db.membershipPlans[index] });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/plans/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const planIndex = db.membershipPlans.findIndex((p) => p._id === req.params.id && p.gymId === req.user!.gymId);
    if (planIndex === -1) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    // Check if any active memberships are bound to this plan
    const boundMemberships = db.memberships.filter((m) => m.planId === req.params.id && m.status === 'ACTIVE');
    if (boundMemberships.length > 0) {
      // Soft-delete by setting isActive to false
      db.membershipPlans[planIndex].isActive = false;
      db.membershipPlans[planIndex].updatedAt = new Date().toISOString();
      dbService.persist();
      return res.json({ success: true, message: 'Plan deactivated because active members are currently subscribed.' });
    }

    db.membershipPlans.splice(planIndex, 1);
    dbService.persist();
    res.json({ success: true, message: 'Membership plan removed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== ATTENDANCE & QR CHECK-IN ====================

router.get('/attendance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const date = req.query.date as string;
    const records = await AttendanceService.getDailyAttendance(req.user!.gymId, date);
    const stats = await AttendanceService.getStats(req.user!.gymId);
    res.json({ success: true, data: records, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/attendance/check-in', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, method, turnstile } = req.body;
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID or barcode is required' });
    }
    const result = await AttendanceService.checkIn(req.user!.gymId, {
      memberId,
      method: method || 'MANUAL',
      turnstile: turnstile || 'Turnstile #01',
    });
    res.status(201).json({ success: true, message: result.message, data: result.attendance });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/attendance/:id/check-out', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const att = await AttendanceService.checkOut(req.user!.gymId, req.params.id);
    res.json({ success: true, message: 'Member checked out', data: att });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== CLASSES & SCHEDULING ====================

router.get('/classes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const date = req.query.date as string;
    const classes = await ClassService.getClasses(req.user!.gymId, date);
    res.json({ success: true, data: classes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/classes', authenticate, requireRoles('OWNER', 'ADMIN', 'TRAINER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, capacity, startTime, endTime } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Class title is required.' });
    }
    const numCap = Number(capacity);
    if (isNaN(numCap) || numCap < 1) {
      return res.status(400).json({ success: false, message: 'Capacity must be at least 1 spot.' });
    }
    const newClass = await ClassService.createClass(req.user!.gymId, req.body);
    res.status(201).json({ success: true, message: 'Class session scheduled', data: newClass });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/classes/:id', authenticate, requireRoles('OWNER', 'ADMIN', 'TRAINER'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const index = db.classes.findIndex((c) => c._id === req.params.id && c.gymId === req.user!.gymId);
    if (index === -1) throw new Error('Class session not found');
    db.classes[index] = { ...db.classes[index], ...req.body, updatedAt: new Date().toISOString() };
    dbService.persist();
    res.json({ success: true, message: 'Class session updated', data: db.classes[index] });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/classes/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const index = db.classes.findIndex((c) => c._id === req.params.id && c.gymId === req.user!.gymId);
    if (index === -1) throw new Error('Class session not found');
    db.classes.splice(index, 1);
    dbService.persist();
    res.json({ success: true, message: 'Class session removed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/classes/:id/enroll', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId } = req.body;
    const targetMemberId = memberId || (req.user!.role === 'MEMBER' ? req.user!.userId : null);
    if (!targetMemberId) {
      return res.status(400).json({ success: false, message: 'Member ID required for booking' });
    }
    const result = await ClassService.enrollMember(req.user!.gymId, req.params.id, targetMemberId);
    res.json({ success: true, message: result.message, waitlisted: result.waitlisted });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/classes/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId } = req.body;
    const targetMemberId = memberId || (req.user!.role === 'MEMBER' ? req.user!.userId : null);
    await ClassService.cancelEnrollment(req.user!.gymId, req.params.id, targetMemberId);
    res.json({ success: true, message: 'Enrollment cancelled successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/classes/:id/toggle-checkin', authenticate, requireRoles('OWNER', 'ADMIN', 'TRAINER', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const { memberId } = req.body;
    const checked = await ClassService.toggleCheckIn(req.user!.gymId, req.params.id, memberId);
    res.json({ success: true, checked, message: checked ? 'Member marked present' : 'Attendance cleared' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== TRAINERS ====================

router.get('/trainers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const trainers = dbService.getTrainers(req.user!.gymId);
    res.json({ success: true, data: trainers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/trainers', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, specialization } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Trainer name is required.' });
    }
    const db = dbService.getRawDb();
    const nowIso = new Date().toISOString();
    const newTrainer = {
      _id: `trainer-${Date.now()}`,
      gymId: req.user!.gymId,
      userId: `user-${Date.now()}`,
      name: name.trim(),
      email: email || '',
      phone: req.body.phone || '',
      specialization: specialization || 'General Strength',
      experienceYears: Number(req.body.experienceYears) || 2,
      certifications: req.body.certifications || ['Certified Personal Trainer'],
      bio: req.body.bio || '',
      status: 'ACTIVE' as const,
      assignedMemberIds: [],
      rating: 5.0,
      avatar: req.body.avatar,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.trainers.push(newTrainer);
    dbService.persist();
    res.status(201).json({ success: true, message: 'Trainer added successfully', data: newTrainer });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/trainers/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const index = db.trainers.findIndex((t) => t._id === req.params.id && t.gymId === req.user!.gymId);
    if (index === -1) throw new Error('Trainer not found');
    db.trainers[index] = { ...db.trainers[index], ...req.body, updatedAt: new Date().toISOString() };
    dbService.persist();
    res.json({ success: true, message: 'Trainer updated successfully', data: db.trainers[index] });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/trainers/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const index = db.trainers.findIndex((t) => t._id === req.params.id && t.gymId === req.user!.gymId);
    if (index === -1) throw new Error('Trainer not found');
    db.trainers.splice(index, 1);
    dbService.persist();
    res.json({ success: true, message: 'Trainer removed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== PAYMENTS & INVOICES ====================

router.get('/payments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Member authorization check
    if (req.user!.role === 'MEMBER') {
      const db = dbService.getRawDb();
      const ownMember = db.members.find(
        (m) => m.gymId === req.user!.gymId && (m._id === req.user!.userId || m.email.toLowerCase() === req.user!.email.toLowerCase())
      );
      if (!ownMember) return res.json({ success: true, data: [] });
      const payments = dbService.getPayments(req.user!.gymId).filter((p) => p.memberId === ownMember._id);
      return res.json({ success: true, data: payments });
    }

    const payments = await PaymentService.getPayments(req.user!.gymId);
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/payments', authenticate, requireRoles('OWNER', 'ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, amount, paymentMethod } = req.body;
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }
    const payment = await PaymentService.recordPayment(req.user!.gymId, {
      ...req.body,
      amount: numAmount,
      paymentMethod: paymentMethod || 'CARD',
    });
    res.status(201).json({ success: true, message: 'Payment recorded successfully', data: payment });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/payments/invoice/:invoiceNumber', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await PaymentService.getInvoice(req.user!.gymId, req.params.invoiceNumber);
    res.json({ success: true, data: invoice });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// ==================== EXPENSES ====================

router.get('/expenses', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await ExpenseService.getExpenses(req.user!.gymId);
    res.json({ success: true, data: expenses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/expenses', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Expense description is required.' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero.' });
    }
    const expense = await ExpenseService.addExpense(req.user!.gymId, { ...req.body, amount: numAmount });
    res.status(201).json({ success: true, message: 'Expense added', data: expense });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/expenses/:id', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await ExpenseService.deleteExpense(req.user!.gymId, req.params.id);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== WORKOUT PLANS ====================

router.get('/workouts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.query.memberId as string;
    const plans = await WorkoutService.getWorkouts(req.user!.gymId, memberId);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/workouts', authenticate, requireRoles('OWNER', 'ADMIN', 'TRAINER'), async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, title } = req.body;
    if (!memberId || !title?.trim()) {
      return res.status(400).json({ success: false, message: 'Target member and plan title are required.' });
    }
    const plan = await WorkoutService.createWorkout(req.user!.gymId, req.body);
    res.status(201).json({ success: true, message: 'Workout routine assigned', data: plan });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== NOTIFICATIONS ====================

router.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifs = dbService.getNotifications(req.user!.gymId);
    res.json({ success: true, data: notifs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const notif = db.notifications.find((n) => n._id === req.params.id && n.gymId === req.user!.gymId);
    if (notif) {
      notif.isRead = true;
      dbService.persist();
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    db.notifications.forEach((n) => {
      if (n.gymId === req.user!.gymId) n.isRead = true;
    });
    dbService.persist();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== GYM SETTINGS ====================

router.get('/gym/settings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const gym = db.gyms.find((g) => g._id === req.user!.gymId);
    res.json({ success: true, data: gym });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

router.put('/gym/settings', authenticate, requireRoles('OWNER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const db = dbService.getRawDb();
    const gym = db.gyms.find((g) => g._id === req.user!.gymId);
    if (!gym) throw new Error('Gym not found');
    Object.assign(gym, req.body, { updatedAt: new Date().toISOString() });
    dbService.persist();
    res.json({ success: true, message: 'Gym configuration saved', data: gym });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== PUBLIC CONTACT & DEMO RESET ====================

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }
    const db = dbService.getRawDb();
    const msg = {
      _id: `msg-${Date.now()}`,
      name: name.trim(),
      gymName: req.body.gymName || '',
      email: email.trim(),
      phone: req.body.phone || '',
      subject: req.body.subject || 'Sales Inquiry',
      message: message.trim(),
      status: 'NEW' as const,
      createdAt: new Date().toISOString(),
    };
    db.contactMessages.unshift(msg);
    dbService.persist();
    res.status(201).json({ success: true, message: 'Inquiry received. A FITCORE representative will reach out shortly.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/system/reset-demo', async (req, res) => {
  try {
    dbService.resetToSeed();
    res.json({ success: true, message: 'Demo environment reset to initial state.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
