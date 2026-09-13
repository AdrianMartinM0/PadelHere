---
id: prd-padelhere
type: prd
title: "Visión de Producto"
---
# PRD: PadelHere - Visión de Producto

## 1. Visión del Producto
PadelHere es una plataforma de gestión de pádel que conecta jugadores con clubes, facilitando reservas, partidos y gestión de torneos, manteniendo la flexibilidad operativa híbrida (manual/digital).

## 2. Alcance (Scope)

### 2.1 Funcionalidades Actuales (MVP Estabilizado - VERIFIED FACT)
*   Gestión de perfiles (Usuarios y Clubes).
*   Sistema de niveles (cálculo interno).
*   Gestión de pistas (configuración horaria).
*   Reservas (Puntuales y Manuales).
*   Partidos (4 jugadores, slots, chat).

### 2.2 Funcionalidades a Desarrollar

#### AHORA (Prioridad 1)
*   **Saneamiento Técnico:** Centralización API, gestión de variables de entorno, eliminación de URLs hardcodeadas.

#### SIGUIENTE FASE
*   **Gestión de Torneos:** Manual en creación/publicación, Automática en cuadros/progresión. Propietario: Club o PadelHere.
*   **Sistema de Pagos (Arquitectura Agnóstica):** Implementación de Patrón Strategy (`IPaymentProcessor`). Flujo híbrido (Manual hoy -> Automático futuro).
*   **Gestión de Usuarios y Roles:** Creación de rol `Admin` para validación de clubes.
*   **Reglas de Cancelación:** Configurables por club.
*   **Reservas Recurrentes:** Inclusión de excepciones.
*   **Analíticas:** Dashboard para clubes (reservas manuales + online).

#### FUTURO
*   **Pasarelas de Pago Automáticas:** Integración (ej. Stripe/Redsys).
*   **Reseteo BBDD:** Limpieza de datos dummy en producción.

## 3. Decisiones Pendientes (OPEN QUESTIONS / PROPOSALS)
*   **Moderación:** ¿Cómo funcionará exactamente la moderación de chats/denuncias por parte del rol Admin? (PROPOSAL).
*   **Validaciones FEP/ISO:** Uso de librerías para formato teléfono/email. (PROPOSAL).
