import { dbService } from '../models/db';
import { Member, Membership } from '../types';

export class MemberService {
  public static async getMembers(
    gymId: string,
    filters?: {
      search?: string;
      status?: string;
      tier?: string;
      trainerId?: string;
    }
  ): Promise<any[]> {
    const db = dbService.getRawDb();
    let members = dbService.getMembers(gymId);
    const plans = dbService.getMembershipPlans(gymId);
    const memberships = dbService.getMemberships(gymId);
    const trainers = dbService.getTrainers(gymId);
    const attendances = dbService.getAttendances(gymId);

    const today = new Date().toISOString().split('T')[0];

    // Compute active membership & status calculations dynamically
    let enriched = members.map((member) => {
      // Find latest membership
      const memberMships = memberships
        .filter((m) => m.memberId === member._id)
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

      const activeMship = memberMships[0];
      let plan = activeMship ? plans.find((p) => p._id === activeMship.planId) : null;
      let trainer = member.assignedTrainerId ? trainers.find((t) => t._id === member.assignedTrainerId) : null;

      // Calculate days remaining
      let daysRemaining = 0;
      let effectiveStatus = member.status;

      if (activeMship) {
        const endMs = new Date(activeMship.endDate).getTime();
        const todayMs = new Date(today).getTime();
        const diffDays = Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (diffDays < 0 && effectiveStatus !== 'FROZEN') {
          effectiveStatus = 'EXPIRED';
        }
      }

      // Member visits count
      const memberVisits = attendances.filter((a) => a.memberId === member._id).length;

      return {
        ...member,
        status: effectiveStatus,
        activeMembership: activeMship,
        planName: plan ? plan.name : 'No Active Plan',
        planId: plan ? plan._id : null,
        daysRemaining,
        trainerName: trainer ? trainer.name : 'Unassigned',
        visitsCount: memberVisits,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.memberId.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        enriched = enriched.filter((m) => m.status === 'ACTIVE');
      } else if (filters.status === 'expiring') {
        enriched = enriched.filter((m) => m.status === 'ACTIVE' && m.daysRemaining <= 7 && m.daysRemaining >= 0);
      } else if (filters.status === 'expired') {
        enriched = enriched.filter((m) => m.status === 'EXPIRED');
      } else if (filters.status === 'suspended' || filters.status === 'frozen') {
        enriched = enriched.filter((m) => m.status === 'FROZEN' || m.status === 'CANCELLED');
      }
    }

    if (filters?.tier && filters.tier !== 'all') {
      enriched = enriched.filter((m) => {
        if (!m.planName) return false;
        return m.planName.toLowerCase().includes(filters.tier.toLowerCase());
      });
    }

    if (filters?.trainerId && filters.trainerId !== 'all') {
      if (filters.trainerId === 'none') {
        enriched = enriched.filter((m) => !m.assignedTrainerId);
      } else {
        enriched = enriched.filter((m) => m.assignedTrainerId === filters.trainerId);
      }
    }

    return enriched;
  }

  public static async getMemberById(gymId: string, memberId: string): Promise<any> {
    const db = dbService.getRawDb();
    const member = db.members.find((m) => m._id === memberId && m.gymId === gymId);
    if (!member) {
      throw new Error('Member not found');
    }

    const memberships = db.memberships
      .filter((m) => m.memberId === memberId && m.gymId === gymId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const activeMship = memberships[0];
    const plan = activeMship ? db.membershipPlans.find((p) => p._id === activeMship.planId) : null;
    const trainer = member.assignedTrainerId ? db.trainers.find((t) => t._id === member.assignedTrainerId) : null;
    const attendances = db.attendances
      .filter((a) => a.memberId === memberId && a.gymId === gymId)
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
    const payments = db.payments
      .filter((p) => p.memberId === memberId && p.gymId === gymId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    const workouts = db.workoutPlans
      .filter((w) => w.memberId === memberId && w.gymId === gymId);

    const today = new Date().toISOString().split('T')[0];
    let daysRemaining = 0;
    if (activeMship) {
      const endMs = new Date(activeMship.endDate).getTime();
      const todayMs = new Date(today).getTime();
      daysRemaining = Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24));
    }

    return {
      ...member,
      activeMembership: activeMship,
      membershipHistory: memberships,
      plan,
      trainer,
      attendances,
      payments,
      workouts,
      daysRemaining,
    };
  }

  public static async createMember(gymId: string, data: Partial<Member> & { planId?: string }): Promise<Member> {
    const db = dbService.getRawDb();
    const newMemberId = dbService.getNextMemberId();
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    const member: Member = {
      _id: `mem-${Date.now()}`,
      memberId: newMemberId,
      gymId,
      name: data.name || 'New Member',
      email: data.email || '',
      phone: data.phone || '',
      gender: data.gender || 'other',
      dateOfBirth: data.dateOfBirth,
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      joiningDate: data.joiningDate || today,
      status: 'ACTIVE',
      profileImage: data.profileImage,
      notes: data.notes || '',
      weightKg: data.weightKg || 70,
      heightCm: data.heightCm || 175,
      bodyFatPercentage: data.bodyFatPercentage || 18,
      attendanceRate: 100,
      assignedTrainerId: data.assignedTrainerId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.members.unshift(member);

    // If a plan was selected during member creation, assign membership
    if (data.planId) {
      const plan = db.membershipPlans.find((p) => p._id === data.planId && p.gymId === gymId);
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        const newMembership: Membership = {
          _id: `mship-${Date.now()}`,
          gymId,
          memberId: member._id,
          planId: plan._id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          amount: plan.price,
          discount: 0,
          paymentStatus: 'PAID',
          status: 'ACTIVE',
          autoRenew: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        db.memberships.unshift(newMembership);

        // Record initial payment & invoice
        db.payments.unshift({
          _id: `pay-${Date.now()}`,
          gymId,
          memberId: member._id,
          memberName: member.name,
          membershipId: newMembership._id,
          transactionId: dbService.getNextTransactionId(),
          amount: plan.price,
          paymentMethod: 'CARD',
          status: 'PAID',
          paymentDate: today,
          invoiceNumber: dbService.getNextInvoiceNumber(),
          notes: `Initial Enrollment - ${plan.name}`,
          createdAt: nowIso,
        });
      }
    }

    // Add notification
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      gymId,
      title: 'New Member Registered',
      message: `${member.name} (${member.memberId}) registered successfully.`,
      type: 'NEW_MEMBER',
      isRead: false,
      createdAt: nowIso,
    });

    dbService.persist();
    return member;
  }

  public static async updateMember(gymId: string, memberId: string, data: Partial<Member>): Promise<Member> {
    const db = dbService.getRawDb();
    const index = db.members.findIndex((m) => m._id === memberId && m.gymId === gymId);
    if (index === -1) {
      throw new Error('Member not found');
    }
    const updated = {
      ...db.members[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    db.members[index] = updated;
    dbService.persist();
    return updated;
  }

  public static async deleteMember(gymId: string, memberId: string): Promise<void> {
    const db = dbService.getRawDb();
    db.members = db.members.filter((m) => !(m._id === memberId && m.gymId === gymId));
    dbService.persist();
  }

  public static async freezeMember(gymId: string, memberId: string, reason?: string): Promise<Member> {
    const member = await this.getMemberById(gymId, memberId);
    return this.updateMember(gymId, memberId, {
      status: 'FROZEN',
      notes: reason ? `${member.notes || ''} [Frozen: ${reason}]` : member.notes,
    });
  }

  public static async renewMembership(gymId: string, memberId: string, planId: string): Promise<Membership> {
    const db = dbService.getRawDb();
    const plan = db.membershipPlans.find((p) => p._id === planId && p.gymId === gymId);
    if (!plan) throw new Error('Membership Plan not found');

    const member = db.members.find((m) => m._id === memberId && m.gymId === gymId);
    if (!member) throw new Error('Member not found');

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDateObj = new Date(now);
    endDateObj.setMonth(endDateObj.getMonth() + plan.durationMonths);
    const endDate = endDateObj.toISOString().split('T')[0];
    const nowIso = now.toISOString();

    const membership: Membership = {
      _id: `mship-${Date.now()}`,
      gymId,
      memberId,
      planId,
      startDate,
      endDate,
      amount: plan.price,
      discount: 0,
      paymentStatus: 'PAID',
      status: 'ACTIVE',
      autoRenew: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.memberships.unshift(membership);

    // Update member status back to active
    const memIndex = db.members.findIndex((m) => m._id === memberId);
    if (memIndex !== -1) {
      db.members[memIndex].status = 'ACTIVE';
      db.members[memIndex].updatedAt = nowIso;
    }

    // Auto-record payment transaction
    db.payments.unshift({
      _id: `pay-${Date.now()}`,
      gymId,
      memberId,
      memberName: member.name,
      membershipId: membership._id,
      transactionId: dbService.getNextTransactionId(),
      amount: plan.price,
      paymentMethod: 'CARD',
      status: 'PAID',
      paymentDate: startDate,
      invoiceNumber: dbService.getNextInvoiceNumber(),
      notes: `Renewal: ${plan.name}`,
      createdAt: nowIso,
    });

    dbService.persist();
    return membership;
  }
}
