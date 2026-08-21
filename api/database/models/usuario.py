from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
import re
import bcrypt
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):  # <-- Añadido info para compatibilidad pydantic v2
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(str(v))

class User(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: Optional[str] = Field(default=None)  # <-- Ahora es opcional y por defecto None
    tel: Optional[int] = None
    img_perfil: Optional[bytes] = None
    desc: Optional[str] = None
    level: float = Field(default=0)
    reservas: Optional[list] = Field(default_factory=list)
    deleted: bool = Field(default=False)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        """ Valida que la contraseña tenga al menos una mayúscula, un número y un carácter especial """
        # Solo valida si existe (no para usuarios OAuth)
        if value is not None:
            if not (re.search(r"[A-Z]", value) and re.search(r"\d", value) and re.search(r"[!@#$%^&*(),.?\":{}|<>]", value)):
                raise ValueError("La contraseña debe contener al menos una letra mayúscula, un número y un carácter especial.")
        return value

    def hash_password(self):
        """ Hashea la contraseña antes de almacenarla """
        if self.password is not None:
            self.password = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, plain_password: str) -> bool:
        """ Verifica si la contraseña proporcionada coincide con el hash almacenado """
        if self.password is None:
            return False
        return bcrypt.checkpw(plain_password.encode('utf-8'), self.password.encode('utf-8'))
    
    @staticmethod
    def hash_password_static(password: str) -> str:
        """Hashea una contraseña sin requerir una instancia"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}