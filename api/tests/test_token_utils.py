import pytest
import jwt
import os
from unittest.mock import patch
import utils.token_utils as token_utils

def test_create_access_token():
    with patch("utils.token_utils.SECRET_KEY", "supersecret"), \
         patch("utils.token_utils.ALGORITHM", "HS256"):
        
        email = "test@example.com"
        user_type = "player"
        token = token_utils.create_access_token(email, user_type)
        
        assert isinstance(token, str)
        
        decoded = jwt.decode(token, "supersecret", algorithms=["HS256"])
        assert decoded["sub"] == email
        assert decoded["type"] == user_type
        assert "exp" in decoded
