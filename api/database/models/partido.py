from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class PartidoResultado(BaseModel):
    estado: Literal["pendiente_confirmacion", "confirmado", "rechazado"] = Field(..., description="Estado del resultado")
    propuesto_por: str = Field(..., description="ID del usuario que propone el resultado")
    resultado: str = Field(..., description="Detalle del resultado, formato libre (ej: 6-3 3-6 7-5)")
    confirmado_por: Optional[str] = Field(None, description="ID del usuario que confirma el resultado")
    confirmado: Optional[bool] = Field(False, description="¿Ha sido confirmado el resultado?")
    rechazado_por: Optional[str] = Field(None, description="ID del usuario que rechaza el resultado")
    fecha_propuesta: Optional[str] = Field(None, description="Fecha de la propuesta del resultado")
    fecha_confirmacion: Optional[str] = Field(None, description="Fecha de la confirmación del resultado")
    fecha_rechazo: Optional[str] = Field(None, description="Fecha del rechazo del resultado")

class Partido(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    localizacion: str = Field(..., min_length=2, max_length=100)
    fecha: str = Field(..., regex=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    hora: str = Field(..., regex=r"^\d{2}:\d{2}$")          # HH:MM
    created_by: PyObjectId = Field(...)
    pareja1_jugador1: Optional[str] = Field(default=None, description="ID del usuario en esta posición")
    pareja1_jugador2: Optional[str] = Field(default=None, description="ID del usuario en esta posición")
    pareja2_jugador1: Optional[str] = Field(default=None, description="ID del usuario en esta posición")
    pareja2_jugador2: Optional[str] = Field(default=None, description="ID del usuario en esta posición")
    resultado: Optional[PartidoResultado] = Field(default=None, description="Resultado del partido con validación")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @field_validator("localizacion")
    @classmethod
    def validate_localizacion(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("La localización no puede estar vacía")
        return value

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}