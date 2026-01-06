"""JWT utility functions."""
from datetime import datetime, timedelta
from typing import Dict, Optional

from jose import JWTError, jwt

from app.config import settings


def create_access_token(data: Dict[str, str]) -> str:
    """Create JWT access token with 30 minute expiration.

    Args:
        data: Data to encode in the token (e.g., {"sub": user_id})

    Returns:
        Encoded JWT access token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, str]) -> str:
    """Create JWT refresh token with 7 day expiration.

    Args:
        data: Data to encode in the token (e.g., {"sub": user_id})

    Returns:
        Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str, expected_type: Optional[str] = None) -> Dict[str, str]:
    """Decode and validate JWT token.

    Args:
        token: JWT token to decode
        expected_type: Expected token type ("access" or "refresh"), optional

    Returns:
        Decoded token payload

    Raises:
        JWTError: If token is invalid, expired, or type mismatch
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Verify token type if specified
        if expected_type is not None:
            token_type = payload.get("type")
            if token_type != expected_type:
                raise JWTError(f"Invalid token type. Expected {expected_type}, got {token_type}")

        return payload

    except JWTError as e:
        raise JWTError(f"Token validation failed: {str(e)}")
