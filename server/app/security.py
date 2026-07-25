from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session
from .config import get_settings
from .database import get_db
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
password_hash = PasswordHash.recommended()
settings = get_settings()

def hash_password(password: str) -> str: return password_hash.hash(password)
def verify_password(password: str, hashed: str) -> bool: return password_hash.verify(password, hashed)
def create_token(user: User, kind: str, lifetime: timedelta) -> str:
    return jwt.encode({"sub": str(user.id), "role": user.role, "kind": kind, "exp": datetime.now(timezone.utc) + lifetime}, settings.jwt_secret, algorithm=settings.jwt_algorithm)
def issue_tokens(user: User) -> dict:
    return {"access_token": create_token(user, "access", timedelta(minutes=settings.access_token_minutes)), "refresh_token": create_token(user, "refresh", timedelta(days=settings.refresh_token_days))}
def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("kind") != "access": raise ValueError()
        user = db.get(User, int(payload["sub"]))
    except Exception: user = None
    if not user: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    return user
