import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlySummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      include: { category: true },
    });

    const totalIncome = expenses
      .filter((e) => e.type === 'INCOME')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalExpense = expenses
      .filter((e) => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const byCategory = expenses.reduce(
      (acc, e) => {
        const key = e.category.name;
        if (!acc[key]) acc[key] = { income: 0, expense: 0, color: e.category.color };
        if (e.type === 'INCOME') acc[key].income += Number(e.amount);
        else acc[key].expense += Number(e.amount);
        return acc;
      },
      {} as Record<string, { income: number; expense: number; color: string }>,
    );

    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const budgetStatus = budgets.map((b) => {
      const spent = expenses
        .filter((e) => e.categoryId === b.categoryId && e.type === 'EXPENSE')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        category: b.category.name,
        budget: Number(b.amount),
        spent,
        remaining: Number(b.amount) - spent,
        percentage: Number(b.amount) > 0 ? (spent / Number(b.amount)) * 100 : 0,
      };
    });

    return {
      period: { month, year },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      byCategory,
      budgetStatus,
    };
  }

  async getAnnualSummary(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthExpenses = expenses.filter((e) => new Date(e.date).getMonth() + 1 === m);
      return {
        month: m,
        income: monthExpenses.filter((e) => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0),
        expense: monthExpenses.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0),
      };
    });

    return { year, monthly };
  }
}
