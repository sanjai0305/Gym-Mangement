import { dbService } from '../models/db';
import { Payment } from '../types';

export class PaymentService {
  public static async getPayments(gymId: string): Promise<any[]> {
    const db = dbService.getRawDb();
    const payments = dbService.getPayments(gymId);
    const members = dbService.getMembers(gymId);

    return payments.map((p) => {
      const member = members.find((m) => m._id === p.memberId);
      return {
        ...p,
        memberName: member ? member.name : p.memberName || 'Member',
        memberCode: member ? member.memberId : '',
      };
    });
  }

  public static async recordPayment(
    gymId: string,
    data: {
      memberId: string;
      amount: number;
      paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
      membershipId?: string;
      notes?: string;
      date?: string;
    }
  ): Promise<Payment> {
    const db = dbService.getRawDb();
    const member = db.members.find((m) => m._id === data.memberId && m.gymId === gymId);
    if (!member) throw new Error('Member not found');

    const nowIso = new Date().toISOString();
    const today = data.date || nowIso.split('T')[0];

    const newPayment: Payment = {
      _id: `pay-${Date.now()}`,
      gymId,
      memberId: member._id,
      memberName: member.name,
      membershipId: data.membershipId,
      transactionId: dbService.getNextTransactionId(),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      status: 'PAID',
      paymentDate: today,
      invoiceNumber: dbService.getNextInvoiceNumber(),
      notes: data.notes,
      createdAt: nowIso,
    };

    db.payments.unshift(newPayment);

    // If membershipId supplied, update paymentStatus to PAID
    if (data.membershipId) {
      const mship = db.memberships.find((m) => m._id === data.membershipId && m.gymId === gymId);
      if (mship) {
        mship.paymentStatus = 'PAID';
        mship.updatedAt = nowIso;
      }
    }

    // Auto notification
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      gymId,
      title: 'Payment Received',
      message: `Received ${gymId ? '₹' : '$'}${data.amount.toLocaleString()} from ${member.name} (${data.paymentMethod}).`,
      type: 'PAYMENT_RECEIVED',
      isRead: false,
      createdAt: nowIso,
    });

    dbService.persist();
    return newPayment;
  }

  public static async getInvoice(gymId: string, invoiceNumber: string): Promise<any> {
    const db = dbService.getRawDb();
    const payment = db.payments.find((p) => p.invoiceNumber === invoiceNumber && p.gymId === gymId);
    if (!payment) throw new Error('Invoice not found');

    const gym = db.gyms.find((g) => g._id === gymId);
    const member = db.members.find((m) => m._id === payment.memberId);
    const membership = payment.membershipId
      ? db.memberships.find((m) => m._id === payment.membershipId)
      : null;
    const plan = membership
      ? db.membershipPlans.find((p) => p._id === membership.planId)
      : null;

    return {
      invoiceNumber: payment.invoiceNumber,
      transactionId: payment.transactionId,
      date: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      status: payment.status,
      notes: payment.notes,
      gym: {
        name: gym?.name,
        address: gym?.address,
        phone: gym?.phone,
        email: gym?.email,
        currency: gym?.currency || '₹',
      },
      member: {
        name: member?.name,
        memberId: member?.memberId,
        email: member?.email,
        phone: member?.phone,
        address: member?.address,
      },
      plan: plan
        ? {
            name: plan.name,
            durationMonths: plan.durationMonths,
            features: plan.features,
          }
        : null,
      subtotal: Math.round(payment.amount / 1.18),
      taxGst: Math.round(payment.amount - payment.amount / 1.18),
      total: payment.amount,
    };
  }
}
