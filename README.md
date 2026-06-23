# Expense Tracker API

API REST de gestión de gastos personales desarrollada con **NestJS**, **TypeScript**, **PostgreSQL** y **Prisma ORM**.

**Autores:** Juan Diego Aguilar Ángel · Juan Patiño Flórez · Juan Camilo Pinzón Marín · Julián Giovanny Rey Mora · Marta Teresa Velandia Urrego  
**Curso:** Integración Continua — Politécnico Grancolombiano  
**Profesor:** Jesús Figueroa Guerrero  
**Repositorio:** [github.com/JuanFlorez1326/ExpenseTrackerAPI](https://github.com/JuanFlorez1326/ExpenseTrackerAPI)

---

## Entregas del curso

| # | Semana | Tema | Documento |
|---|--------|------|-----------|
| 1 | Semana 3 | Proyecto en GitHub + dos contenedores Docker comunicados | [README-DELIVERY1.md](README-DELIVERY1.md) |
| 2 | Semana 5 | Jenkins como gestor de integración continua | [README-DELIVERY2.md](README-DELIVERY2.md) |
| 3 | Semanas 7-8 | Integración completa: Docker + Jenkins + Travis CI + GitHub Actions | [README-DELIVERY3.md](README-DELIVERY3.md) |

---

## Entrega 1 — Semana 3

> Crear el proyecto en GitHub y emplear Docker para construir dos contenedores comunicados entre sí.

**Requisito cumplido:** el archivo `docker-compose.yml` define dos servicios (`expense_tracker_api` y `expense_tracker_db`) que se comunican a través de la red interna `expense_network`.

Ver documentación completa: [README-DELIVERY1.md](README-DELIVERY1.md)

---

## Entrega 2 — Semana 5

> Implementar Jenkins como gestor de operaciones de integración continua.

**Requisito cumplido:** se implementó un pipeline declarativo en `Jenkinsfile` con 8 etapas (checkout, dependencias, lint, pruebas unitarias, cobertura, build, Docker build y Docker push), junto con el documento de características requeridas para la instalación y configuración de Jenkins.

Ver documentación completa: [README-DELIVERY2.md](README-DELIVERY2.md)

---

## Entrega 3 — Semanas 7 y 8

> Plataforma de software totalmente integrada con contenedores, Jenkins, Travis CI y Codeship. Historial de cambios, sugerencias para solución de problemas, responsabilidades y opiniones consolidados en un documento.

**Requisitos cumplidos:**
- `.travis.yml` — pipeline completo en Travis CI: lint, pruebas unitarias, cobertura, build, Docker build y push. Build #2 ejecutado exitosamente sobre `feature/entrega3`, imagen publicada en Docker Hub como `:2` y `:latest`.
- `.github/workflows/ci.yml` — pipeline de GitHub Actions (reemplazo de Codeship, discontinuado en 2024) con 10 steps: checkout, Node.js, dependencias, Prisma, lint, tests, cobertura, build, Docker login y Docker push.
- `README-DELIVERY3.md` — documento final con historial de commits, guía de troubleshooting por herramienta, responsabilidades por integrante y lecciones aprendidas.

Ver documentación completa: [README-DELIVERY3.md](README-DELIVERY3.md)

---

## Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/JuanFlorez1326/ExpenseTrackerAPI
cd ExpenseTrackerAPI

# Copiar variables de entorno
cp .env.example .env

# Levantar API + base de datos
docker-compose up --build
```

API disponible en `http://localhost:3000/api/v1`  
Swagger disponible en `http://localhost:3000/docs`

---

## Evolución del proyecto por entrega

```
╔═════════════════════════════════════════════════════════════════════════╗
║                        EXPENSE TRACKER API                              ║
║              Proyecto de Integración Continua — Politécnico             ║
╚═════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│  ENTREGA 1 — Semana 3                                                   │
│  GitHub + Docker                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Repositorio GitHub                                                    │
│   github.com/JuanFlorez1326/ExpenseTrackerAPI                           │
│                                                                         │
│   ┌──────────────────────────────────────────┐                          │
│   │           Red: expense_network           │                          │
│   │                                          │                          │
│   │  ┌─────────────────┐   ┌───────────────┐ │                          │
│   │  │  Contenedor 1   │   │  Contenedor 2 │ │                          │
│   │  │  expense_       │◄─►│  expense_     │ │                          │
│   │  │  tracker_api    │   │  tracker_db   │ │                          │
│   │  │  NestJS :3000   │   │  PostgreSQL   │ │                          │
│   │  └─────────────────┘   │  :5432        │ │                          │
│   │                        └───────────────┘ │                          │
│   └──────────────────────────────────────────┘                          │
│                                                                         │
│   Archivos clave: Dockerfile · docker-compose.yml                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ENTREGA 2 — Semana 5                                                   │
│  Jenkins CI                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   git push ──► GitHub ──webhook──► Jenkins :8080                        │
│                                        │                                │
│               ┌────────────────────────▼──────────────────────┐         │
│               │  Pipeline declarativo (Jenkinsfile)           │         │
│               │                                               │         │
│               │  1. Checkout          5. Cobertura de código  │         │
│               │  2. Instalar deps     6. Build (dist/)        │         │
│               │  3. Lint              7. Docker Build         │         │
│               │  4. Pruebas unitarias 8. Docker Push          │         │
│               └───────────────────────────────────────────────┘         │
│                                        │                                │
│                                        ▼                                │
│                               Docker Hub                                │
│                        juanflorez1326/expense-tracker-api               │
│                                                                         │
│   Archivos clave: Jenkinsfile · Dockerfile.jenkins                      │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ENTREGA 3 — Semanas 7 y 8                                              │
│  Travis CI + GitHub Actions (reemplazo de Codeship)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   git push ──► GitHub                                                   │
│                  │                                                      │
│                  ├──► Travis CI ──────────────────────────────────┐     │
│                  │    (.travis.yml)                               │     │
│                  │    Install → Prisma → Lint → Tests →           │     │
│                  │    Coverage → Build → Docker Build → Push      │     │
│                  │                                                │     │
│                  └──► GitHub Actions ─────────────────────────────┤     │
│                       (.github/workflows/ci.yml)                  │     │
│                       Checkout → Node 20 → Install → Prisma →     │     │
│                       Lint → Tests → Coverage → Build →           │     │
│                       Docker Login → Docker Push                  │     │
│                                                                   │     │
│                                                    ▼              │     │
│                                             Docker Hub ◄──────────┘     │
│                                   :latest · :2 (Travis) · :4 (GHA)      │
│                                                                         │
│   Archivos clave: .travis.yml · .github/workflows/ci.yml                │
│                   codeship-services.yml · codeship-steps.yml            │
│                   (Codeship discontinuado en 2024—archivos conservados) │
└─────────────────────────────────────────────────────────────────────────┘
```

Expense Tracker API