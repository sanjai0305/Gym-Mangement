import { dbService } from '../models/db';
import { Attendance } from '../types';

export class AttendanceService {
  public static async checkIn(
    gymId: string,
    data: {
      memberId: string; // can be internal _id or formatted memberId (e.g. FIT-008921)
      method?: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC';
      turnstile?: string;
    }
  ): Promise<{ attendance: Attendance; message: string }> {
    const db = dbService.getRawDb();
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Look up member by _id or memberId
    const member = db.members.find(
      (m) =>
        m.gymId === gymId &&
        (m._id === data.memberId || m.memberId.toLowerCase() === data.memberId.toLowerCase())
    );

    if (!member) {
      throw new Error(`Member '${data.memberId}' not found.`);
    }

    // Business Logic Rule 1: Prevent attendance if membership is expired or frozen
    const memberships = db.memberships
      .filter((m) => m.memberId === member._id && m.gymId === gymId)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    const latestMembership = memberships[0];

    if (!latestMembership) {
      throw new Error(`Access Denied: Member ${member.name} has no active membership plan on record.`);
    }

    if (member.status === 'FROZEN') {
      throw new Error(`Access Denied: Membership for ${member.name} is currently FROZEN.`);
    }

    const endMs = new Date(latestMembership.endDate).getTime();
    const todayMs = new Date(today).getTime();
    if (endMs < todayMs || member.status === 'EXPIRED') {
      throw new Error(`Access Denied: Membership expired on ${latestMembership.endDate}. Please renew before check-in.`);
    }

    // Business Logic Rule 2: Prevent duplicate check-in for the same day
    const existingToday = db.attendances.find(
      (a) => a.gymId === gymId && a.memberId === member._id && a.date === today
    );

    if (existingToday) {
      throw new Error(`Member ${member.name} has already checked in today at ${new Date(existingToday.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
    }

    const newAttendance: Attendance = {
      _id: `att-${Date.now()}`,
      gymId,
      memberId: member._id,
      checkIn: nowIso,
      method: data.method || 'MANUAL',
      date: today,
      turnstile: data.turnstile || 'Turnstile #01',
      createdAt: nowIso,
    };

    db.attendances.unshift(newAttendance);
    dbService.persist();

    return {
      attendance: newAttendance,
      message: `Access Granted. Welcome ${member.name}! (${newAttendance.turnstile})`,
    };
  }

  public static async checkOut(gymId: string, attendanceId: string): Promise<Attendance> {
    const db = dbService.getRawDb();
    const att = db.attendances.find((a) => a._id === attendanceId && a.gymId === gymId);
    if (!att) {
      throw new Error('Attendance entry not found');
    }

    const nowIso = new Date().toISOString();
    const checkInTime = new Date(att.checkIn).getTime();
    const checkOutTime = new Date(nowIso).getTime();
    const durationMinutes = Math.round((checkOutTime - checkInTime) / (1000 * 60));

    att.checkOut = nowIso;
    att.durationMinutes = Math.max(durationMinutes, 1);
    dbService.persist();
    return att;
  }

  public static async getDailyAttendance(gymId: string, date?: string): Promise<any[]> {
    const db = dbService.getRawDb();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const attendances = db.attendances.filter((a) => a.gymId === gymId && a.date === targetDate);

    return attendances.map((a) => {
      const member = db.members.find((m) => m._id === a.memberId);
      return {
        ...a,
        memberName: member ? member.name : 'Unknown Member',
        memberCode: member ? member.memberId : '',
        profileImage: member?.profileImage,
      };
    });
  }

  public static async getStats(gymId: string): Promise<any> {
    const db = dbService.getRawDb();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendances = db.attendances.filter((a) => a.gymId === gymId && a.date === today);

    return {
      todayCount: todayAttendances.length,
      currentOccupancy: Math.min(todayAttendances.length * 3 + 45, 140),
      maxCapacity: 140,
      peakTime: '19:00',
    };
  }
}
