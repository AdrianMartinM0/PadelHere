from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os
import re

# Cargar las variables de entorno
load_dotenv()

# Obtener la clave de cifrado
key = os.getenv('KEY')
cipher_suite = Fernet(key)

class User(BaseModel):
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

    def encrypt_sensitive_data(self):
        self.password = cipher_suite.encrypt(self.password.encode()).decode()

    def decrypt_sensitive_data(self):
        self.password = cipher_suite.decrypt(self.password.encode()).decode()