import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/register - debe rechazar datos inválidos', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'no-es-email', password: '123' })
      .expect(400);
  });

  it('POST /api/v1/auth/login - debe rechazar credenciales malformadas', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'no-email' })
      .expect(400);
  });

  it('GET /api/v1/expenses - debe requerir autenticación', () => {
    return request(app.getHttpServer())
      .get('/api/v1/expenses')
      .expect(401);
  });
});
