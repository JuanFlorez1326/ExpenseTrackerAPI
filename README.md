# Expense Tracker API

API REST de gestión de gastos personales desarrollada con **NestJS**, **TypeScript**, **PostgreSQL** y **Prisma ORM**. Desplegable mediante **Docker Compose** con dos contenedores comunicados entre sí.

**Autores:** Juan Diego Aguilar Ángel · Juan Patiño Flórez · Juan Camilo Pinzón Marín · Julián Giovanny Rey Mora · Marta Teresa Velandia Urrego  
**Curso:** Integración Continua — Politécnico Grancolombiano  
**Profesor:** Jesús Figueroa Guerrero  
**Entrega:** 1 (Semana 3)

---

## Tabla de contenido

- [Descripción del proyecto](#descripción-del-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
  - [Con Docker (recomendado)](#con-docker-recomendado)
  - [En local (desarrollo)](#en-local-desarrollo)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Pruebas](#pruebas)
- [Modelo de datos](#modelo-de-datos)

---

## Descripción del proyecto

El sistema permite a usuarios autenticados:

- Registrar **ingresos y gastos** clasificados por tipo y categoría.
- Crear **categorías personalizadas** con color e ícono.
- Definir **presupuestos mensuales** por categoría.
- Consultar **reportes** de resumen mensual (con estado de presupuesto) y resumen anual.

La lógica de negocio incluye cálculos financieros, validaciones de unicidad y agregaciones por período, lo que genera escenarios de prueba representativos y justifica el uso de integración continua.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 |
| Framework | NestJS 10 + TypeScript 5 |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 5 |
| Autenticación | JWT (passport-jwt) |
| Validación | class-validator + class-transformer |
| Pruebas unitarias | Jest 29 |
| Pruebas e2e | Supertest |
| Contenedores | Docker + Docker Compose |

---

## Arquitectura

El sistema se compone de **dos contenedores Docker** que se comunican a través de una red interna (`expense_network`):

```
┌─────────────────────────────────────────────────┐
│                  Docker Network                  │
│                 expense_network                  │
│                                                 │
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  Contenedor 1        │  │  Contenedor 2    │ │
│  │  expense_tracker_api │◄─►│  expense_        │ │
│  │  NestJS · Puerto 3000│  │  tracker_db      │ │
│  │                      │  │  PostgreSQL      │ │
│  │                      │  │  Puerto 5432     │ │
│  └──────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────┘
        ▲                          ▲
        │ :3000                    │ :5432
    Cliente HTTP             (solo interno)
```

- El contenedor de la API espera a que PostgreSQL esté listo mediante un `healthcheck` antes de iniciar.
- PostgreSQL persiste datos en un volumen Docker (`postgres_data`), sobreviviendo reinicios del contenedor.
- La cadena de conexión se inyecta como variable de entorno; el contenedor de la API referencia al contenedor de la BD por su nombre de servicio (`postgres`), no por IP.

---

## Estructura del proyecto

```
entrega 1/
├── src/
│   ├── main.ts                          # Bootstrap de la aplicación
│   ├── app.module.ts                    # Módulo raíz
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts            # Cliente Prisma (singleton global)
│   │   └── prisma.module.ts             # Módulo global exportado
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts              # Registro, login, firma JWT
│   │   ├── auth.controller.ts           # POST /auth/register, /login, GET /me
│   │   ├── auth.service.spec.ts         # Tests unitarios del servicio
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts        # Guard de autenticación JWT
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts          # Estrategia Passport JWT
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts        # CRUD con validación de unicidad
│   │   ├── categories.controller.ts
│   │   ├── categories.service.spec.ts
│   │   └── dto/
│   │       └── create-category.dto.ts
│   │
│   ├── expenses/
│   │   ├── expenses.module.ts
│   │   ├── expenses.service.ts          # CRUD, filtro por tipo (INCOME/EXPENSE)
│   │   ├── expenses.controller.ts
│   │   ├── expenses.service.spec.ts
│   │   └── dto/
│   │       └── create-expense.dto.ts
│   │
│   ├── budgets/
│   │   ├── budgets.module.ts
│   │   ├── budgets.service.ts           # CRUD con unicidad por categoría+período
│   │   ├── budgets.controller.ts
│   │   └── dto/
│   │       └── create-budget.dto.ts
│   │
│   └── reports/
│       ├── reports.module.ts
│       ├── reports.service.ts           # Resumen mensual + anual
│       └── reports.controller.ts
│
├── prisma/
│   └── schema.prisma                    # Modelos: User, Category, Expense, Budget
│
├── test/
│   ├── app.e2e-spec.ts                  # Tests e2e con Supertest
│   └── jest-e2e.json
│
├── Dockerfile                           # Build multi-etapa (builder + producción)
├── docker-compose.yml                   # Orquestación de los dos contenedores
├── .env.example                         # Plantilla de variables de entorno
├── .dockerignore
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- Node.js 20+ *(solo si se ejecuta en local sin Docker)*

---

## Instalación y ejecución

### Con Docker (recomendado)

Este método levanta automáticamente los dos contenedores (API + PostgreSQL) sin necesidad de instalar dependencias localmente.

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd "entrega 1"

# 2. Crear el archivo de variables de entorno
cp .env.example .env

# 3. Construir imágenes y levantar contenedores
docker-compose up --build

# URLs disponibles:
#   API base  → http://localhost:3000/api/v1
#   Swagger   → http://localhost:3000/docs
```

Para detener los contenedores:

```bash
docker-compose down
```

Para detener y eliminar también los volúmenes (borra los datos):

```bash
docker-compose down -v
```

Para ver los logs de un contenedor específico:

```bash
docker logs expense_tracker_api
docker logs expense_tracker_db
```

---

### En local (desarrollo)

Este modo usa **Docker solo para la base de datos** y corre la API directamente en tu máquina, lo que permite hot-reload inmediato sin reconstruir imágenes.

```
┌─────────────────────┐        ┌──────────────────────┐
│  Tu máquina (local) │        │  Docker              │
│                     │        │                      │
│  yarn start:dev     │───────►│  expense_tracker_db  │
│  localhost:3000     │        │  PostgreSQL :5432    │
└─────────────────────┘        └──────────────────────┘
```

**Primera vez:**

```bash
# 1. Instalar dependencias
yarn install

# 2. Crear archivo de entorno (no requiere cambios, apunta a Docker)
cp .env.example .env

# 3. Levantar solo la base de datos en Docker
docker-compose up postgres -d

# 4. Crear las tablas (ejecutar una sola vez)
npx prisma migrate dev --name init

# 5. Iniciar la API con hot-reload
yarn start:dev
```

**Usos posteriores** (la BD ya existe):

```bash
# Levantar la BD (si no está corriendo)
docker-compose up postgres -d

# Arrancar la API
yarn start:dev
```

> **Nota:** si `prisma migrate dev` falla porque la BD ya tiene datos, usar `npx prisma db push` en su lugar.

**URLs disponibles en modo local:**

| Recurso | URL |
|---|---|
| API base | `http://localhost:3000/api/v1` |
| Swagger UI | `http://localhost:3000/docs` |

**Comandos útiles durante el desarrollo:**

```bash
# Ver logs de la BD
docker logs expense_tracker_db

# Abrir Prisma Studio (explorador visual de la BD)
npx prisma studio

# Detener la BD
docker-compose stop postgres
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión completa a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/expense_tracker` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `expense_tracker` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `supersecretjwtkey` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d` |
| `PORT` | Puerto en que escucha la API | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

> **Importante:** Cambiar `JWT_SECRET` por un valor seguro antes de cualquier despliegue.

---

## Endpoints de la API

Todos los endpoints tienen el prefijo `/api/v1`.

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | No | Registrar nuevo usuario |
| `POST` | `/auth/login` | No | Iniciar sesión → retorna JWT |
| `GET` | `/auth/me` | Sí | Obtener perfil del usuario actual |

**Ejemplo — Registro:**
```json
POST /api/v1/auth/register
{
  "name": "Juan Patiño",
  "email": "juan@example.com",
  "password": "miPassword123"
}
```

**Ejemplo — Login (respuesta):**
```json
{
  "user": { "id": "uuid", "name": "Juan Patiño", "email": "juan@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Para los endpoints protegidos, incluir el token en el header:
```
Authorization: Bearer <token>
```

---

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/categories` | Crear categoría |
| `GET` | `/categories` | Listar todas las categorías del usuario |
| `GET` | `/categories/:id` | Obtener categoría por ID |
| `PATCH` | `/categories/:id` | Actualizar categoría |
| `DELETE` | `/categories/:id` | Eliminar categoría |

**Ejemplo — Crear categoría:**
```json
POST /api/v1/categories
{
  "name": "Alimentación",
  "color": "#f59e0b",
  "icon": "utensils"
}
```

---

### Gastos e Ingresos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/expenses` | Registrar gasto o ingreso |
| `GET` | `/expenses` | Listar todos (filtrable por `?type=EXPENSE` o `?type=INCOME`) |
| `GET` | `/expenses/:id` | Obtener por ID |
| `PATCH` | `/expenses/:id` | Actualizar |
| `DELETE` | `/expenses/:id` | Eliminar |

**Ejemplo — Registrar gasto:**
```json
POST /api/v1/expenses
{
  "amount": 35000,
  "description": "Mercado semanal",
  "type": "EXPENSE",
  "categoryId": "uuid-de-la-categoria",
  "date": "2026-05-25"
}
```

Los valores de `type` aceptados son `EXPENSE` (gasto) e `INCOME` (ingreso).

---

### Presupuestos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/budgets` | Crear presupuesto mensual |
| `GET` | `/budgets` | Listar (filtrable por `?month=5&year=2026`) |
| `GET` | `/budgets/:id` | Obtener por ID |
| `PATCH` | `/budgets/:id` | Actualizar monto |
| `DELETE` | `/budgets/:id` | Eliminar |

**Ejemplo — Crear presupuesto:**
```json
POST /api/v1/budgets
{
  "amount": 500000,
  "categoryId": "uuid-de-la-categoria",
  "month": 5,
  "year": 2026
}
```

---

### Reportes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/reports/monthly` | Resumen mensual con estado de presupuestos |
| `GET` | `/reports/annual` | Resumen anual mes a mes |

**Parámetros opcionales:**

- `/reports/monthly?month=5&year=2026`
- `/reports/annual?year=2026`

**Ejemplo — Respuesta resumen mensual:**
```json
{
  "period": { "month": 5, "year": 2026 },
  "summary": {
    "totalIncome": 3000000,
    "totalExpense": 1250000,
    "balance": 1750000
  },
  "byCategory": {
    "Alimentación": { "income": 0, "expense": 350000, "color": "#f59e0b" }
  },
  "budgetStatus": [
    {
      "category": "Alimentación",
      "budget": 500000,
      "spent": 350000,
      "remaining": 150000,
      "percentage": 70
    }
  ]
}
```

---

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas unitarias con cobertura
npm run test:cov

# Pruebas e2e (requiere base de datos activa)
npm run test:e2e
```

Los tests cubren:

- `AuthService` — registro con email duplicado, login con contraseña incorrecta, login exitoso.
- `ExpensesService` — creación, listado, manejo de ID inexistente, eliminación.
- `CategoriesService` — creación, conflicto de nombre duplicado, ID inexistente.
- Tests e2e — validación de DTOs (400) y protección de rutas (401).

---

## Modelo de datos

```
User
 ├── id (UUID, PK)
 ├── email (único)
 ├── password (hash bcrypt)
 ├── name
 ├── categories []
 ├── expenses []
 └── budgets []

Category
 ├── id (UUID, PK)
 ├── name + userId (único compuesto)
 ├── color (#RRGGBB)
 ├── icon
 └── userId (FK → User)

Expense
 ├── id (UUID, PK)
 ├── amount (Decimal 12,2)
 ├── description
 ├── type (INCOME | EXPENSE)
 ├── date
 ├── userId (FK → User)
 └── categoryId (FK → Category)

Budget
 ├── id (UUID, PK)
 ├── amount (Decimal 12,2)
 ├── month (1–12)
 ├── year
 ├── userId + categoryId + month + year (único compuesto)
 ├── userId (FK → User)
 └── categoryId (FK → Category)
```
