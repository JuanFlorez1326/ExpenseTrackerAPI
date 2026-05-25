import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear presupuesto mensual',
    description:
      'Define un límite de gasto para una categoría en un mes/año específico. ' +
      'Solo puede existir un presupuesto por categoría + mes + año.',
  })
  @ApiBody({ type: CreateBudgetDto })
  @ApiResponse({ status: 201, description: 'Presupuesto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 409, description: 'Ya existe un presupuesto para esa categoría y período' })
  create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar presupuestos',
    description: 'Retorna todos los presupuestos del usuario. Filtra opcionalmente por mes y/o año.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Filtrar por mes (1-12)', example: 5 })
  @ApiQuery({ name: 'year', required: false, description: 'Filtrar por año', example: 2026 })
  @ApiResponse({ status: 200, description: 'Lista de presupuestos con información de categoría' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.budgetsService.findAll(
      user.id,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener presupuesto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del presupuesto', example: 'a1b2c3d4-...' })
  @ApiResponse({ status: 200, description: 'Presupuesto encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar monto del presupuesto',
    description: 'Solo el campo `amount` puede actualizarse en un presupuesto existente.',
  })
  @ApiParam({ name: 'id', description: 'UUID del presupuesto a actualizar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 750000, description: 'Nuevo monto del presupuesto' },
      },
      required: ['amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateBudgetDto>) {
    return this.budgetsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto' })
  @ApiParam({ name: 'id', description: 'UUID del presupuesto a eliminar' })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Presupuesto no encontrado' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.remove(user.id, id);
  }
}
