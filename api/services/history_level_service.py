from typing import List
from bson import ObjectId
from database.db import history_level_collection

# Inserta (o crea si no existe) el histórico de un usuario, agregando el nuevo nivel al final del array
def add_level_to_history(user_id: str, nuevo_nivel: int):
    history_level_collection.update_one(
        {"user_id": user_id},
        {"$push": {"niveles": nuevo_nivel}},
        upsert=True
    )

# Devuelve el histórico completo de niveles de un usuario (None si no existe)
def get_level_history(user_id: str) -> List[int]:
    doc = history_level_collection.find_one({"user_id": user_id})
    if doc and "niveles" in doc:
        return doc["niveles"]
    return []

# Devuelve el último nivel registrado de un usuario (None si no existe)
def get_last_level(user_id: str) -> int:
    doc = history_level_collection.find_one({"user_id": user_id}, {"niveles": 1})
    if doc and "niveles" in doc and doc["niveles"]:
        return doc["niveles"][-1]
    return None

# Inicializa el histórico de niveles de un usuario (por ejemplo, al crear usuario)
def init_level_history(user_id: str, nivel_inicial: int):
    history_level_collection.update_one(
        {"user_id": user_id},
        {"$set": {"niveles": [nivel_inicial]}},
        upsert=True
    )

# Borra el histórico de un usuario (por si quieres reiniciar)
def clear_level_history(user_id: str):
    history_level_collection.delete_one({"user_id": user_id})