import { dbService } from '../models/db';
import { Expense } from '../types';

export class ExpenseService {
  public static async getExpenses(gymId: string): Promise<Expense[]> {
    return dbService.getExpenses(gymId);
  }

  public static async addExpense(gymId: string, data: Partial<Expense>): Promise<Expense> {
    const db = dbService.getRawDb();
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    const newExpense: Expense = {
      _id: `exp-${Date.now()}`,
      gymId,
      category: data.category || 'Other',
      description: data.description || 'General gym operational expense',
      amount: data.amount || 0,
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
      date: data.date || today,
      notes: data.notes,
      createdAt: nowIso,
    };

    db.expenses.unshift(newExpense);
    dbService.persist();
    return newExpense;
  }

  public static async deleteExpense(gymId: string, expenseId: string): Promise<void> {
    const db = dbService.getRawDb();
    db.expenses = db.expenses.filter((e) => !(e._id === expenseId && e.gymId === gymId));
    dbService.persist();
  }
}
