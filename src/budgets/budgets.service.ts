import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const exists = await this.prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: dto.categoryId,
          month: dto.month,
          year: dto.year,
        },
      },
    });
    if (exists) throw new ConflictException('Ya existe un presupuesto para esa categoría y período');

    return this.prisma.budget.create({
      data: { ...dto, userId },
      include: { category: true },
    });
  }

  findAll(userId: string, month?: number, year?: number) {
    return this.prisma.budget.findMany({
      where: { userId, ...(month ? { month } : {}), ...(year ? { year } : {}) },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    return budget;
  }

  async update(userId: string, id: string, dto: Partial<CreateBudgetDto>) {
    await this.findOne(userId, id);
    return this.prisma.budget.update({
      where: { id },
      data: { ...(dto.amount !== undefined && { amount: dto.amount }) },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.budget.delete({ where: { id } });
  }
}
