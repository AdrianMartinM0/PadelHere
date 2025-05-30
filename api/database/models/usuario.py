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
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    tel: Optional[int] = None
    img_perfil: Optional[bytes] = None
    desc: Optional[str] = None
    level: float = Field(default=0)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """ Valida que la contraseña tenga al menos una mayúscula, un número y un carácter especial """
        if not (re.search(r"[A-Z]", value) and re.search(r"\d", value) and re.search(r"[!@#$%^&*(),.?\":{}|<>]", value)):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula, un número y un carácter especial.")
        return value

    def hash_password(self):
        """ Hashea la contraseña antes de almacenarla """
        self.password = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, plain_password: str) -> bool:
        """ Verifica si la contraseña proporcionada coincide con el hash almacenado """
        return bcrypt.checkpw(plain_password.encode('utf-8'), self.password.encode('utf-8'))
    
    @staticmethod
    def hash_password_static(password: str) -> str:
        """Hashea una contraseña sin requerir una instancia"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}