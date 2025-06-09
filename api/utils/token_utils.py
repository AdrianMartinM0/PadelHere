import jwt
from datetime import datetime, timedelta, timezone
from config import SECRET_KEY, ALGORITHM

def create_access_token(email: str, user_type: str):
    expires_delta = timedelta(days=15)
    expire = datetime.now(tz=timezone.utc) + expires_delta
    to_encode = {
        "sub": email,          
        "exp": expire,
        "type": user_type,
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt