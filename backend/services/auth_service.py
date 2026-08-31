import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import SessionLocal
from fastapi import HTTPException, Depends
from ..models.user import User
from dotenv import load_dotenv
import os

load_dotenv()
_bearer_scheme = HTTPBearer()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = 'HS256'

def hash_password(password: str) -> str:
    """Mengacak password menggunakan bcrypt"""
    return bcrypt.hashpw(
        bytes(password, encoding="utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

def register(db, name, email, password):
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def verify_password(plain_password: str, hashed_password: str)-> bool:
    """Fungsi untuk mengecek apakah password yang diketik sama dengan
    password hash pada database"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def login(db, email, password):
    # Cari user di database berdasarkan email
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    # Generate JWT
    # Token expired 30 minute
    expire_time = datetime.utcnow() + timedelta(minutes=30)

    # Masukkan ID User dan waktu kadaluarsa ke dalam isi token
    token_data = {'sub': str(user.id), 'exp': expire_time}

    # Enkripsi menjadi token menggunakan SECRET_KEY
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return token

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> User:
    """
    FastAPI dependency — decode the Bearer JWT and return the matching User.
    Raises HTTP 401 if the token is missing, invalid, or expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user