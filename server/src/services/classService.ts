import { dbService } from '../models/db';
import { ClassSession } from '../types';

export class ClassService {
  public static async getClasses(gymId: string, date?: string): Promise<any[]> {
    const db = dbService.getRawDb();
    let classes = dbService.getClasses(gymId);
    if (date) {
      classes = classes.filter((c) => c.date === date);
    }
    const trainers = dbService.getTrainers(gymId);
    const members = dbService.getMembers(gymId);

    return classes.map((c) => {
      const trainer = trainers.find((t) => t._id === c.trainerId);
      const enrolled = (c.enrolledMemberIds || []).map((id) => {
        const m = members.find((mem) => mem._id === id);
        return {
          _id: id,
          name: m?.name || 'Member',
          memberId: m?.memberId || '',
          profileImage: m?.profileImage,
          checkedIn: (c.checkedInMemberIds || []).includes(id),
        };
      });

      return {
        ...c,
        trainerName: trainer ? trainer.name : c.trainerName || 'Coach',
        trainerAvatar: trainer?.avatar,
        trainerSpecialization: trainer?.specialization,
        enrolledCount: c.enrolledMemberIds?.length || 0,
        enrolledList: enrolled,
        availableSlots: Math.max(0, c.capacity - (c.enrolledMemberIds?.length || 0)),
        isFull: (c.enrolledMemberIds?.length || 0) >= c.capacity,
      };
    });
  }

  public static async getClassById(gymId: string, classId: string): Promise<any> {
    const classes = await this.getClasses(gymId);
    const item = classes.find((c) => c._id === classId);
    if (!item) throw new Error('Class session not found');
    return item;
  }

  public static async createClass(gymId: string, data: Partial<ClassSession>): Promise<ClassSession> {
    const db = dbService.getRawDb();
    const nowIso = new Date().toISOString();

    const trainer = db.trainers.find((t) => t._id === data.trainerId && t.gymId === gymId);

    const newClass: ClassSession = {
      _id: `cls-${Date.now()}`,
      gymId,
      name: data.name || 'Group Training Session',
      description: data.description || '',
      trainerId: data.trainerId || (trainer ? trainer._id : 'trainer-01'),
      trainerName: trainer ? trainer.name : 'Head Coach',
      date: data.date || nowIso.split('T')[0],
      startTime: data.startTime || '18:00',
      endTime: data.endTime || '19:00',
      room: data.room || 'Main Studio',
      capacity: data.capacity || 20,
      enrolledMemberIds: data.enrolledMemberIds || [],
      waitlistMemberIds: [],
      checkedInMemberIds: [],
      status: 'SCHEDULED',
      category: data.category || 'CrossFit',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.classes.push(newClass);
    dbService.persist();
    return newClass;
  }

  public static async enrollMember(gymId: string, classId: string, memberId: string): Promise<{ success: boolean; message: string; waitlisted: boolean }> {
    const db = dbService.getRawDb();
    const session = db.classes.find((c) => c._id === classId && c.gymId === gymId);
    if (!session) throw new Error('Class session not found');

    const member = db.members.find((m) => m._id === memberId && m.gymId === gymId);
    if (!member) throw new Error('Member not found');

    if (session.enrolledMemberIds.includes(memberId)) {
      throw new Error(`${member.name} is already booked in this session.`);
    }

    if (session.enrolledMemberIds.length >= session.capacity) {
      // Add to waitlist
      if (!session.waitlistMemberIds.includes(memberId)) {
        session.waitlistMemberIds.push(memberId);
        dbService.persist();
      }
      return {
        success: true,
        message: `${member.name} placed on Waitlist (#${session.waitlistMemberIds.length}) due to full capacity.`,
        waitlisted: true,
      };
    }

    session.enrolledMemberIds.push(memberId);
    dbService.persist();

    return {
      success: true,
      message: `Successfully booked spot for ${member.name} in ${session.name}!`,
      waitlisted: false,
    };
  }

  public static async cancelEnrollment(gymId: string, classId: string, memberId: string): Promise<void> {
    const db = dbService.getRawDb();
    const session = db.classes.find((c) => c._id === classId && c.gymId === gymId);
    if (!session) throw new Error('Class not found');

    session.enrolledMemberIds = session.enrolledMemberIds.filter((id) => id !== memberId);
    session.waitlistMemberIds = session.waitlistMemberIds.filter((id) => id !== memberId);

    // If there's anyone on waitlist, move the first member up
    if (session.waitlistMemberIds.length > 0 && session.enrolledMemberIds.length < session.capacity) {
      const nextMemberId = session.waitlistMemberIds.shift()!;
      session.enrolledMemberIds.push(nextMemberId);
    }

    dbService.persist();
  }

  public static async toggleCheckIn(gymId: string, classId: string, memberId: string): Promise<boolean> {
    const db = dbService.getRawDb();
    const session = db.classes.find((c) => c._id === classId && c.gymId === gymId);
    if (!session) throw new Error('Class not found');

    if (!session.checkedInMemberIds) session.checkedInMemberIds = [];

    const index = session.checkedInMemberIds.indexOf(memberId);
    let checked = false;
    if (index > -1) {
      session.checkedInMemberIds.splice(index, 1);
      checked = false;
    } else {
      session.checkedInMemberIds.push(memberId);
      checked = true;
    }

    dbService.persist();
    return checked;
  }
}
