# Entrega 3 — Semanas 7 y 8: Integración Continua Completa

**Proyecto:** Expense Tracker API  
**Autores:** Juan Diego Aguilar Ángel · Juan Patiño Flórez · Juan Camilo Pinzón Marín · Julián Giovanny Rey Mora · Marta Teresa Velandia Urrego  
**Curso:** Integración Continua — Politécnico Grancolombiano  
**Profesor:** Jesús Figueroa Guerrero  
**Repositorio:** https://github.com/JuanFlorez1326/ExpenseTrackerAPI

---

## Descripción general de la plataforma

**Expense Tracker API** es una API REST construida con NestJS y PostgreSQL que permite la gestión de gastos personales: registro de usuarios, autenticación JWT, categorías, presupuestos y reportes. En esta entrega final, la plataforma queda completamente integrada con cuatro herramientas de integración y entrega continua: **Docker**, **Jenkins**, **Travis CI** y **Codeship**.

---

## 1. Herramientas integradas

### 1.1 Docker y Docker Compose (Entrega 1)

Dos contenedores comunicados en la red `expense_network`:

| Contenedor | Imagen base | Puerto | Función |
|------------|-------------|--------|---------|
| `expense_tracker_db` | `postgres:16-alpine` | 5432 | Base de datos PostgreSQL |
| `expense_tracker_api` | `node:20-alpine` (multi-stage) | 3000 | API NestJS |

**Levantar el ambiente local:**
```bash
docker compose up -d
```

El contenedor API espera a que PostgreSQL supere su healthcheck antes de arrancar (`depends_on` con `condition: service_healthy`).

---

### 1.2 Jenkins (Entrega 2)

Pipeline declarativo de 8 etapas definido en el archivo `Jenkinsfile`:

```
Checkout → Instalar dependencias → Lint → Pruebas unitarias
        → Cobertura de código → Build → Docker Build → Docker Push
```

Jenkins se ejecuta como contenedor usando la imagen personalizada `Dockerfile.jenkins` (Jenkins LTS + Docker CLI). El stage **Docker Push** publica la imagen en Docker Hub únicamente desde la rama `main`, usando las credenciales almacenadas con id `dockerhub-credentials`.

**Levantar Jenkins en Docker:**
```bash
docker build -t jenkins-with-docker -f Dockerfile.jenkins .
docker run -d --name jenkins -u root -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-with-docker
```

---

### 1.3 Travis CI (Entrega 3)

Configurado en el archivo `.travis.yml`. Travis CI ejecuta automáticamente el pipeline en cada push a GitHub mediante una integración nativa.

**Flujo de Travis CI:**

```
Push a GitHub → Travis CI
                    │
          ┌─────────▼──────────┐
          │  1. Install npm ci  │
          │  2. Lint            │
          │  3. Unit Tests      │
          │  4. Code Coverage   │
          │  5. Build           │
          │  6. Docker Build*   │
          │  7. Docker Push*    │
          └────────────────────┘
               * solo en main
```

**Variables de entorno requeridas en Travis CI** (configurar en Settings del repositorio en travis-ci.com):

| Variable | Descripción |
|----------|-------------|
| `DOCKER_USERNAME` | Usuario de Docker Hub |
| `DOCKER_PASSWORD` | Token de acceso de Docker Hub (Read & Write) |

**Activar Travis CI:**
1. Ingresar a https://app.travis-ci.com
2. Sincronizar cuenta de GitHub
3. Activar el repositorio `ExpenseTrackerAPI`
4. Agregar las variables de entorno en **Settings → Environment Variables**
5. El pipeline se disparará automáticamente en el siguiente push

---

### 1.4 Codeship (Entrega 3)

Configurado mediante dos archivos: `codeship-services.yml` (define los contenedores del pipeline) y `codeship-steps.yml` (define las etapas secuenciales de CI/CD).

**Flujo de Codeship Pro:**

```
Push a GitHub → Codeship Pro
                    │
          ┌─────────▼──────────────────┐
          │  Servicio: node (Node 20)   │
          │  1. npm ci                  │
          │  2. prisma generate         │
          │  3. prisma migrate deploy   │
          │  4. Lint                    │
          │  5. Unit Tests              │
          │  6. Code Coverage           │
          │  7. Build                   │
          │  Servicio: app (Docker)     │
          │  8. Docker Push*            │
          └────────────────────────────┘
               * solo en main
```

**Activar Codeship Pro:**
1. Ingresar a https://app.codeship.com
2. Crear un nuevo proyecto → conectar repositorio de GitHub
3. Seleccionar **Codeship Pro** como tipo de proyecto
4. Generar y cifrar credenciales de Docker Hub:
   ```bash
   jet encrypt dockercfg dockercfg.encrypted
   ```
5. Hacer commit de `dockercfg.encrypted` al repositorio
6. El pipeline se dispara automáticamente en cada push

> **Nota:** La herramienta `jet` (CLI de Codeship) se descarga desde https://github.com/codeship/jet/releases para generar el archivo `dockercfg.encrypted`. Este archivo cifrado nunca expone las credenciales en texto plano.

---

## 2. Historial de cambios

| Commit | Fecha | Descripción |
|--------|-------|-------------|
| `e284dab` | 2026-05-25 | `add: initial commit` — estructura base del proyecto NestJS + Prisma |
| `94ce951` | 2026-05-25 | `docs: Complete documentation added` — README principal |
| `8617e62` | 2026-05-25 | `docs: add Entrega 1 section with GitHub repo and Docker containers info` |
| `05eedf9` | 2026-05-27 | `ci: Jenkins added` — Jenkinsfile y Dockerfile.jenkins |
| `cbd8bad` | 2026-05-27 | `fix: sync package-lock.json with package.json` — corrige falla en `npm ci` |
| `554ecd4` | 2026-05-27 | `fix: add missing eslint and prettier config files` — corrige falla en stage Lint |
| `5adbadb` | 2026-05-27 | `docs: add successful pipeline build evidence` — capturas de pantalla de Jenkins |
| `2f57a14` | 2026-05-27 | `feat: enable Docker Build and Push stages` — habilita stages de Docker en el pipeline |
| `124329b` | 2026-05-27 | `fix: add jenkins user to docker group` — corrige error de permisos en socket de Docker |
| `bc0bb51` | 2026-05-27 | `docs: add pipeline and Docker Hub evidence screenshots` — evidencia de Docker Hub |
| *(entrega 3)* | 2026-06-11 | `feat: add Travis CI and Codeship configuration` — `.travis.yml`, `codeship-services.yml`, `codeship-steps.yml` |

---

## 3. Sugerencias para la solución de problemas

### 3.1 Jenkins

| Problema | Causa | Solución |
|----------|-------|----------|
| `Got permission denied while trying to connect to the Docker daemon socket` | El usuario `jenkins` no pertenece al grupo `docker` | `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins` |
| `npm ci` falla con "package-lock.json is not in sync" | `package-lock.json` no está actualizado respecto a `package.json` | Ejecutar `npm install` localmente y hacer commit del `package-lock.json` actualizado |
| Stage **Lint** falla con "ESLint couldn't find a configuration file" | `.eslintrc.js` no está en el repositorio | Asegurarse de que `.eslintrc.js` y `.prettierrc` estén commiteados |
| Stage **Docker Push** falla con "unauthorized" | Credencial `dockerhub-credentials` mal configurada o token expirado | Regenerar el token en Docker Hub (Read & Write) y actualizar la credencial en Jenkins |
| El pipeline no se dispara automáticamente | Webhook de GitHub no configurado | En la configuración del job de Jenkins activar **GitHub hook trigger for GITScm polling** y verificar el webhook en GitHub → Settings → Webhooks |

### 3.2 Travis CI

| Problema | Causa | Solución |
|----------|-------|----------|
| Build no aparece en Travis CI | Repositorio no activado | Ir a travis-ci.com → sincronizar → activar el repositorio |
| `DOCKER_USERNAME` o `DOCKER_PASSWORD` no reconocidas | Variables no configuradas | Settings del repositorio en Travis CI → Environment Variables → agregar ambas variables |
| Falla de conexión a PostgreSQL | Addon de PostgreSQL no disponible en el plan | Verificar que el plan de Travis CI incluya el addon; usar una base de datos SQLite en memoria como alternativa para los tests |
| Docker push bloqueado | Travis CI desactivó Docker Hub push gratuito | Usar un registry alternativo (GitHub Container Registry o GitLab Registry) |

### 3.3 Codeship

| Problema | Causa | Solución |
|----------|-------|----------|
| `dockercfg.encrypted` inválido | Cifrado con versión incorrecta de `jet` | Descargar la versión más reciente de `jet` y volver a cifrar |
| Paso `docker-push` falla | Archivo `dockercfg.encrypted` no commiteado | Hacer commit del archivo cifrado al repositorio |
| Servicio `postgres` no listo cuando inicia `node` | Race condition en el arranque | Agregar un step de espera: `command: until pg_isready -h postgres; do sleep 1; done` |
| Pipeline no usa `codeship-steps.yml` | Tipo de proyecto configurado como Codeship Basic | Crear un nuevo proyecto de tipo **Codeship Pro** en app.codeship.com |

### 3.4 Docker / Docker Compose

| Problema | Causa | Solución |
|----------|-------|----------|
| API falla con "connection refused" a PostgreSQL | Contenedor de API arranca antes que PostgreSQL esté listo | Ya está manejado con `depends_on: condition: service_healthy`. Si persiste, aumentar `retries` en el healthcheck |
| Puerto 5432 ya en uso | PostgreSQL local corriendo en el host | Cambiar el mapeo de puertos: `5433:5432` en `docker-compose.yml` |
| Imagen no se actualiza después de cambios en el código | Docker usa caché del build anterior | Construir con `docker compose build --no-cache` |

---

## 4. Responsabilidades del equipo

| Integrante | Responsabilidad principal |
|-----------|--------------------------|
| **Juan Diego Aguilar Ángel** | Arquitectura de la API (módulos NestJS: Auth, Expenses, Categories, Budgets, Reports), esquema de base de datos en Prisma |
| **Juan Patiño Flórez** | Configuración y mantenimiento del pipeline de Jenkins, Dockerfile multi-stage, Docker Compose, gestión de credenciales |
| **Juan Camilo Pinzón Marín** | Suite de pruebas unitarias (Jest), configuración de ESLint y Prettier, reportes de cobertura de código |
| **Julián Giovanny Rey Mora** | Configuración de Travis CI (`.travis.yml`), configuración de Codeship (`codeship-services.yml`, `codeship-steps.yml`), integración con Docker Hub |
| **Marta Teresa Velandia Urrego** | Documentación técnica de las tres entregas, historial de cambios, guías de instalación y troubleshooting |

---

## 5. Opiniones y lecciones aprendidas

### Juan Diego Aguilar Ángel
La integración continua cambió la forma en que escribimos código. Al tener Jenkins ejecutando pruebas automáticas en cada push, empezamos a escribir pruebas antes de mergear cualquier cambio. La mayor dificultad fue configurar Prisma dentro del contenedor Docker de CI: el cliente ORM debe generarse durante el build y las migraciones deben ejecutarse con una base de datos disponible, lo que requirió ajustar el orden de los servicios tanto en Jenkins como en Codeship.

### Juan Patiño Flórez
Jenkins fue la herramienta más desafiante del proyecto. El principal obstáculo fue el acceso al socket de Docker desde el contenedor de Jenkins en Windows: fue necesario ejecutar el contenedor como `root` con `-u root` y montar `/var/run/docker.sock`. Una vez resuelto ese problema, el pipeline declarativo resultó muy expresivo y fácil de mantener. La separación de stages hace que sea inmediato identificar en qué punto falla un build.

### Juan Camilo Pinzón Marín
Configurar correctamente las pruebas para CI requirió más trabajo del esperado. Jest necesita la flag `--forceExit` cuando hay conexiones de base de datos abiertas, y `--passWithNoTests` evita fallos cuando se agregan nuevas rutas sin pruebas todavía. La publicación del reporte de cobertura en Jenkins mediante el plugin HTML Publisher fue muy útil para visualizar qué partes del código aún no tienen cobertura.

### Julián Giovanny Rey Mora
Travis CI y Codeship comparten el concepto de pipeline como código (YAML), pero difieren en su arquitectura: Travis CI ejecuta un único proceso en una máquina virtual, mientras que Codeship Pro levanta contenedores Docker independientes para cada servicio. Esto hace que Codeship sea más fiel al ambiente de producción, pero más complejo de configurar. El cifrado de credenciales con `jet` es un paso adicional que Travis CI no requiere (sus secrets se configuran directamente en la UI).

### Marta Teresa Velandia Urrego
El mayor aprendizaje de este proyecto fue entender que la integración continua no es solo una herramienta, sino una práctica cultural. Los pipelines en Jenkins, Travis CI y Codeship son apenas la automatización de lo que el equipo acordó como estándar de calidad: lint, pruebas, cobertura y empaquetado en Docker. Sin acuerdos sobre cómo escribir código y pruebas, ninguna herramienta de CI funciona bien. La documentación continua de problemas y soluciones (este historial) es tan valiosa como el código mismo.

---

## 6. Estructura completa de archivos CI/CD

```
entrega 1/
├── .travis.yml              ← Pipeline de Travis CI
├── codeship-services.yml    ← Servicios Docker de Codeship Pro
├── codeship-steps.yml       ← Etapas del pipeline de Codeship Pro
├── Jenkinsfile              ← Pipeline declarativo de Jenkins (8 stages)
├── Dockerfile               ← Imagen multi-stage de la API (builder + production)
├── Dockerfile.jenkins       ← Imagen Jenkins personalizada con Docker CLI
├── docker-compose.yml       ← Dos contenedores: PostgreSQL + NestJS API
├── README-DELIVERY1.md      ← Documento Entrega 1: Docker y contenedores
├── README-DELIVERY2.md      ← Documento Entrega 2: Jenkins
└── README-DELIVERY3.md      ← Este documento: integración completa
```

---

## 7. Diagrama de integración completa

```
Developer
    │
    │  git push
    ▼
GitHub (repositorio)
    │
    ├──── webhook ────► Jenkins (localhost:8080)
    │                       │
    │                       ▼
    │               Pipeline declarativo
    │               (Jenkinsfile)
    │               Checkout → Lint → Tests →
    │               Coverage → Build →
    │               Docker Build → Docker Push
    │
    ├──── evento ─────► Travis CI (app.travis-ci.com)
    │                       │
    │                       ▼
    │               Pipeline en VM Linux
    │               (.travis.yml)
    │               Install → Lint → Tests →
    │               Coverage → Build →
    │               Docker Build → Docker Push
    │
    └──── evento ─────► Codeship Pro (app.codeship.com)
                            │
                            ▼
                    Pipeline en contenedores
                    (codeship-services.yml +
                     codeship-steps.yml)
                    Install → Prisma → Lint →
                    Tests → Coverage → Build →
                    Docker Push
                            │
                            ▼
                      Docker Hub
              juanflorez1326/expense-tracker-api
                  :latest | :<build-number>
```
