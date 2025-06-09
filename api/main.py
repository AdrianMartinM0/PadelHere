from fastapi import FastAPI, APIRouter, Request, Response
from routes import api_router
from fastapi.middleware.cors import CORSMiddleware
from websockets import reservas_ws, partido_ws, chat_ws

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "https://padelhere.es",
        "https://www.padelhere.es",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Especificar métodos explícitamente
    allow_headers=["*"],
)

# Handler para peticiones OPTIONS (preflight)
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

router = APIRouter()

app.include_router(api_router.router, prefix='/v1')

# Incluye routers de WebSocket
app.include_router(reservas_ws.router)
app.include_router(partido_ws.router)
app.include_router(chat_ws.router)

# Arrancar server: fastapi run main.py