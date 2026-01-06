"""Authentication router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import get_current_user
from app.utils.jwt import create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate user and return JWT tokens.

    Args:
        login_data: Login credentials (email and password)
        db: Database session

    Returns:
        TokenResponse with access_token, refresh_token, and token_type

    Raises:
        HTTPException: 401 Unauthorized if credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()

    # Verify user exists and password is correct
    if not user or not user.verify_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> AccessTokenResponse:
    """Issue new access token using refresh token.

    Args:
        refresh_data: Refresh token data
        db: Database session

    Returns:
        AccessTokenResponse with new access_token and token_type

    Raises:
        HTTPException: 401 Unauthorized if refresh token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode and validate the refresh token
        payload = decode_token(refresh_data.refresh_token, expected_type="refresh")

        # Extract user ID from token
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        # Convert string to UUID
        user_id = UUID(user_id_str)

    except (JWTError, ValueError):
        raise credentials_exception

    # Verify user still exists
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    # Create new access token
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)

    return AccessTokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """Logout endpoint - instructs client to delete tokens.

    This endpoint returns 204 No Content as the actual logout is handled
    client-side by deleting the stored tokens.

    Returns:
        204 No Content
    """
    return None


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserResponse:
    """Get current authenticated user information.

    Args:
        current_user: Current authenticated user from dependency

    Returns:
        UserResponse with user id and email
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email
    )
