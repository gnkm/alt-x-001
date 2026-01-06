"""Tests for seed data script."""
import pytest

from app.models.user import User
from app.utils.seed_data import create_seed_user


def test_create_seed_user_success(db_session):
    """Test seed user creation with valid credentials."""
    # Create seed user
    create_seed_user(db_session, "seed@example.com", "SeedPass123")

    # Verify user was created
    user = db_session.query(User).filter(User.email == "seed@example.com").first()
    assert user is not None
    assert user.email == "seed@example.com"
    assert user.verify_password("SeedPass123") is True


def test_create_seed_user_already_exists(db_session, capfd):
    """Test seed user creation when user already exists."""
    # Create user first
    existing_user = User(email="existing@example.com", password="ExistingPass123")
    db_session.add(existing_user)
    db_session.commit()

    # Try to create seed user with same email
    create_seed_user(db_session, "existing@example.com", "NewPassword123")

    # Verify user was not duplicated
    users = db_session.query(User).filter(User.email == "existing@example.com").all()
    assert len(users) == 1

    # Verify output message
    captured = capfd.readouterr()
    assert "already exists" in captured.out


def test_create_seed_user_missing_email(db_session):
    """Test seed user creation fails without email."""
    with pytest.raises(ValueError, match="SEED_USER_EMAIL environment variable is not set"):
        create_seed_user(db_session, None, "SeedPass123")


def test_create_seed_user_missing_password(db_session):
    """Test seed user creation fails without password."""
    with pytest.raises(ValueError, match="SEED_USER_PASSWORD environment variable is not set"):
        create_seed_user(db_session, "seed@example.com", None)
