---
id: retro-saneamiento-api
type: retro
title: Retrospectiva Saneamiento API
---
# Retrospectiva: Saneamiento de la Infraestructura API (Épica 1)

## 1. Resumen
Esta épica tuvo como objetivo principal eliminar la deuda técnica consistente en URLs de API hardcodeadas y descentralizadas. Se logró centralizar la comunicación en un único cliente (`apiClient.ts`) y migrar los más de 50 componentes que hacían llamadas directas.

## 2. Hallazgos
- **Consistencia:** Se logró un patrón uniforme `apiClient.request<T>(endpoint, options)`.
- **Mantenibilidad:** La URL base ahora es configurable (`VITE_API_URL`), facilitando despliegues.
- **Robustez:** La gestión centralizada de errores facilita la depuración.
- **Trazabilidad:** Se identificó la necesidad de mejorar los mensajes de commit para futuras épicas.

## 3. Acciones de Mejora (Procesos)
- **Mensajes de Commit:** Adoptar convenciones de mensajes más descriptivos.
- **Encapsulamiento:** En componentes complejos (ej. `Pistas.tsx`), extraer la lógica de API a servicios independientes en el futuro.

## 4. Veredicto
**Estado:** ACEPTADO

---

