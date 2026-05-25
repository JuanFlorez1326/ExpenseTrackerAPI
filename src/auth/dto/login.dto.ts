import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico registrado',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'miPassword123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
