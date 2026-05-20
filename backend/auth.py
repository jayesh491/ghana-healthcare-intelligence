from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from database import get_db

SECRET_KEY = "ghana-healthcare-secret-2024"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int, email: str, name: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def register_user(name: str, email: str, password: str):
    conn = get_db()
    cursor = conn.cursor()
    try:
        hashed = hash_password(password)
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"success": True, "user_id": user_id}
    except Exception as e:
        return {"success": False, "error": "Email already exists"}
    finally:
        conn.close()

def login_user(email: str, password: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(password, user["password"]):
        return {"success": False, "error": "Invalid email or password"}

    token = create_token(user["id"], user["email"], user["name"])
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }