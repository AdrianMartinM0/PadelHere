---
id: sprint-planning-fase1
type: doc
title: Planificación Sprint Fase 1
---
# Sprint Planning: Fase 1 - Consolidación de Calidad Técnica

**Objetivo:** Mitigar los riesgos funcionales y de seguridad detectados en la Fase 0.5 para garantizar una base estable antes de iniciar nuevas funcionalidades.

---

### Backlog del Sprint

| ID | Story | Prioridad |
| :--- | :--- | :--- |
| **S-1.1** | Saneamiento funcional: Refactor Hooks en `CourtPanel.tsx` | Alta |
| **S-1.2** | Implementación de filtros PII en Sentry (`before_send`) | Alta |
| **S-1.3** | Ampliación suite tests backend (Servicios/Rutas) | Media |

---

### Detalles de las Stories

#### S-1.1: Saneamiento de Hooks
*   **Contexto:** La violación de `rules-of-hooks` en `CourtPanel.tsx` compromete la integridad del estado.
*   **Criterio de Aceptación:** `npm run lint` no reporta violaciones de `rules-of-hooks`; funcionalidad original preservada.

#### S-1.2: Filtros de Privacidad en Sentry
*   **Contexto:** Garantizar que ningún dato sensible (PII/secrets) llegue a Sentry.
*   **Criterio de Aceptación:** Implementación de `before_send` / `beforeSend` que filtre cabeceras y campos específicos. Verificación mediante test.

#### S-1.3: Ampliación de Tests
*   **Contexto:** Cubrir servicios críticos de backend.
*   **Criterio de Aceptación:** Aumento de cobertura en servicios principales; CI exitoso con nuevas pruebas.

---

### Estrategia y Ejecución
1.  **Iteración:** Una historia a la vez.
2.  **Validación:** Cada Story debe pasar linting y testing antes de cerrarse.
3.  **Metodología:** TDD para nuevas pruebas; enfoque incremental para refactorización.
