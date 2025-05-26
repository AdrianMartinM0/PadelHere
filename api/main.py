# from typing import Union
from fastapi import FastAPI, APIRouter
from .routes import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir cualquier origen
    # allow_credentials=True,  # Permitir el envío de cookies o credenciales
    allow_methods=["*"],  # Permitir cualquier método HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir cualquier encabezado
)

router = APIRouter()

app.include_router(api_router.router, prefix='/v1')

# Arrancar server: fastapi dev main.py

# IMPORTANTEEEEEEE
# Para los Pagos usamos Redsys, eliminamos datos de cuenta bancarai de la BBDD
# Creamos una tabla de pagos que almacene {
#   "_id": ObjectId("6608a8f5c5a1b77f7d3e7a01"),
#   "reserva_id": ObjectId("66089bcd234567890abcdef1"),
#   "usuario_id": ObjectId("66089abc1234567890def123"),
#   "id_transaccion": "TXN123456",
#   "estado_pago": "Aprobado",
#   "metodo_pago": "Online",
#   "ultimos_4": "1234",
#   "monto": 50.00,
#   "fecha_pago": ISODate("2025-03-31T12:00:00Z")
#   "evento_id": ObjectId("66089def34567890abcdef12")
# }
# En canso de pago presencial se quedan vacios los campos de:
#   "id_transaccion": "TXN123456",
#   "estado_pago": "Aprobado",
#   "ultimos_4": "1234",