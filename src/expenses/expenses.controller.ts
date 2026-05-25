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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, ExpenseType } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar gasto o ingreso',
    description:
      'Crea un nuevo movimiento financiero. Usa `type: EXPENSE` para un gasto o `type: INCOME` para un ingreso.',
  })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, description: 'Movimiento registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar gastos e ingresos',
    description: 'Retorna todos los movimientos del usuario. Filtra por tipo con el parámetro `type`.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ExpenseType,
    description: 'Filtrar por tipo: `EXPENSE` (gastos) o `INCOME` (ingresos)',
  })
  @ApiResponse({ status: 200, description: 'Lista de movimientos, ordenados por fecha descendente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@CurrentUser() user: any, @Query('type') type?: string) {
    return this.expensesService.findAll(user.id, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id', description: 'UUID del movimiento', example: 'a1b2c3d4-...' })
  @ApiResponse({ status: 200, description: 'Movimiento encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar movimiento',
    description: 'Actualiza uno o más campos del movimiento. Todos los campos son opcionales.',
  })
  @ApiParam({ name: 'id', description: 'UUID del movimiento a actualizar' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 200, description: 'Movimiento actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateExpenseDto>) {
    return this.expensesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar movimiento' })
  @ApiParam({ name: 'id', description: 'UUID del movimiento a eliminar' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.remove(user.id, id);
  }
}
