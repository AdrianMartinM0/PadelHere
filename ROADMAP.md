# Roadmap Oficial de Desarrollo — PadelHere

Este documento consolida la planificación técnica, historias de usuario y mejoras del proyecto PadelHere.
Sigue una arquitectura web convencional (FastAPI + React + MongoDB) sin dependencias ni tooling de IA.

---

## 1. CI, Infraestructura y Pipelines (En Progreso)
Automatización de validaciones, despliegues y desacoplamiento de entorno.

- [x] **[CI-01]** Pipeline Backend (lint + pytest) *(Prioridad: Alta)*
- [x] **[CI-02]** Pipeline Frontend (eslint + vitest + build) *(Prioridad: Alta)*
- [x] **[CI-03]** Gate de PR obligatorio en develop/main *(Prioridad: Alta)*
- [x] **[CI-12]** Migrar URLs `wss://` a constantes configurables *(Prioridad: Media)*
- [x] **[CI-13]** Extraer lógica API de `Pistas.tsx` a servicios dedicados *(Prioridad: Media)*
- [x] **[CI-07]** Secretos y variables de entorno en CI (`.env.example`) *(Prioridad: Alta)*
- [x] **[CI-11]** Check / linter para evitar URLs hardcodeadas (`wss`/`fetch`) *(Prioridad: Media)*
- [ ] **[CI-04]** Cobertura mínima de tests en backend *(Prioridad: Media)*
- [ ] **[CI-05]** Cobertura mínima de tests en frontend *(Prioridad: Media)*
- [x] **[CI-06]** Caché de dependencias (`pip`/`npm`) en GitHub Actions *(Prioridad: Media)*
- [ ] **[CI-08]** Pipeline de despliegue a staging/develop *(Prioridad: Alta)*
- [ ] **[CI-09]** Pipeline de despliegue a producción (`main`) *(Prioridad: Alta)*
- [ ] **[CI-10]** Healthcheck post-deploy *(Prioridad: Media)*
- [ ] **[CI-14]** Badges de CI y build en `README.md` *(Prioridad: Baja)*
- [ ] **[CI-15]** Documentar flujo de deployment y rollback *(Prioridad: Media)*

---

## 2. Saneamiento de la Capa de Comunicación API (Completado)
Estandarización del cliente HTTP y manejo de tokens.

- [x] **[API-01]** Infraestructura de Entorno y Cliente API Base (`apiClient`) *(Prioridad: Alta)*
- [x] **[API-02]** Migración del Contexto de Autenticación a `apiClient` *(Prioridad: Media)*
- [x] **[API-03]** Migración Progresiva de Componentes core *(Prioridad: Media)*

---

## 3. Funcionalidades de Negocio (Core PadelHere)
Próximas épicas funcionales para la gestión de pádel y clubes.

- [ ] **Torneos y Competiciones:** Generación de cuadros clasificatorios, horarios y registro de resultados.
- [ ] **Reservas Recurrentes:** Lógica de reservas fijas semanales para socios y pistas de club.
- [ ] **Pasarela de Pagos:** Integración para cobro de reservas de pista y cuotas de torneo.
- [ ] **Estadísticas y Analíticas:** Panel de ocupación de pistas e ingresos para administradores de club.
- [ ] **Roles y Permisos Granulares:** Distinción estricta entre Administrador de Club, Jugador y Superadmin.
