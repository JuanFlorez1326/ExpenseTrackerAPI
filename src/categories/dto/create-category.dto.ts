import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Alimentación',
    description: 'Nombre único de la categoría para este usuario',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: '#f59e0b',
    description: 'Color en formato hexadecimal (#RRGGBB)',
    default: '#6366f1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color debe ser un hex válido (#RRGGBB)' })
  color?: string;

  @ApiPropertyOptional({
    example: 'utensils',
    description: 'Nombre del ícono (ej. utensils, car, home)',
    default: 'tag',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
