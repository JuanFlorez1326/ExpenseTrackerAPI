import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: { category: true },
    });
  }

  findAll(userId: string, type?: string) {
    return this.prisma.expense.findMany({
      where: { userId, ...(type ? { type: type as any } : {}) },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Gasto/ingreso no encontrado');
    return expense;
  }

  async update(userId: string, id: string, dto: Partial<CreateExpenseDto>) {
    await this.findOne(userId, id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description && { description: dto.description }),
        ...(dto.type && { type: dto.type }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.date && { date: new Date(dto.date) }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.expense.delete({ where: { id } });
  }
}
