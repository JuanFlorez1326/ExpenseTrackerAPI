import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

const mockCategory = {
  id: 'cat-1',
  name: 'Alimentación',
  color: '#6366f1',
  icon: 'tag',
  userId: 'user-1',
};

const mockPrisma = {
  category: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('debe crear una categoría nueva', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    mockPrisma.category.create.mockResolvedValue(mockCategory);

    const result = await service.create('user-1', { name: 'Alimentación' });
    expect(result.name).toBe('Alimentación');
  });

  it('debe lanzar ConflictException si la categoría ya existe', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

    await expect(service.create('user-1', { name: 'Alimentación' })).rejects.toThrow(ConflictException);
  });

  it('debe lanzar NotFoundException si la categoría no existe', async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'invalid-id')).rejects.toThrow(NotFoundException);
  });
});
