---
id: project-context
type: doc
title: Contexto Técnico
---
# Contexto técnico de PadelHere

Este documento contiene el contexto técnico verificado del proyecto PadelHere y sirve como referencia para el desarrollo y mantenimiento del sistema.

## 1. Stack Tecnológico Verificado

### Backend
- **Framework:** FastAPI (Python 3)
- **Servidor ASGI:** Uvicorn / Hypercorn
- **Validación de Datos:** Pydantic (v2)
- **Base de Datos:** MongoDB
- **Driver DB:** PyMongo
- **Autenticación:** JWT (PyJWT) y Google OAuth (google-auth)

### Frontend
- **Framework:** React 18+ con TypeScript
- **Tooling:** Vite
- **Estilos:** Tailwind CSS (v4)
- **Iconografía:** Lucide React
- **Gráficas:** Recharts (utilizado para evolución de nivel)
- **Enrutamiento:** React Router 7

---

## 2. Arquitectura y Estructura del Proyecto

### Backend (`api/`)
Sigue un patrón de capas para separar responsabilidades:
- `main.py`: Punto de entrada, configuración de CORS y montaje de routers.
- `routes/`: Definición de endpoints HTTP.
- `controllers/`: Lógica de orquestación entre la petición y los servicios. Manejo de excepciones `HTTPException`.
- `services/`: Lógica de negocio pura e interacción con la base de datos.
- `database/models/`: Esquemas de Pydantic para validación y tipado.
- `database/db.py`: Configuración de la conexión a MongoDB y acceso a colecciones.
- `websockets/`: Implementación de comunicación bidireccional.
- `utils/`: Utilidades para tokens, actualización de niveles y lógica común.

### Frontend (`front/`)
- `src/App.tsx`: Definición de rutas (públicas vs privadas por tipo de usuario).
- `src/context/AuthContext.tsx`: Gestión centralizada de sesión, token y datos de perfil.
- `src/components/principales/`: Componentes core de la aplicación (Partidos, Reservas, Clubs, Chats).
- `src/components/Profile/`: Perfiles específicos para Usuarios y Clubes.

---

## 3. Base de Datos y Modelos (MongoDB)

### Colecciones Identificadas
1. `usuario`: Datos de jugadores, nivel actual y referencias a reservas.
2. `club`: Información del club, dirección y configuración general.
3. `pista`: Definición de pistas, incluyendo `PistaConfig` (disponibilidad horaria semanal).
4. `reserva`: Registros de alquiler de pistas (vincula usuario/club/pista).
5. `partido`: Encuentros de 4 jugadores con gestión de slots y resultados.
6. `chat`: Hilos de conversación asociados a cada partido.
7. `mensaje`: Contenido de los chats.
8. `history_level`: Historial cronológico de la evolución del nivel de los jugadores.

### Convenciones de Datos
- **ObjectIds:** Es una práctica común convertir `_id` de `ObjectId` a `str` en la capa de servicios antes de retornar datos al frontend.
- **Fechas:** Se utiliza el formato ISO 8601 en strings para comunicación entre capas, aunque algunas validaciones internas usan `datetime` de Python.

---

## 4. Autenticación y Seguridad

- **JWT:** Tokens generados con una validez de 15 días.
- **User Types:** El sistema distingue estrictamente entre `user` (jugador) y `club`. El `AuthContext` y los decoradores de rutas deben validar este `user_type`.
- **Recuperación:** Uso de `recovery_code` (passcode numérico) con expiración de 30 minutos almacenado directamente en el documento del usuario/club.

---

## 5. Comunicación en Tiempo Real (WebSockets)

El proyecto utiliza WebSockets para:
- `wss://.../ws/partidos`: Notificaciones de nuevos participantes en partidos.
- `wss://.../ws/reservas`: Actualización de estado de pistas para clubes.
- `wss://.../ws/chat`: Mensajería instantánea.

---

## 6. Convenciones de Código Observadas

- **Backend:**
  - Uso extensivo de funciones `async/await` en servicios y controladores.
  - Validación de horas con expresiones regulares en los modelos (formato `HH:MM`).
  - Servicios que retornan diccionarios limpios o modelos Pydantic.
- **Frontend:**
  - Componentes funcionales con Hooks.
  - Gestión de estilos vía clases de Tailwind.
  - Consumo de API mediante `fetch` directamente en los componentes o contexto.

---

## 7. Configuración y Entornos

- **Backend:** Requiere un archivo `.env` con `MONGO_URI`, `SECRET_KEY` y `GOOGLE_CLIENT_ID`.
- **Frontend:** Actualmente las URLs de la API están hardcodeadas hacia `https://padelhere.onrender.com/v1/`.

---

## 8. Deuda Técnica Conocida

- **Hardcoding:** La URL del backend no está parametrizada en el frontend.
- **Fragmentación de API:** Falta una capa de cliente centralizada en el frontend; cada componente realiza sus propios `fetch`.
- **Inconsistencia de Tipos:** Conversión manual frecuente entre `str` y `ObjectId` en el backend que podría centralizarse.
- **TODOs:** Existe un `TODO` crítico en `api/utils/level_update.py` para la consulta real de partidos de los últimos 30 días.

---

## 9. Precauciones al Modificar

- **Doble Perfil:** Cualquier cambio en la autenticación debe contemplar tanto a usuarios como a clubes.
- **Integridad de Reservas:** La lógica de solapamiento de horarios en `api/services/pista_services.py` es crítica; cambios aquí requieren pruebas de concurrencia.
- **BSON/JSON:** Asegurarse siempre de que los `ObjectId` no se intenten serializar directamente a JSON sin conversión previa a string.
- **Zonas Horarias:** Se observa lógica específica para `Europe/Madrid` y conversiones a UTC en los servicios de chat; mantener esta consistencia.
