# Roadmap de Desarrollo — PadelHere

Este documento recopila las épicas, mejoras técnicas y objetivos funcionales planificados para el proyecto PadelHere, priorizando una arquitectura web convencional (FastAPI + React + MongoDB) sin dependencias de IA.

---

## 1. Saneamiento Técnico e Infraestructura (Prioridad Actual)
- [x] **Limpieza de IA y agentes:** Eliminación de tooling externo (`_bmad/`, dependencias y configuraciones de agentes).
- [x] **Blindaje de repositorio:** Configuración estricta de `.gitignore` e identidad de Git propia.
- [x] **Pipeline CI básico:** Tests y linter de backend (pytest) y frontend (vitest/eslint) en GitHub Actions (`ci.yml`).
- [ ] **Desacoplamiento de URLs hardcodeadas:** Migrar todas las URLs de API y WebSockets (`wss://`) a variables de entorno (`.env`).
- [ ] **Centralización de servicios API en frontend:** Extraer peticiones `fetch` dispersas en componentes (`Pistas.tsx`, `CourtPanel.tsx`) a servicios dedicados.
- [ ] **Cobertura de tests:** Ampliar la suite de pruebas unitarias y de integración en backend (`api/tests/`) y frontend.

---

## 2. Observabilidad y Monitoreo (Futuro)
- [ ] **Configuración de Sentry (Opcional):**
  - Integrar DSN mediante variables de entorno (`SENTRY_DSN`).
  - Configurar filtro de datos sensibles / PII en `before_send` para no filtrar información privada de usuarios.

---

## 3. Funcionalidades de Negocio (Core)
- [ ] **Gestión de Torneos:** Cuadros de competición, emparejamientos y resultados.
- [ ] **Reservas Recurrentes:** Reglas de reserva periódica para usuarios y clubes.
- [ ] **Sistema de Pagos:** Integración de pasarela de pago para reservas y torneos.
- [ ] **Panel de Analíticas para Clubes:** Estadísticas de ocupación, horas punta e ingresos.
- [ ] **Roles y Verificación:** Distinción granular entre jugadores, administradores de club y superusuarios.

---

## 4. Mejoras de Despliegue y Base de Datos (Largo Plazo)
- [ ] Evaluar estabilidad del backend frente al spin-down de la capa gratuita de Render (opciones: keep-alive convencional, servicio permanente o migración de infraestructura si se justifica).
- [ ] Scripts de inicialización y migración controlada de esquemas en MongoDB.
