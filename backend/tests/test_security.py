"""Tests for core/security.py — RED phase first, then GREEN after implementation."""

from datetime import timedelta

import pytest
from jose import JWTError

from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token({"sub": "1"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_contains_sub_claim(self):
        token = create_access_token({"sub": "42"})
        payload = decode_token(token)
        assert payload["sub"] == "42"

    def test_contains_exp_claim(self):
        token = create_access_token({"sub": "1"})
        payload = decode_token(token)
        assert "exp" in payload

    def test_custom_expires_delta(self):
        token = create_access_token({"sub": "1"}, expires_delta=timedelta(minutes=5))
        payload = decode_token(token)
        assert "exp" in payload

    def test_no_type_claim(self):
        token = create_access_token({"sub": "1"})
        payload = decode_token(token)
        assert payload.get("type") is None


class TestCreateRefreshToken:
    def test_returns_string(self):
        token = create_refresh_token({"sub": "1"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_contains_sub_claim(self):
        token = create_refresh_token({"sub": "99"})
        payload = decode_token(token)
        assert payload["sub"] == "99"

    def test_contains_type_refresh_claim(self):
        token = create_refresh_token({"sub": "1"})
        payload = decode_token(token)
        assert payload.get("type") == "refresh"

    def test_contains_exp_claim(self):
        token = create_refresh_token({"sub": "1"})
        payload = decode_token(token)
        assert "exp" in payload

    def test_custom_expires_delta(self):
        token = create_refresh_token({"sub": "1"}, expires_delta=timedelta(days=3))
        payload = decode_token(token)
        assert payload["type"] == "refresh"


class TestDecodeToken:
    def test_decodes_valid_access_token(self):
        token = create_access_token({"sub": "7"})
        payload = decode_token(token)
        assert payload["sub"] == "7"

    def test_decodes_valid_refresh_token(self):
        token = create_refresh_token({"sub": "7"})
        payload = decode_token(token)
        assert payload["sub"] == "7"
        assert payload["type"] == "refresh"

    def test_raises_jwterror_on_invalid_token(self):
        with pytest.raises(JWTError):
            decode_token("not.a.valid.token")

    def test_raises_jwterror_on_expired_token(self):
        token = create_access_token({"sub": "1"}, expires_delta=timedelta(seconds=-1))
        with pytest.raises(JWTError):
            decode_token(token)

    def test_raises_jwterror_on_bad_signature(self):
        token = create_access_token({"sub": "1"})
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(JWTError):
            decode_token(tampered)


class TestPasswordHashing:
    def test_verify_correct_password(self):
        hashed = get_password_hash("Pass1")
        assert verify_password("Pass1", hashed) is True

    def test_reject_wrong_password(self):
        hashed = get_password_hash("Pass1")
        assert verify_password("Wrong1", hashed) is False
