import { dbService } from '../models/db';
import { WorkoutPlan } from '../types';

export class WorkoutService {
  public static async getWorkouts(gymId: string, memberId?: string): Promise<any[]> {
    const db = dbService.getRawDb();
    let workouts = dbService.getWorkouts(gymId);
    if (memberId) {
      workouts = workouts.filter((w) => w.memberId === memberId);
    }
    const members = dbService.getMembers(gymId);
    const trainers = dbService.getTrainers(gymId);

    return workouts.map((w) => {
      const member = members.find((m) => m._id === w.memberId);
      const trainer = trainers.find((t) => t._id === w.trainerId);
      return {
        ...w,
        memberName: member ? member.name : 'Member',
        memberCode: member ? member.memberId : '',
        trainerName: trainer ? trainer.name : 'Coach',
      };
    });
  }

  public static async createWorkout(gymId: string, data: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const db = dbService.getRawDb();
    const nowIso = new Date().toISOString();

    const plan: WorkoutPlan = {
      _id: `wo-${Date.now()}`,
      gymId,
      memberId: data.memberId || '',
      trainerId: data.trainerId || 'trainer-01',
      name: data.name || 'Custom Conditioning Plan',
      goal: data.goal || 'General Fitness & Stamina',
      exercises: data.exercises || [],
      startDate: data.startDate || nowIso.split('T')[0],
      endDate: data.endDate || '',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.workoutPlans.unshift(plan);

    // Auto notification
    db.notifications.unshift({
      _id: `notif-${Date.now()}`,
      gymId,
      title: 'New Workout Routine Assigned',
      message: `Assigned routine "${plan.name}" with ${plan.exercises.length} exercises.`,
      type: 'WORKOUT_ASSIGNED',
      isRead: false,
      createdAt: nowIso,
    });

    dbService.persist();
    return plan;
  }
}
