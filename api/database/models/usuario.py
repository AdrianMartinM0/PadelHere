from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
import re
import bcrypt

class User(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)  # Excluir "password" de las respuestas por seguridad
    tel: int = Field(...)
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