from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List, Any
from bson import ObjectId
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


class PistaConfig(BaseModel):
    days: Dict[str, Any]
    overrides: Optional[Dict[str, Any]] = None
    trainings: Optional[List[Dict[str, Any]]] = None

    @field_validator("days")
    @classmethod
    def validate_days(cls, value: Dict[str, Any]) -> Dict[str, Any]:
        """Valida que 'days' contenga claves válidas para días de la semana y cada valor sea un diccionario"""
        valid_days = {"monday", "tuesday", "wednesday",
                      "thursday", "friday", "saturday", "sunday"}
        for day in value:
            if day.lower() not in valid_days:
                raise ValueError(f"Día inválido en 'days': {day}")
            if not isinstance(value[day], dict):
                raise ValueError(
                    f"El valor de '{day}' debe ser un diccionario con la configuración del día")
        return value

    @field_validator("trainings")
    @classmethod
    def validate_trainings(cls, value):
        """Valida que 'trainings' sea una lista de diccionarios si existe"""
        if value is not None and not all(isinstance(t, dict) for t in value):
            raise ValueError(
                "Cada entrenamiento ('trainings') debe ser un diccionario")
        return value


class Pista(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    club_id: PyObjectId = Field(...)
    name: str = Field(..., min_length=2, max_length=50)
    desc: Optional[str] = Field(None, max_length=200)
    config: PistaConfig

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Valida que el nombre solo contenga letras, números y espacios"""
        if not re.match(r"^[\w\sáéíóúüñÁÉÍÓÚÜÑ-]+$", value):
            raise ValueError(
                "El nombre solo puede contener letras, números, espacios y guiones")
        return value

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
