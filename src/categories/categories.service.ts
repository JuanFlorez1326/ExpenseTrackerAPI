import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { name_userId: { name: dto.name, userId } },
    });
    if (exists) throw new ConflictException('Ya existe una categoría con ese nombre');

    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(userId: string, id: string, dto: Partial<CreateCategoryDto>) {
    await this.findOne(userId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.category.delete({ where: { id } });
  }
}
