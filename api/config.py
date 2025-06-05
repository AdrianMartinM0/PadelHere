from dotenv import load_dotenv
import os

load_dotenv()  # Carga variables desde .env

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
