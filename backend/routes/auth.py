from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from Database.connection import SessionLocal
from models.user import User
from schemas.auth import UserRegister, UserLogin
from security.password import hash_password, verify_password
from security.jwt import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    existing_phone = (
        db.query(User)
        .filter(User.phone == user_data.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number is already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        location=user_data.location, 
        latitude=user_data.latitude,
        longitude=user_data.longitude,
        password_hash=hash_password(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }

@router.post("/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": "user"
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }