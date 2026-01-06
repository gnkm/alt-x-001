"""Seed data script for initial user creation."""
import sys
from typing import Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models.user import User


def create_seed_user(db: Session, seed_email: Optional[str] = None, seed_password: Optional[str] = None) -> None:
    """Create initial user from environment variables.

    Args:
        db: Database session
        seed_email: Email for seed user (optional, will use settings if not provided)
        seed_password: Password for seed user (optional, will use settings if not provided)

    Raises:
        ValueError: If seed_email or seed_password not provided
    """
    # Use provided values or fall back to settings
    if seed_email is None or seed_password is None:
        from app.config import settings
        seed_email = seed_email or settings.SEED_USER_EMAIL
        seed_password = seed_password or settings.SEED_USER_PASSWORD

    if not seed_email:
        raise ValueError("SEED_USER_EMAIL environment variable is not set")

    if not seed_password:
        raise ValueError("SEED_USER_PASSWORD environment variable is not set")

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == seed_email).first()
    if existing_user:
        print(f"User with email {seed_email} already exists. Skipping seed.")
        return

    # Create new user
    try:
        user = User(
            email=seed_email,
            password=seed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Successfully created seed user: {user.email}")
    except Exception as e:
        db.rollback()
        print(f"Error creating seed user: {e}")
        raise


def main() -> None:
    """Main entry point for seed data script."""
    print("Starting seed data script...")

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create session and seed data
    db = SessionLocal()
    try:
        create_seed_user(db)
    except Exception as e:
        print(f"Seed data script failed: {e}")
        sys.exit(1)
    finally:
        db.close()

    print("Seed data script completed successfully.")


if __name__ == "__main__":
    main()
