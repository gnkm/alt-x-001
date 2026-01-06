"""User model."""
import re
import uuid
from datetime import datetime

import bcrypt
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(60), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __init__(self, email: str, password: str, **kwargs):
        """Initialize user with email and password.

        Args:
            email: User's email address
            password: Plain text password (will be hashed)
            **kwargs: Additional keyword arguments

        Raises:
            ValueError: If email format is invalid or password requirements not met
        """
        # Validate email format
        if not email or not self._is_valid_email(email):
            raise ValueError("Invalid email format")

        # Validate password requirements
        if not self._is_valid_password(password):
            raise ValueError(
                "Password must be at least 8 characters long and contain both letters and numbers"
            )

        super().__init__(**kwargs)
        self.email = email
        self.hashed_password = self._hash_password(password)

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format.

        Args:
            email: Email address to validate

        Returns:
            True if email format is valid, False otherwise
        """
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    @staticmethod
    def _is_valid_password(password: str) -> bool:
        """Validate password requirements.

        Password must be:
        - At least 8 characters long
        - Contain both letters and numbers

        Args:
            password: Password to validate

        Returns:
            True if password meets requirements, False otherwise
        """
        if len(password) < 8:
            return False

        has_letter = bool(re.search(r'[a-zA-Z]', password))
        has_number = bool(re.search(r'[0-9]', password))

        return has_letter and has_number

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Hashed password as a string
        """
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    def verify_password(self, password: str) -> bool:
        """Verify password against hashed password.

        Args:
            password: Plain text password to verify

        Returns:
            True if password matches, False otherwise
        """
        password_bytes = password.encode('utf-8')
        hashed_bytes = self.hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
