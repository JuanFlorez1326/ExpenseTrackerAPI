import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription(
      `## API REST de gestión de gastos personales\n\n` +
      `Permite a usuarios autenticados registrar **ingresos y gastos**, organizarlos por **categorías**, ` +
      `definir **presupuestos mensuales** y consultar **reportes** financieros.\n\n` +
      `---\n\n` +
      `### Autenticación — cómo usar Swagger\n` +
      `1. Registrarse en **POST /auth/register**\n` +
      `2. Iniciar sesión en **POST /auth/login** → copiar el valor de \`token\` en la respuesta\n` +
      `3. Hacer clic en **Authorize 🔒** (arriba a la derecha) e ingresar: \`Bearer <token>\`\n` +
      `4. Todos los demás endpoints quedan habilitados automáticamente\n\n` +
      `---\n\n` +
      `### Información académica\n` +
      `| | |\n` +
      `|---|---|\n` +
      `| **Curso** | Integración Continua |\n` +
      `| **Profesor** | Jesús Figueroa Guerrero |\n` +
      `| **Institución** | Politécnico Grancolombiano |\n` +
      `| **Entrega** | 1 — Semana 3 |\n` +
      `| **Autores** | Juan Diego Aguilar Ángel · Juan Patiño Flórez · Juan Camilo Pinzón Marín · Julián Giovanny Rey Mora · Marta Teresa Velandia Urrego |`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT. Obtenlo en POST /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Registro, inicio de sesión y perfil del usuario')
    .addTag('Categories', 'Gestión de categorías de gastos e ingresos')
    .addTag('Expenses', 'Registro y consulta de gastos e ingresos')
    .addTag('Budgets', 'Presupuestos mensuales por categoría')
    .addTag('Reports', 'Reportes financieros mensuales y anuales')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Expense Tracker — API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Expense Tracker API corriendo en: http://localhost:${port}/api/v1`);
  console.log(`Swagger UI disponible en:         http://localhost:${port}/docs`);
}

bootstrap();
