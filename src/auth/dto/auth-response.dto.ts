import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'a1b2c3d4-...', description: 'UUID del usuario' })
  id: string;

  @ApiProperty({ example: 'Juan Patiño', description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Token JWT — úsalo en el header Authorization: Bearer <token>',
  })
  token: string;
}
