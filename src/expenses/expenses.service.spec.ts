import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseType } from './dto/create-expense.dto';

const mockExpense = {
  id: 'exp-1',
  amount: 50000,
  description: 'Almuerzo',
  type: 'EXPENSE',
  date: new Date(),
  userId: 'user-1',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Alimentación', color: '#6366f1' },
};

const mockPrisma = {
  expense: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    jest.clearAllMocks();
  });

  it('debe crear un gasto correctamente', async () => {
    mockPrisma.expense.create.mockResolvedValue(mockExpense);

    const result = await service.create('user-1', {
      amount: 50000,
      description: 'Almuerzo',
      type: ExpenseType.EXPENSE,
      categoryId: 'cat-1',
    });

    expect(result.description).toBe('Almuerzo');
    expect(mockPrisma.expense.create).toHaveBeenCalledTimes(1);
  });

  it('debe retornar todos los gastos del usuario', async () => {
    mockPrisma.expense.findMany.mockResolvedValue([mockExpense]);

    const result = await service.findAll('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-1');
  });

  it('debe lanzar NotFoundException si el gasto no existe', async () => {
    mockPrisma.expense.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('debe eliminar un gasto existente', async () => {
    mockPrisma.expense.findFirst.mockResolvedValue(mockExpense);
    mockPrisma.expense.delete.mockResolvedValue(mockExpense);

    const result = await service.remove('user-1', 'exp-1');
    expect(result.id).toBe('exp-1');
  });
});
