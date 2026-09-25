from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from Database.connection import SessionLocal
from models.user import User
from security.jwt import SECRET_KEY, ALGORITHM
from models.admin import Admin
from models.ngo import NGO

security = HTTPBearer()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        admin_id = payload.get("sub")
        role = payload.get("role")

        if admin_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        if role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    admin = (
        db.query(Admin)
        .filter(Admin.id == int(admin_id))
        .first()
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found"
        )

    return admin
def get_current_ngo(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        ngo_id = payload.get("sub")
        role = payload.get("role")

        if ngo_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        if role != "ngo":
            raise HTTPException(
                status_code=403,
                detail="NGO access required"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    ngo = db.query(NGO).filter(NGO.id == int(ngo_id)).first()

    if ngo is None:
        raise HTTPException(
            status_code=401,
            detail="NGO not found"
        )

    if not ngo.is_verified:
        raise HTTPException(
            status_code=403,
            detail="NGO account is not verified"
        )

    if not ngo.is_active:
        raise HTTPException(
            status_code=403,
            detail="NGO account is inactive"
        )

    return ngo
