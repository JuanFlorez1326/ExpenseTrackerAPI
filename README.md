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
