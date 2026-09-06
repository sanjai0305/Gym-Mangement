import fs from 'fs';
import path from 'path';
import {
  User,
  Gym,
  Member,
  MembershipPlan,
  Membership,
  Attendance,
  Trainer,
  ClassSession,
  Payment,
  Expense,
  WorkoutPlan,
  NotificationItem,
  ContactMessage
} from '../types';

export interface FitcoreDatabase {
  users: User[];
  gyms: Gym[];
  members: Member[];
  membershipPlans: MembershipPlan[];
  memberships: Membership[];
  attendances: Attendance[];
  trainers: Trainer[];
  classes: ClassSession[];
  payments: Payment[];
  expenses: Expense[];
  workoutPlans: WorkoutPlan[];
  notifications: NotificationItem[];
  contactMessages: ContactMessage[];
  counters: {
    member: number;
    invoice: number;
    transaction: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fitcore_db.json');

class DatabaseService {
  private db: FitcoreDatabase;
  private initialized = false;

  constructor() {
    this.db = this.getDefaultSeedData();
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(fileContent);
      } else {
        this.persist();
      }
      this.initialized = true;
    } catch (err) {
      console.error('Failed to load DB file, using default seed:', err);
      this.db = this.getDefaultSeedData();
    }
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  public getRawDb(): FitcoreDatabase {
    return this.db;
  }

  // ID Generators
  public getNextMemberId(): string {
    this.db.counters.member += 1;
    this.persist();
    return `FIT-${String(this.db.counters.member).padStart(6, '0')}`;
  }

  public getNextInvoiceNumber(): string {
    this.db.counters.invoice += 1;
    this.persist();
    const year = new Date().getFullYear();
    return `INV-${year}-${String(this.db.counters.invoice).padStart(6, '0')}`;
  }

  public getNextTransactionId(): string {
    this.db.counters.transaction += 1;
    this.persist();
    return `TXN-${String(this.db.counters.transaction).padStart(6, '0')}`;
  }

  // Multi-tenant isolation helpers
  public getUsersByGym(gymId: string): User[] {
    return this.db.users.filter((u) => u.gymId === gymId);
  }

  public getMembers(gymId: string): Member[] {
    return this.db.members.filter((m) => m.gymId === gymId);
  }

  public getMembershipPlans(gymId: string): MembershipPlan[] {
    return this.db.membershipPlans.filter((p) => p.gymId === gymId);
  }

  public getMemberships(gymId: string): Membership[] {
    return this.db.memberships.filter((m) => m.gymId === gymId);
  }

  public getAttendances(gymId: string): Attendance[] {
    return this.db.attendances.filter((a) => a.gymId === gymId);
  }

  public getTrainers(gymId: string): Trainer[] {
    return this.db.trainers.filter((t) => t.gymId === gymId);
  }

  public getClasses(gymId: string): ClassSession[] {
    return this.db.classes.filter((c) => c.gymId === gymId);
  }

  public getPayments(gymId: string): Payment[] {
    return this.db.payments.filter((p) => p.gymId === gymId);
  }

  public getExpenses(gymId: string): Expense[] {
    return this.db.expenses.filter((e) => e.gymId === gymId);
  }

  public getWorkouts(gymId: string): WorkoutPlan[] {
    return this.db.workoutPlans.filter((w) => w.gymId === gymId);
  }

  public getNotifications(gymId: string): NotificationItem[] {
    return this.db.notifications
      .filter((n) => n.gymId === gymId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public resetToSeed() {
    this.db = this.getDefaultSeedData();
    this.persist();
  }

  private getDefaultSeedData(): FitcoreDatabase {
    const defaultGymId = 'gym-metropolis-01';
    const ownerUserId = 'user-marcus-owner';
    const adminUserId = 'user-sarah-admin';
    const receptionistUserId = 'user-mark-reception';
    const trainer1UserId = 'user-tanya-trainer';
    const trainer2UserId = 'user-alex-trainer';
    const trainer3UserId = 'user-karen-trainer';
    const member1UserId = 'user-sophia-member';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const gym: Gym = {
      _id: defaultGymId,
      name: 'Metropolis Downtown Performance Hub',
      ownerId: ownerUserId,
      logo: 'https://lh3.googleusercontent.com/aida/AEtjO1W3mdkTN67vWV1-aZxwZVoTm0ekB90dMaj1U54MhKHyB1b8VjA1aqUGyt4PB80jvNEL8qtMbAXOmefTQqiJDfaa3MGmm-ZiJexh378IVa2DU0EbmxkB7-fUM_THjh74TryvOaQ9tCT0jmw7stbo9I8_YTeJqw7uzmX7yU5QtL_2-oa5yiaU4TTsn1GHeVkBcGh2ikQVp0mLU9-aqsY6-anzxvYKCwIcGkKxoT404hJ02DhqPwwiKCVEUMs',
      email: 'downtown@fitcore.com',
      phone: '+1 (555) 019-2831',
      whatsapp: '+15550192831',
      address: '742 Grand Performance Ave, Floor 2, Metropolis City',
      website: 'https://fitcore.io',
      openingHours: '05:30 AM - 11:00 PM',
      timezone: 'America/New_York',
      currency: '₹',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const users: User[] = [
      {
        _id: ownerUserId,
        name: 'Marcus Vance',
        email: 'owner@fitcore.com',
        phone: '+1 (555) 300-1100',
        password: 'password123',
        role: 'OWNER',
        gymId: defaultGymId,
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs2Bu0g46-6KuCvbRgkafVaLWWKR7E-Mbrt76lacF-4cP9vMOA7OkuJieLvUQYcoSBmirlttg8OJOYXuvOO7LApE6lZ-F-NVidj9VqeYhJKhsEssrN1rJF1WgtBNCGFhMcwMuHCWwF3NxFMeaToWf4QY7MoII-FKjCSQiycshaWEsHoo0RwTSnuT_s2gxFhYNyzFoypaFMPfCUFPAkUeAIrikKYNbeh__xMMoewZ_fNrBPlXJ0itGs',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: adminUserId,
        name: 'Sarah Jenkins',
        email: 'admin@fitcore.com',
        phone: '+1 (555) 300-1101',
        password: 'password123',
        role: 'ADMIN',
        gymId: defaultGymId,
        isActive: true,
        createdAt: '2024-01-05T00:00:00.000Z',
        updatedAt: '2024-01-05T00:00:00.000Z',
      },
      {
        _id: receptionistUserId,
        name: 'Mark Gable',
        email: 'reception@fitcore.com',
        phone: '+1 (555) 300-1102',
        password: 'password123',
        role: 'RECEPTIONIST',
        gymId: defaultGymId,
        isActive: true,
        createdAt: '2024-01-10T00:00:00.000Z',
        updatedAt: '2024-01-10T00:00:00.000Z',
      },
      {
        _id: trainer1UserId,
        name: 'Coach Tanya Sharma',
        email: 'trainer@fitcore.com',
        phone: '+1 (555) 300-1103',
        password: 'password123',
        role: 'TRAINER',
        gymId: defaultGymId,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        _id: trainer2UserId,
        name: 'Coach Alex Mercer',
        email: 'alex.mercer@fitcore.com',
        phone: '+1 (555) 300-1104',
        password: 'password123',
        role: 'TRAINER',
        gymId: defaultGymId,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        _id: trainer3UserId,
        name: 'Coach Karen Reed',
        email: 'karen.reed@fitcore.com',
        phone: '+1 (555) 300-1105',
        password: 'password123',
        role: 'TRAINER',
        gymId: defaultGymId,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        _id: member1UserId,
        name: 'Sophia Martinez',
        email: 'member@fitcore.com',
        phone: '+1 (555) 389-1029',
        password: 'password123',
        role: 'MEMBER',
        gymId: defaultGymId,
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdPfC7U_hJjEio_dWYzL85gzRku6HHKd_uh6GJqFcsHpCn2AuhsfLhUq6DwbrmaK_oTnjjUtQ95Lw0W50sXCei4CN2opW7n4UNxjNvk0tyuu492pKUDhUWZIVbu1ch5XgboOkgCq_CftBkxDja-2JTi4EwW2IcSsa_OpPatZYiQACtkl-BM4xwK4LeWwU1Meqv57x-gUoAGkkI32NEG3fAL4NdM5IvpggPIi12dZKZ8cQji6QPjRu',
        isActive: true,
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
      }
    ];

    const membershipPlans: MembershipPlan[] = [
      {
        _id: 'plan-basic-quarterly',
        gymId: defaultGymId,
        name: 'Basic Quarterly',
        description: 'Standard cardio and machine area access with digital locker keys.',
        price: 4999,
        durationMonths: 3,
        features: ['Main Gym Floor', 'Locker Room Access', 'Standard Check-in', '1 Class/Month'],
        maxClasses: 3,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: 'plan-standard-core',
        gymId: defaultGymId,
        name: 'Standard Core',
        description: 'Full open gym floor, steam room, group classes, and app schedule syncing.',
        price: 8999,
        durationMonths: 6,
        features: ['Full Gym Floor', 'Steam & Sauna', '10 Group Classes/mo', 'Telemetry App Access'],
        maxClasses: 20,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: 'plan-premium-annual',
        gymId: defaultGymId,
        name: 'Premium Annual (All Access)',
        description: 'VIP 24/7 access, unlimited boutique classes, quarterly body composition scan.',
        price: 15999,
        durationMonths: 12,
        features: ['24/7 Turnstile Entry', 'Unlimited CrossFit & Yoga', 'Dedicated Trainer Consult', 'Priority Towel Service'],
        maxClasses: 999,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: 'plan-strength-elite',
        gymId: defaultGymId,
        name: 'Strength Elite VIP',
        description: 'Olympic platforms, powerlifting bay, personal nutritional coach and custom plan.',
        price: 24999,
        durationMonths: 12,
        features: ['VIP Olympic Platform Access', 'Weekly PT Session', 'Custom Macro Nutrition Plan', 'Recovery Ice Bath Sessions'],
        maxClasses: 999,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }
    ];

    const trainers: Trainer[] = [
      {
        _id: 'trainer-01',
        gymId: defaultGymId,
        userId: trainer1UserId,
        name: 'Coach Tanya Sharma',
        email: 'tanya.sharma@fitcore.com',
        phone: '+1 (555) 300-1103',
        specialization: 'CrossFit L-3 & High-Intensity Conditioning',
        experienceYears: 7,
        certifications: ['CrossFit Level 3', 'USAW Sports Performance', 'First Aid CPR'],
        bio: 'Former national decathlete specializing in Olympic weightlifting technique and metabolic conditioning.',
        status: 'ACTIVE',
        assignedMemberIds: ['mem-001', 'mem-003', 'mem-007'],
        rating: 4.9,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1uuEaLxLdHXDv2AgjwKyoMM1r12bsOL8rKCje4F5cT1-DdJAKXSua-R9nkK48kEvcaNokg5p2UbfaR1nCCMS4fw5MA_jkonmFDwT82H89hrjbQi79oMfxEw4HBlerd55YoFkbIVQtr-FxvKWmhHG_ltjDmah4e7wIDCJQNK3RrEmDeVkuXPwdVsWQTTBqLH2TIKrLbZ7hXEBMLAJg2c-9LN5R-9-dlRggJi0NDSbPh2sTsjnvYzo',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        _id: 'trainer-02',
        gymId: defaultGymId,
        userId: trainer2UserId,
        name: 'Coach Alex Mercer',
        email: 'alex.mercer@fitcore.com',
        phone: '+1 (555) 300-1104',
        specialization: 'Hypertrophy & Strength Bio-Mechanics',
        experienceYears: 9,
        certifications: ['CSCS Certified Strength & Conditioning', 'ISSA Master Trainer'],
        bio: 'Specialist in progressive overload barbell mechanics, bodybuilding symmetry, and power development.',
        status: 'ACTIVE',
        assignedMemberIds: ['mem-002', 'mem-004', 'mem-005'],
        rating: 4.8,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7J1sm6PnCz5g3SuZSj2qWHnwmDHIP9aI_SYmWvsSSGHFSDviGBkXRJZPgfrIq_7MU0O12YTzmZsCH3vSesndH5VkAgj2Cz0zZ72q0oV22nN_PVeHAXJntHG7JhluEYB_R5nBQbFW8XxrzYtX3PARD-dl_-9d5HKTnH72mEGneLpYvTksMIWzp8v-IrKPG6t2l1bmy9_CPujWVl0i1MXwUYaLcwuuarqKi5kzA5Qjss0yzxqi8j2B9',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        _id: 'trainer-03',
        gymId: defaultGymId,
        userId: trainer3UserId,
        name: 'Coach Karen Reed',
        email: 'karen.reed@fitcore.com',
        phone: '+1 (555) 300-1105',
        specialization: 'Power Vinyasa Yoga & Kinetic Mobility',
        experienceYears: 6,
        certifications: ['ERYT-500 Yoga Alliance', 'FMS Functional Movement Screen'],
        bio: 'Focuses on spine health, athletic joint decompression, functional mobility, and breathing rhythm.',
        status: 'ACTIVE',
        assignedMemberIds: ['mem-006', 'mem-008', 'mem-009'],
        rating: 5.0,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      }
    ];

    // Members
    const members: Member[] = [
      {
        _id: 'mem-001',
        memberId: 'FIT-008921',
        userId: member1UserId,
        gymId: defaultGymId,
        name: 'Sophia Martinez',
        email: 'sophia.m@precisionfit.io',
        phone: '+1 (555) 389-1029',
        gender: 'female',
        dateOfBirth: '1995-04-18',
        address: '142 East River Dr, Metropolis',
        emergencyContact: 'Carlos Martinez (+1 555-389-1030)',
        joiningDate: '2023-01-12',
        status: 'ACTIVE',
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdPfC7U_hJjEio_dWYzL85gzRku6HHKd_uh6GJqFcsHpCn2AuhsfLhUq6DwbrmaK_oTnjjUtQ95Lw0W50sXCei4CN2opW7n4UNxjNvk0tyuu492pKUDhUWZIVbu1ch5XgboOkgCq_CftBkxDja-2JTi4EwW2IcSsa_OpPatZYiQACtkl-BM4xwK4LeWwU1Meqv57x-gUoAGkkI32NEG3fAL4NdM5IvpggPIi12dZKZ8cQji6QPjRu',
        notes: 'Targeting sub-20 minute 5K and deadlift progression. Consistently attends 07:15 AM sessions.',
        weightKg: 62.0,
        heightCm: 168,
        bodyFatPercentage: 19.5,
        attendanceRate: 88.0,
        assignedTrainerId: 'trainer-01',
        createdAt: '2023-01-12T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-002',
        memberId: 'FIT-007742',
        gymId: defaultGymId,
        name: 'Marcus Ray',
        email: 'm.ray@velocity.co',
        phone: '+1 (555) 902-8311',
        gender: 'male',
        dateOfBirth: '1989-11-23',
        address: '88 Tech Plaza, Apt 4B',
        emergencyContact: 'Jenna Ray (+1 555-902-8312)',
        joiningDate: '2023-03-10',
        status: 'ACTIVE', // Expiring in 4 days!
        notes: 'Powerlifter, focus on bench & squat peak phases.',
        weightKg: 86.5,
        heightCm: 182,
        bodyFatPercentage: 14.2,
        attendanceRate: 96.0,
        assignedTrainerId: 'trainer-02',
        createdAt: '2023-03-10T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-003',
        memberId: 'FIT-006219',
        gymId: defaultGymId,
        name: 'Elena Rostova',
        email: 'elena.fit@aerogym.net',
        phone: '+1 (555) 441-2900',
        gender: 'female',
        dateOfBirth: '1993-08-05',
        address: '501 Horizon Towers',
        emergencyContact: 'Pavel Rostov (+1 555-441-2901)',
        joiningDate: '2023-06-14',
        status: 'ACTIVE',
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1uuEaLxLdHXDv2AgjwKyoMM1r12bsOL8rKCje4F5cT1-DdJAKXSua-R9nkK48kEvcaNokg5p2UbfaR1nCCMS4fw5MA_jkonmFDwT82H89hrjbQi79oMfxEw4HBlerd55YoFkbIVQtr-FxvKWmhHG_ltjDmah4e7wIDCJQNK3RrEmDeVkuXPwdVsWQTTBqLH2TIKrLbZ7hXEBMLAJg2c-9LN5R-9-dlRggJi0NDSbPh2sTsjnvYzo',
        notes: 'CrossFit enthusiast, excels in box jumps and kettlebell cycles.',
        weightKg: 58.5,
        heightCm: 165,
        bodyFatPercentage: 18.0,
        attendanceRate: 75.0,
        assignedTrainerId: 'trainer-01',
        createdAt: '2023-06-14T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-004',
        memberId: 'FIT-005501',
        gymId: defaultGymId,
        name: 'Devin Cole',
        email: 'd.cole@apexathletics.com',
        phone: '+1 (555) 718-4491',
        gender: 'male',
        dateOfBirth: '1991-02-14',
        address: '12 South Street',
        emergencyContact: 'Maya Cole (+1 555-718-4492)',
        joiningDate: '2022-10-12',
        status: 'EXPIRED', // Overdue 12 days
        notes: 'Membership lapsed, follow up regarding renewal discount.',
        weightKg: 78.0,
        heightCm: 175,
        bodyFatPercentage: 22.0,
        attendanceRate: 12.0,
        assignedTrainerId: 'trainer-02',
        createdAt: '2022-10-12T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-005',
        memberId: 'FIT-009014',
        gymId: defaultGymId,
        name: 'Liam Gallagher',
        email: 'liam.g@ironpulse.org',
        phone: '+1 (555) 670-8831',
        gender: 'male',
        dateOfBirth: '1987-09-30',
        address: '900 Central Park West',
        emergencyContact: 'Fiona Gallagher (+1 555-670-8832)',
        joiningDate: '2023-08-01',
        status: 'FROZEN', // Medical freeze
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwsCeZ-gejcYAhAfyDYJTL8EEN-4Q6KfpctznqUtseXZFcAGiF5S6AZjrj4qrCGJK8U6f0a3-47TD-qmE9vNsrwNL_pISl27dal0NdpGKaKKQVvcLZxCnqvNcB7RCqxI3ilr1WB0uqrKiTW7XIzYqAaY5KqtD_PKCPqprVGocuM6vovCk45M7SB5y25M2wCxt9VzfCCf9rIuN0G98BL4SSn1IhFWq5iyqFjifjwqiGr8zmXrzHhrSV',
        notes: 'Minor shoulder strain rehabilitation, plan frozen until December 01.',
        weightKg: 84.0,
        heightCm: 180,
        bodyFatPercentage: 16.5,
        attendanceRate: 54.0,
        assignedTrainerId: 'trainer-02',
        createdAt: '2023-08-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-006',
        memberId: 'FIT-004412',
        gymId: defaultGymId,
        name: 'Emma Hayes',
        email: 'emma.hayes@fitcore.com',
        phone: '+1 (555) 234-5678',
        gender: 'female',
        dateOfBirth: '1996-01-25',
        address: '320 Marina Blvd',
        emergencyContact: 'Tom Hayes (+1 555-234-5679)',
        joiningDate: '2023-10-25',
        status: 'ACTIVE', // Expiring tomorrow!
        notes: 'High value client, VIP Elite tier renewal pending.',
        weightKg: 55.0,
        heightCm: 162,
        bodyFatPercentage: 17.0,
        attendanceRate: 92.0,
        assignedTrainerId: 'trainer-03',
        createdAt: '2023-10-25T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-007',
        memberId: 'FIT-003319',
        gymId: defaultGymId,
        name: 'Julian Drake',
        email: 'julian.d@velocity.net',
        phone: '+1 (555) 876-5432',
        gender: 'male',
        dateOfBirth: '1990-07-11',
        address: '77 Broadway Floor 15',
        emergencyContact: 'Sara Drake (+1 555-876-5433)',
        joiningDate: '2024-04-26',
        status: 'ACTIVE', // Expiring in 3 days
        weightKg: 79.2,
        heightCm: 178,
        bodyFatPercentage: 15.8,
        attendanceRate: 85.0,
        assignedTrainerId: 'trainer-01',
        createdAt: '2024-04-26T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-008',
        memberId: 'FIT-002108',
        gymId: defaultGymId,
        name: 'Rhea Kapoor',
        email: 'rhea.k@studiofit.org',
        phone: '+1 (555) 912-3456',
        gender: 'female',
        dateOfBirth: '1994-12-03',
        address: '120 West End Ave',
        emergencyContact: 'Anil Kapoor (+1 555-912-3457)',
        joiningDate: '2024-05-02',
        status: 'ACTIVE', // Expiring in 5 days
        weightKg: 59.0,
        heightCm: 166,
        bodyFatPercentage: 20.1,
        attendanceRate: 82.0,
        assignedTrainerId: 'trainer-03',
        createdAt: '2024-05-02T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-009',
        memberId: 'FIT-001092',
        gymId: defaultGymId,
        name: 'David Kim',
        email: 'david.kim@techcorp.io',
        phone: '+1 (555) 765-4321',
        gender: 'male',
        dateOfBirth: '1988-06-19',
        address: '45 Silicon Mews',
        emergencyContact: 'Grace Kim (+1 555-765-4322)',
        joiningDate: '2024-02-15',
        status: 'ACTIVE',
        weightKg: 74.5,
        heightCm: 172,
        bodyFatPercentage: 16.0,
        attendanceRate: 89.0,
        assignedTrainerId: 'trainer-03',
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mem-010',
        memberId: 'FIT-001093',
        gymId: defaultGymId,
        name: 'Alex Rivera',
        email: 'alex.rivera@sports.io',
        phone: '+1 (555) 432-9876',
        gender: 'male',
        dateOfBirth: '1992-03-22',
        address: '88 Olympic Way',
        emergencyContact: 'Rosa Rivera (+1 555-432-9877)',
        joiningDate: '2024-07-28',
        status: 'ACTIVE',
        profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7J1sm6PnCz5g3SuZSj2qWHnwmDHIP9aI_SYmWvsSSGHFSDviGBkXRJZPgfrIq_7MU0O12YTzmZsCH3vSesndH5VkAgj2Cz0zZ72q0oV22nN_PVeHAXJntHG7JhluEYB_R5nBQbFW8XxrzYtX3PARD-dl_-9d5HKTnH72mEGneLpYvTksMIWzp8v-IrKPG6t2l1bmy9_CPujWVl0i1MXwUYaLcwuuarqKi5kzA5Qjss0yzxqi8j2B9',
        notes: 'Expiring in 48 hours, sent WhatsApp reminder.',
        weightKg: 81.0,
        heightCm: 179,
        bodyFatPercentage: 15.0,
        attendanceRate: 91.0,
        assignedTrainerId: 'trainer-01',
        createdAt: '2024-07-28T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      }
    ];

    // Memberships linked to plans
    const memberships: Membership[] = [
      {
        _id: 'mship-001',
        gymId: defaultGymId,
        memberId: 'mem-001',
        planId: 'plan-premium-annual',
        startDate: '2023-11-20',
        endDate: '2024-11-20',
        amount: 15999,
        discount: 1000,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: true,
        createdAt: '2023-11-20T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-002',
        gymId: defaultGymId,
        memberId: 'mem-002',
        planId: 'plan-strength-elite',
        startDate: '2023-10-28',
        endDate: '2024-10-28',
        amount: 24999,
        discount: 0,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: false,
        createdAt: '2023-10-28T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-003',
        gymId: defaultGymId,
        memberId: 'mem-003',
        planId: 'plan-standard-core',
        startDate: '2024-06-14',
        endDate: '2024-12-14',
        amount: 8999,
        discount: 500,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: true,
        createdAt: '2024-06-14T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-004',
        gymId: defaultGymId,
        memberId: 'mem-004',
        planId: 'plan-premium-annual',
        startDate: '2023-10-12',
        endDate: '2024-10-12',
        amount: 15999,
        discount: 0,
        paymentStatus: 'FAILED',
        status: 'EXPIRED',
        autoRenew: false,
        createdAt: '2023-10-12T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-005',
        gymId: defaultGymId,
        memberId: 'mem-005',
        planId: 'plan-standard-core',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        amount: 8999,
        discount: 0,
        paymentStatus: 'PAID',
        status: 'FROZEN',
        autoRenew: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-006',
        gymId: defaultGymId,
        memberId: 'mem-006',
        planId: 'plan-strength-elite',
        startDate: '2023-10-25',
        endDate: '2024-10-25',
        amount: 24999,
        discount: 2000,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: false,
        createdAt: '2023-10-25T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-007',
        gymId: defaultGymId,
        memberId: 'mem-007',
        planId: 'plan-standard-core',
        startDate: '2024-04-26',
        endDate: '2024-10-26',
        amount: 8999,
        discount: 0,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: false,
        createdAt: '2024-04-26T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'mship-008',
        gymId: defaultGymId,
        memberId: 'mem-008',
        planId: 'plan-basic-quarterly',
        startDate: '2024-07-28',
        endDate: '2024-10-28',
        amount: 4999,
        discount: 0,
        paymentStatus: 'PAID',
        status: 'ACTIVE',
        autoRenew: true,
        createdAt: '2024-07-28T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      }
    ];

    // Classes schedule
    const classes: ClassSession[] = [
      {
        _id: 'cls-01',
        gymId: defaultGymId,
        name: 'CrossFit Functional Blitz',
        description: 'High intensity metabolic conditioning, barbell cycling, and gymnastics skill work.',
        trainerId: 'trainer-01',
        trainerName: 'Coach Tanya Sharma',
        date: todayStr,
        startTime: '17:30',
        endTime: '18:30',
        room: 'Zone B - Performance Box',
        capacity: 20,
        enrolledMemberIds: ['mem-001', 'mem-003', 'mem-007', 'mem-009', 'mem-010'],
        waitlistMemberIds: [],
        checkedInMemberIds: ['mem-001', 'mem-010'],
        status: 'SCHEDULED',
        category: 'CrossFit',
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'cls-02',
        gymId: defaultGymId,
        name: 'Power Vinyasa Yoga',
        description: 'Dynamic athletic flow linking breath with movement to build balance, core stability, and mobility.',
        trainerId: 'trainer-03',
        trainerName: 'Coach Karen Reed',
        date: todayStr,
        startTime: '18:45',
        endTime: '19:45',
        room: 'Studio 1 - Zen Vault',
        capacity: 15,
        enrolledMemberIds: ['mem-001', 'mem-002', 'mem-003', 'mem-006', 'mem-008'],
        waitlistMemberIds: ['mem-005', 'mem-007'],
        checkedInMemberIds: [],
        status: 'SCHEDULED',
        category: 'Yoga',
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'cls-03',
        gymId: defaultGymId,
        name: 'Strength & Conditioning (Olympic Barbell)',
        description: 'Compound lift periodization focusing on Clean & Jerk, Back Squats, and structural accessories.',
        trainerId: 'trainer-02',
        trainerName: 'Coach Alex Mercer',
        date: todayStr,
        startTime: '20:00',
        endTime: '21:00',
        room: 'Main Turf - Racks A',
        capacity: 16,
        enrolledMemberIds: ['mem-002', 'mem-005', 'mem-007'],
        waitlistMemberIds: [],
        checkedInMemberIds: [],
        status: 'SCHEDULED',
        category: 'Strength',
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'cls-04',
        gymId: defaultGymId,
        name: 'HIIT Beast Mode',
        description: 'High adrenaline interval circuit with assault bikes, rower sprints, and plyometric boxes.',
        trainerId: 'trainer-01',
        trainerName: 'Coach Tanya Sharma',
        date: todayStr,
        startTime: '07:00',
        endTime: '08:00',
        room: 'Studio A - High Performance Turf',
        capacity: 25,
        enrolledMemberIds: ['mem-001', 'mem-003', 'mem-009'],
        waitlistMemberIds: [],
        checkedInMemberIds: ['mem-001', 'mem-003'],
        status: 'COMPLETED',
        category: 'Cardio & HIIT',
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
      {
        _id: 'cls-05',
        gymId: defaultGymId,
        name: 'Zumba Cardio Fiesta',
        description: 'Rhythmic, high-energy dance cardio infused with Latin beats for intense caloric burn.',
        trainerId: 'trainer-03',
        trainerName: 'Coach Karen Reed',
        date: todayStr,
        startTime: '19:45',
        endTime: '20:45',
        room: 'Studio B - Kinetic Cycle & Dance',
        capacity: 25,
        enrolledMemberIds: ['mem-003', 'mem-006', 'mem-008'],
        waitlistMemberIds: [],
        checkedInMemberIds: [],
        status: 'SCHEDULED',
        category: 'Zumba',
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      }
    ];

    // Attendance records for today & recent days
    const attendances: Attendance[] = [
      {
        _id: 'att-001',
        gymId: defaultGymId,
        memberId: 'mem-001',
        checkIn: `${todayStr}T07:15:00.000Z`,
        checkOut: `${todayStr}T08:45:00.000Z`,
        durationMinutes: 90,
        method: 'QR_CODE',
        date: todayStr,
        turnstile: 'Turnstile #02',
        createdAt: `${todayStr}T07:15:00.000Z`,
      },
      {
        _id: 'att-002',
        gymId: defaultGymId,
        memberId: 'mem-003',
        checkIn: `${todayStr}T07:20:00.000Z`,
        checkOut: `${todayStr}T08:30:00.000Z`,
        durationMinutes: 70,
        method: 'BIOMETRIC',
        date: todayStr,
        turnstile: 'Turnstile #01',
        createdAt: `${todayStr}T07:20:00.000Z`,
      },
      {
        _id: 'att-003',
        gymId: defaultGymId,
        memberId: 'mem-010',
        checkIn: `${todayStr}T06:18:00.000Z`,
        checkOut: `${todayStr}T07:30:00.000Z`,
        durationMinutes: 72,
        method: 'QR_CODE',
        date: todayStr,
        turnstile: 'Turnstile #02',
        createdAt: `${todayStr}T06:18:00.000Z`,
      }
    ];

    // Payments
    const payments: Payment[] = [
      {
        _id: 'pay-001',
        gymId: defaultGymId,
        memberId: 'mem-001',
        memberName: 'Sophia Martinez',
        membershipId: 'mship-001',
        transactionId: 'TXN-000881',
        amount: 14999,
        paymentMethod: 'CARD',
        status: 'PAID',
        paymentDate: '2023-11-20',
        invoiceNumber: 'INV-2024-000881',
        notes: 'Annual Membership Renewal',
        createdAt: '2023-11-20T00:00:00.000Z',
      },
      {
        _id: 'pay-002',
        gymId: defaultGymId,
        memberId: 'mem-009',
        memberName: 'David Kim',
        membershipId: 'mship-007',
        transactionId: 'TXN-000882',
        amount: 14990,
        paymentMethod: 'UPI',
        status: 'PAID',
        paymentDate: todayStr,
        invoiceNumber: 'INV-2024-000882',
        notes: 'UPI Ref: UPI-99201481',
        createdAt: `${todayStr}T08:00:00.000Z`,
      },
      {
        _id: 'pay-003',
        gymId: defaultGymId,
        memberId: 'mem-002',
        memberName: 'Marcus Ray',
        membershipId: 'mship-002',
        transactionId: 'TXN-000883',
        amount: 24999,
        paymentMethod: 'CARD',
        status: 'PAID',
        paymentDate: '2023-10-28',
        invoiceNumber: 'INV-2024-000883',
        notes: 'Strength Elite Package',
        createdAt: '2023-10-28T00:00:00.000Z',
      }
    ];

    // Expenses
    const expenses: Expense[] = [
      {
        _id: 'exp-001',
        gymId: defaultGymId,
        category: 'Rent',
        description: 'Commercial facility monthly lease - Downtown Sector',
        amount: 125000,
        paymentMethod: 'BANK_TRANSFER',
        date: `${todayStr.substring(0, 7)}-01`,
        notes: 'Paid to Metropolis Properties Ltd.',
        createdAt: `${todayStr.substring(0, 7)}-01T00:00:00.000Z`,
      },
      {
        _id: 'exp-002',
        gymId: defaultGymId,
        category: 'Electricity',
        description: 'HVAC, lighting & sauna power utilities',
        amount: 28500,
        paymentMethod: 'CARD',
        date: `${todayStr.substring(0, 7)}-05`,
        notes: 'Energy Grid Co.',
        createdAt: `${todayStr.substring(0, 7)}-05T00:00:00.000Z`,
      },
      {
        _id: 'exp-003',
        gymId: defaultGymId,
        category: 'Salary',
        description: 'Head trainers & front desk payroll',
        amount: 110000,
        paymentMethod: 'BANK_TRANSFER',
        date: `${todayStr.substring(0, 7)}-01`,
        notes: 'Monthly staff remuneration',
        createdAt: `${todayStr.substring(0, 7)}-01T00:00:00.000Z`,
      },
      {
        _id: 'exp-004',
        gymId: defaultGymId,
        category: 'Maintenance',
        description: 'Cable machine cable replacements & treadmill calibration',
        amount: 12400,
        paymentMethod: 'UPI',
        date: `${todayStr.substring(0, 7)}-12`,
        notes: 'IronTech Service Corp.',
        createdAt: `${todayStr.substring(0, 7)}-12T00:00:00.000Z`,
      }
    ];

    // Workout plans
    const workoutPlans: WorkoutPlan[] = [
      {
        _id: 'wo-001',
        gymId: defaultGymId,
        memberId: 'mem-001',
        trainerId: 'trainer-01',
        name: 'Hyper-Conditioning & Core Velocity',
        goal: 'Improve VO2 max, strengthen posterior chain, and sprint interval endurance.',
        startDate: '2024-09-01',
        endDate: '2024-11-30',
        status: 'ACTIVE',
        exercises: [
          {
            id: 'ex-1',
            name: 'Barbell Deadlift (Conventional)',
            sets: 4,
            reps: 8,
            weightKg: 85,
            restSeconds: 90,
            instructions: 'Brace core, maintain neutral lumbar spine, drive through midfoot.',
          },
          {
            id: 'ex-2',
            name: 'Kettlebell Russian Swings',
            sets: 4,
            reps: 15,
            weightKg: 24,
            restSeconds: 60,
            instructions: 'Explosive hip hinge with full glute contraction at top.',
          },
          {
            id: 'ex-3',
            name: 'Assault Bike Sprint Intervals',
            sets: 6,
            reps: 1,
            durationMinutes: 1,
            restSeconds: 60,
            instructions: 'Max effort 20 seconds, active recovery pedal 40 seconds.',
          },
          {
            id: 'ex-4',
            name: 'Hanging Leg Raises',
            sets: 3,
            reps: 12,
            restSeconds: 45,
            instructions: 'Controlled eccentric descent without swinging the torso.',
          }
        ],
        createdAt: '2024-09-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      }
    ];

    // Notifications
    const notifications: NotificationItem[] = [
      {
        _id: 'notif-001',
        gymId: defaultGymId,
        title: 'Membership Expiring Soon',
        message: 'Alex Rivera (#FC-1093) has a membership expiring in 48 hours.',
        type: 'MEMBERSHIP_EXPIRING',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        _id: 'notif-002',
        gymId: defaultGymId,
        title: 'Payment Received',
        message: 'David Kim paid ₹14,990 via UPI for invoice #INV-2024-000882.',
        type: 'PAYMENT_RECEIVED',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        _id: 'notif-003',
        gymId: defaultGymId,
        title: 'High Floor Capacity Alert',
        message: 'Floor occupancy reached 84% at 18:30 during peak evening rush.',
        type: 'CLASS_REMINDER',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        _id: 'notif-004',
        gymId: defaultGymId,
        title: 'New Member Registered',
        message: 'Liam Henderson completed registration at North Front Desk.',
        type: 'NEW_MEMBER',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      }
    ];

    const contactMessages: ContactMessage[] = [
      {
        _id: 'msg-001',
        name: 'Jordan Vance',
        gymName: 'Titan Iron Works',
        email: 'jordan@titaniron.com',
        phone: '+1 (555) 219-9021',
        subject: 'Inquiry on Multi-Facility Franchise Tier',
        message: 'We operate 4 fitness facilities in Chicago and want to migrate to FITCORE SaaS.',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      }
    ];

    return {
      users,
      gyms: [gym],
      members,
      membershipPlans,
      memberships,
      attendances,
      trainers,
      classes,
      payments,
      expenses,
      workoutPlans,
      notifications,
      contactMessages,
      counters: {
        member: 8925,
        invoice: 885,
        transaction: 994,
      }
    };
  }
}

export const dbService = new DatabaseService();
