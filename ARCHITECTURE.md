# Arquitectura de PadelHere

Este documento detalla la arquitectura real y actual del proyecto PadelHere, basada en la inspección de la base de código y el descubrimiento brownfield.

## 1. Visión General de la Arquitectura
PadelHere es una aplicación web de tres capas (Frontend, Backend, Base de Datos) diseñada para conectar jugadores de pádel y clubes. La arquitectura utiliza una comunicación híbrida mediante HTTP (REST) para operaciones CRUD y autenticación, y WebSockets para actualizaciones en tiempo real (mensajería y estado de juegos/pistas).

## 2. Estructura del Proyecto

### Backend (FastAPI + MongoDB)
Localizado en la carpeta `api/`.
- **Layered Architecture:** Sigue un flujo unidireccional de responsabilidades.
- **Asincronía:** El núcleo utiliza `async/await` para operaciones de E/S no bloqueantes con MongoDB y WebSockets.

### Frontend (React + TypeScript)
Localizado en la carpeta `front/`.
- **SPA (Single Page Application):** Desarrollada con Vite.
- **Component-Driven:** Interfaz reactiva con gestión de estado global vía Context API.

---

## 3. Flujo de una Petición HTTP
El sistema sigue un patrón de capas estricto:
1.  **Frontend:** Realiza una petición `fetch` (ej. `POST /v1/partido/`).
2.  **Router (`api/routes/`):** Define el endpoint, valida el esquema básico y delega al controlador.
3.  **Controller (`api/controllers/`):** Orquesta la lógica, maneja excepciones HTTP y valida permisos si es necesario.
4.  **Service (`api/services/`):** Contiene la lógica de negocio pura e interactúa con la colección de MongoDB correspondiente.
5.  **Model/DB (`api/database/models/`):** Los modelos de Pydantic validan la estructura antes y después de la persistencia en MongoDB.

---

## 4. Arquitectura de React y Gestión del Estado

- **Router:** `react-router-dom` gestiona la navegación y la protección de rutas basadas en el estado de autenticación.
- **Estado Global:** `AuthContext.tsx` es la fuente de verdad para:
    - Estado de sesión (`isLoggedIn`, `token`).
    - Datos del perfil hidratados (`userData` para jugadores, `clubData` para clubes).
    - Tipado de usuario (`userType`).
- **Estado Local:** Uso intensivo de `useState` y `useEffect` para la lógica de componentes individuales (ej. formularios, modales, listas de partidos).

---

## 5. MongoDB y Entidades Principales

El esquema es flexible (NoSQL) pero mantiene relaciones lógicas mediante IDs:
- **`usuario`:** Perfil del jugador, nivel, historial de nivel (vía relación con `history_level`) e IDs de reservas.
- **`club`:** Información del club y configuración de disponibilidad horaria.
- **`pista`:** Entidad vinculada a un club. Contiene un objeto `config` complejo con horarios y excepciones.
- **`reserva`:** Vincula una `pista` con un `usuario` (o reserva manual por teléfono/nombre).
- **`partido`:** Estructura de 4 slots para jugadores, estado de resultados y vínculo con un chat.
- **`chat` / `mensaje`:** Almacenamiento de conversaciones grupales por partido.

---

## 6. Autenticación y Autorización

- **Mecanismo:** JWT (JSON Web Tokens) con algoritmo `HS256`.
- **Expiración:** 15 días.
- **Flujo:**
    1. El usuario se autentica vía `/login`.
    2. El backend genera el token incluyendo `sub` (email) y `type` (user/club).
    3. El frontend almacena el token en `localStorage`.
    4. Cada carga de la aplicación ejecuta una validación contra `/v1/usuario/verify-jwt`.
- **Google Auth:** Integración con el SDK de Google en el frontend y verificación de `id_token` en el backend para inicio de sesión social.

---

## 7. Arquitectura WebSocket

El backend utiliza routers específicos para WebSockets (`api/websockets/`):
- **Canales:**
    - `/ws/reservas`: Notifica a los clubes sobre nuevas reservas entrantes.
    - `/ws/partidos`: Notifica cambios en los participantes de un partido (unión/salida).
    - `/ws/chat`: Canal para la distribución de mensajes en tiempo real.
- **Patrón:** Emisión global. Actualmente, las funciones `notify_*` envían mensajes a todas las conexiones activas en el canal sin segmentación por ID de club o partido.

---

## 8. Flujo de Partidos

1. **Creación:** Un usuario crea un partido especificando fecha, hora y ubicación. El sistema crea automáticamente un `chat_id` asociado.
2. **Inscripción:** Los jugadores ocupan uno de los 4 slots (`pareja1_jugador1`, etc.).
3. **Validación:** Al inscribirse, se añade automáticamente al jugador al chat del partido.
4. **Resultado:** Una vez jugado, un jugador propone un resultado. Un jugador de la pareja contraria debe confirmarlo o rechazarlo para que el resultado sea válido.

---

## 9. Flujo de Reservas y Disponibilidad

- **Disponibilidad:** Se calcula en tiempo real comparando la configuración de la pista (`days` y `overrides`) con las reservas existentes en la colección `reserva`.
- **Lógica de Solapamiento:** Antes de insertar una reserva, el servicio verifica mediante un `$expr` de MongoDB que el nuevo intervalo de tiempo no colisione con uno existente.
- **Reservas Manuales:** El club puede insertar reservas sin `user_id`, solo con nombre y teléfono.

---

## 10. Sistema de Niveles

- **Nivel Inicial:** Se obtiene mediante un cuestionario en el frontend (`QuizLevel.tsx`).
- **Evolución:** Tras la confirmación de un resultado de partido, se dispara el cálculo en `level_update.py`.
- **Factores:** 
    - Resultado del partido (sets y juegos).
    - Diferencia de nivel con los oponentes.
    - Factor de actividad (basado en el volumen de partidos recientes).
- **Historial:** Cada cambio se registra en `history_level` para generar gráficas de evolución.

---

## 11. Integraciones Externas

- **Google Cloud Platform:** Para OAuth2 (Google Login).
- **Google Maps API:** Iframe interactivo para la ubicación de clubes.
- **Hosting:** Referencias a Render (`onrender.com`) en las URLs del frontend.

---

## 12. Gestión de Configuración y Entornos

- **Backend:** Uso de `.env` y el módulo `config.py` para cargar `MONGO_URI`, `SECRET_KEY` y credenciales de Google.
- **Frontend:** Uso de archivos `.env` (implícito, aunque actualmente se observa hardcoding de la URL de producción).

---

## 13. Decisiones Arquitectónicas Observadas

1. **Imágenes en Base64:** Se ha optado por almacenar las fotos de perfil directamente en MongoDB como strings base64 en lugar de un servicio de almacenamiento de objetos (S3/Cloudinary).
2. **Layered Services:** Se separa estrictamente la interacción con la base de datos de los controladores, facilitando la reutilización de lógica (ej. crear chat desde el servicio de partidos).
3. **Conversión Manual de Tipos:** El backend gestiona manualmente la conversión de `ObjectId` a `str` para compatibilidad con JSON.

---

## 14. Deuda Técnica y Limitaciones Conocidas

- **Aislamiento en WebSockets:** La falta de "rooms" (salas) provoca que todos los clientes reciban todas las actualizaciones de todos los partidos/reservas, lo que escala ineficientemente.
- **Hardcoding de API URL:** Se está eliminando el hardcoding de las URLs en componentes, centralizándolas en `front/src/api/apiClient.ts` para facilitar el cambio entre entornos (dev/prod).
- **Redundancia en AuthContext:** El contexto realiza peticiones de hidratación de datos cada vez que cambia el token, lo que puede causar múltiples llamadas innecesarias si no se controla el ciclo de vida del componente.
- **TODO en Niveles:** El cálculo de actividad aún tiene una implementación pendiente para la consulta de partidos de los últimos 30 días.
