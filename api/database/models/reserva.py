from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from bson import ObjectId
from datetime import datetime, time
import re

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class Reserva(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    pista_id: PyObjectId
    club_id: PyObjectId
    fecha: datetime
    hora_inicio: str  # formato "HH:MM"
    hora_fin: str     # formato "HH:MM"
    tipo: Optional[str] = "reserva"  # "reserva" o "entrenamiento"
    user_id: Optional[PyObjectId] = None
    nombre: Optional[str] = None
    telefono: Optional[str] = None

    @field_validator("hora_inicio", "hora_fin")
    @classmethod
    def validate_hora(cls, value: str) -> str:
        """Valida que la hora esté en formato HH:MM"""
        if not re.match(r"^\d{2}:\d{2}$", value):
            raise ValueError("La hora debe tener formato HH:MM")
        try:
            time.fromisoformat(value)
        except ValueError:
            raise ValueError("Hora inválida.")
        return value

    @field_validator("tipo")
    @classmethod
    def validate_tipo(cls, value: str) -> str:
        """Valida que el tipo sea 'reserva' o 'entrenamiento'"""
        if value not in ("reserva", "entrenamiento"):
            raise ValueError("El tipo debe ser 'reserva' o 'entrenamiento'")
        return value

    @model_validator(mode="after")
    def check_time_order(self):
        """Valida que hora_fin sea mayor que hora_inicio"""
        hi = time.fromisoformat(self.hora_inicio)
        hf = time.fromisoformat(self.hora_fin)
        if hi >= hf:
            raise ValueError("hora_fin debe ser mayor que hora_inicio")
        return self

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}