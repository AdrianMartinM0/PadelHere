---
id: spec-saneamiento-api
type: spec
title: Spec Saneamiento API
area: Infrastructure
---
# SPEC: Saneamiento Técnico de la Capa de Comunicación API

## 1. Contexto
El frontend de PadelHere presenta URLs hardcodeadas (`onrender.com`), fragmentación de la lógica de red (`fetch` disperso en componentes) y falta de un punto centralizado para gestionar el token de autenticación en las peticiones. Esto dificulta el desarrollo local y el despliegue en diferentes entornos.

## 2. Objetivos
- Centralizar la comunicación con la API.
- Parametrizar la URL base mediante variables de entorno (`VITE_API_URL`).
- Reducir deuda técnica en componentes y contexto.

## 3. Criterios de Éxito
- [ ] La aplicación funciona correctamente utilizando `VITE_API_URL` para todas las peticiones.
- [ ] `front/src/api/apiClient.ts` existe y gestiona los headers de autorización.
- [ ] `AuthContext` utiliza `apiClient` para sus llamadas.
- [ ] No hay llamadas directas a `fetch` con URLs absolutas a `onrender.com`.

## 4. Invariantes
- Se debe mantener la persistencia y validación del JWT actual.
- No se deben alterar los endpoints del backend.
