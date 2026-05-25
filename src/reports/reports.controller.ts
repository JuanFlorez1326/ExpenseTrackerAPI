import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @ApiOperation({
    summary: 'Resumen financiero mensual',
    description:
      'Retorna el resumen del mes indicado: total de ingresos, total de gastos, balance, ' +
      'desglose por categoría y estado de cumplimiento de cada presupuesto definido.',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Mes a consultar (1-12). Por defecto: mes actual',
    example: 5,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Año a consultar. Por defecto: año actual',
    example: 2026,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen mensual generado',
    schema: {
      example: {
        period: { month: 5, year: 2026 },
        summary: { totalIncome: 3000000, totalExpense: 1250000, balance: 1750000 },
        byCategory: {
          Alimentación: { income: 0, expense: 350000, color: '#f59e0b' },
        },
        budgetStatus: [
          {
            category: 'Alimentación',
            budget: 500000,
            spent: 350000,
            remaining: 150000,
            percentage: 70,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  monthly(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.reportsService.getMonthlySummary(
      user.id,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  @Get('annual')
  @ApiOperation({
    summary: 'Resumen financiero anual',
    description:
      'Retorna un desglose mes a mes del año indicado, con totales de ingresos y gastos por cada mes.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Año a consultar. Por defecto: año actual',
    example: 2026,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen anual generado',
    schema: {
      example: {
        year: 2026,
        monthly: [
          { month: 1, income: 3000000, expense: 1100000 },
          { month: 2, income: 3000000, expense: 980000 },
          { month: 5, income: 3000000, expense: 1250000 },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  annual(@CurrentUser() user: any, @Query('year') year: string) {
    return this.reportsService.getAnnualSummary(
      user.id,
      year ? parseInt(year) : new Date().getFullYear(),
    );
  }
}
