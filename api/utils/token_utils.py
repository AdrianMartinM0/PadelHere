import jwt
from datetime import datetime, timedelta, timezone
from api.config import SECRET_KEY, ALGORITHM

def create_access_token(data: dict, user_type: str):
    expires_delta = timedelta(days=15)
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "type": user_type})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt