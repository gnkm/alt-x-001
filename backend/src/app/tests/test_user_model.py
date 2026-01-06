"""Tests for User model."""
import pytest
from sqlalchemy.exc import IntegrityError

from app.models.user import User


def test_user_password_is_hashed_on_creation(db_session):
    """Test: User作成時にパスワードがハッシュ化されること."""
    plain_password = "TestPassword123"
    user = User(email="test@example.com", password=plain_password)

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Password should be hashed, not stored as plain text
    assert user.hashed_password != plain_password
    assert user.hashed_password.startswith("$2b$")  # bcrypt hash prefix
    assert len(user.hashed_password) == 60  # bcrypt hash length


def test_email_uniqueness_constraint(db_session):
    """Test: メールアドレスの一意性制約."""
    email = "unique@example.com"

    # Create first user
    user1 = User(email=email, password="Password123")
    db_session.add(user1)
    db_session.commit()

    # Try to create second user with same email
    user2 = User(email=email, password="AnotherPass456")
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_password_verification(db_session):
    """Test: パスワード検証（正しいパスワード/誤ったパスワード）."""
    plain_password = "ValidPass123"
    user = User(email="verify@example.com", password=plain_password)

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Correct password should verify
    assert user.verify_password(plain_password) is True

    # Wrong password should not verify
    assert user.verify_password("WrongPassword") is False
    assert user.verify_password("ValidPass124") is False
    assert user.verify_password("") is False


def test_required_fields_validation(db_session):
    """Test: 必須フィールドのバリデーション."""
    # Test missing email - should raise TypeError
    with pytest.raises(TypeError):
        user = User(password="Password123")

    # Test missing password - should raise TypeError
    with pytest.raises(TypeError):
        user = User(email="test@example.com")

    # Test empty email - should raise ValueError
    with pytest.raises(ValueError, match="Invalid email format"):
        user = User(email="", password="Password123")

    # Test invalid email format - should raise ValueError
    with pytest.raises(ValueError, match="Invalid email format"):
        user = User(email="not-an-email", password="Password123")

    # Test password too short - should raise ValueError
    with pytest.raises(ValueError, match="Password must be at least 8 characters"):
        user = User(email="test@example.com", password="Pass1")

    # Test password without numbers - should raise ValueError
    with pytest.raises(ValueError, match="Password must be at least 8 characters"):
        user = User(email="test@example.com", password="PasswordOnly")

    # Test password without letters - should raise ValueError
    with pytest.raises(ValueError, match="Password must be at least 8 characters"):
        user = User(email="test@example.com", password="12345678")
