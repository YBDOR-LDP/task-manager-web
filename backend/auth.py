import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def verify_password(password: str) -> bool:
    app_password = os.environ.get("APP_PASSWORD", "")
    return password == app_password


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    data = {"sub": "user", "exp": expire}
    return jwt.encode(data, _secret(), algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials, _secret(), algorithms=[ALGORITHM]
        )
        if payload.get("sub") != "user":
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return "user"
