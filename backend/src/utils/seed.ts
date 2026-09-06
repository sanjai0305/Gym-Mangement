import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { dbService } from '../models/db';
import {
  UserModel,
  GymModel,
  MemberModel,
  MembershipPlanModel,
  MembershipModel,
  AttendanceModel,
  TrainerModel,
  ClassSessionModel,
  PaymentModel,
  ExpenseModel,
  WorkoutPlanModel,
  NotificationModel,
} from '../models/schemas';

async function seedDatabase() {
  console.log('=========================================');
  console.log('🌱 FITCORE Database Seeder');
  console.log('=========================================');

  // 1. Reset resilient JSON store
  console.log('Resetting local resilient database storage...');
  dbService.resetToSeed();
  const seedData = dbService.getRawDb();
  console.log(`✅ Seeded ${seedData.gyms.length} Gym(s)`);
  console.log(`✅ Seeded ${seedData.users.length} User(s) (Owner, Admin, Receptionist, Trainers, Members)`);
  console.log(`✅ Seeded ${seedData.members.length} Member(s)`);
  console.log(`✅ Seeded ${seedData.membershipPlans.length} Membership Plan(s)`);
  console.log(`✅ Seeded ${seedData.memberships.length} Membership(s)`);
  console.log(`✅ Seeded ${seedData.trainers.length} Trainer(s)`);
  console.log(`✅ Seeded ${seedData.classes.length} Class(es)`);
  console.log(`✅ Seeded ${seedData.attendances.length} Attendance Record(s)`);
  console.log(`✅ Seeded ${seedData.payments.length} Payment(s)`);
  console.log(`✅ Seeded ${seedData.expenses.length} Expense(s)`);
  console.log(`✅ Seeded ${seedData.workoutPlans.length} Workout Plan(s)`);
  console.log(`✅ Seeded ${seedData.notifications.length} Notification(s)`);

  // 2. If MongoDB is configured and accessible, sync to MongoDB collections as well
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('localhost:27017')) {
    try {
      console.log('\nConnecting to MongoDB to seed cloud collections...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
      console.log('Connected to MongoDB. Clearing existing collections...');

      await Promise.all([
        UserModel.deleteMany({}),
        GymModel.deleteMany({}),
        MemberModel.deleteMany({}),
        MembershipPlanModel.deleteMany({}),
        MembershipModel.deleteMany({}),
        AttendanceModel.deleteMany({}),
        TrainerModel.deleteMany({}),
        ClassSessionModel.deleteMany({}),
        PaymentModel.deleteMany({}),
        ExpenseModel.deleteMany({}),
        WorkoutPlanModel.deleteMany({}),
        NotificationModel.deleteMany({}),
      ]);

      console.log('Inserting seed records into MongoDB...');

      // Hash default passwords for users
      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('password123', salt);

      const usersToInsert = seedData.users.map((u) => ({
        ...u,
        password: defaultPasswordHash,
      }));

      await GymModel.insertMany(seedData.gyms);
      await UserModel.insertMany(usersToInsert);
      await MemberModel.insertMany(seedData.members);
      await MembershipPlanModel.insertMany(seedData.membershipPlans);
      await MembershipModel.insertMany(seedData.memberships);
      await TrainerModel.insertMany(seedData.trainers);
      await ClassSessionModel.insertMany(seedData.classes);
      await AttendanceModel.insertMany(seedData.attendances);
      await PaymentModel.insertMany(seedData.payments);
      await ExpenseModel.insertMany(seedData.expenses);
      await WorkoutPlanModel.insertMany(seedData.workoutPlans);
      await NotificationModel.insertMany(seedData.notifications);

      console.log('✅ Successfully populated MongoDB collections!');
      await mongoose.disconnect();
    } catch (err: any) {
      console.warn(`\n[Notice] MongoDB sync skipped or timed out (${err.message}).`);
      console.log('The local resilient data store is fully seeded and operational.');
    }
  }

  console.log('\n=========================================');
  console.log('🎉 Seed complete! Default Credentials:');
  console.log('   Owner:        owner@fitcore.com     / password123');
  console.log('   Admin:        admin@fitcore.com     / password123');
  console.log('   Receptionist: reception@fitcore.com / password123');
  console.log('   Trainer:      trainer@fitcore.com   / password123');
  console.log('   Member:       member@fitcore.com    / password123');
  console.log('=========================================');
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
