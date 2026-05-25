import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('test-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario correctamente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        name: 'Juan',
        email: 'juan@test.com',
        createdAt: new Date(),
      });

      const result = await service.register({
        name: 'Juan',
        email: 'juan@test.com',
        password: 'secret123',
      });

      expect(result.token).toBe('test-token');
      expect(result.user.email).toBe('juan@test.com');
    });

    it('debe lanzar ConflictException si el correo ya existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid-1' });

      await expect(
        service.register({ name: 'Juan', email: 'juan@test.com', password: 'secret123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noexiste@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const hashed = await bcrypt.hash('correctpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'juan@test.com',
        password: hashed,
        name: 'Juan',
      });

      await expect(
        service.login({ email: 'juan@test.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar token si las credenciales son válidas', async () => {
      const hashed = await bcrypt.hash('secret123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'juan@test.com',
        password: hashed,
        name: 'Juan',
      });

      const result = await service.login({ email: 'juan@test.com', password: 'secret123' });
      expect(result.token).toBe('test-token');
    });
  });
});
