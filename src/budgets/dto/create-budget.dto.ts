import { IsString, IsNumber, IsPositive, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({
    example: 500000,
    description: 'Monto máximo del presupuesto para el período',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría a presupuestar',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    example: 5,
    description: 'Mes del presupuesto (1 = enero … 12 = diciembre)',
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    example: 2026,
    description: 'Año del presupuesto',
    minimum: 2020,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  year: number;
}
