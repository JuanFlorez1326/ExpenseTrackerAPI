import { IsString, IsNumber, IsPositive, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExpenseType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateExpenseDto {
  @ApiProperty({
    example: 35000,
    description: 'Monto en la moneda local (máx. 2 decimales)',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Mercado semanal',
    description: 'Descripción del gasto o ingreso',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiProperty({
    enum: ExpenseType,
    example: ExpenseType.EXPENSE,
    description: '`EXPENSE` para gasto, `INCOME` para ingreso',
  })
  @IsEnum(ExpenseType)
  type: ExpenseType;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría a la que pertenece',
  })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    example: '2026-05-25',
    description: 'Fecha del movimiento (ISO 8601). Por defecto: hoy',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
