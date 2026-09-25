from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Database.connection import SessionLocal
from schemas.admin import AdminLogin
from security.password import verify_password
from security.jwt import create_access_token
from security.dependencies import get_current_admin
from models.admin import Admin
from models.ngo import NGO

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def admin_login(
    admin_data: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = (
        db.query(Admin)
        .filter(Admin.email == admin_data.email)
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        admin_data.password,
        admin.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(admin.id),
            "email": admin.email,
            "role": "admin"
        }
    )

    return {
        "message": "Admin login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }
@router.get("/me")
def get_admin_profile(
    current_admin: Admin = Depends(get_current_admin)
):
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "role": "admin"
    }
@router.get("/ngos/pending")
def get_pending_ngos(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngos = (
        db.query(NGO)
        .filter(
            NGO.is_verified == False,
            NGO.is_active == True
            )
        .all()
    )

    return [
        {
            "id": ngo.id,
            "name": ngo.name,
            "email": ngo.email,
            "phone": ngo.phone,
            "address": ngo.address,
            "latitude": ngo.latitude,
            "longitude": ngo.longitude,
            "is_verified": ngo.is_verified
        }
        for ngo in ngos
    ]

@router.get("/ngos")
def get_all_ngos(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngos = (
        db.query(NGO)
        .order_by(NGO.created_at.desc())
        .all()
    )

    return [
        {
            "id": ngo.id,
            "name": ngo.name,
            "email": ngo.email,
            "phone": ngo.phone,
            "address": ngo.address,
            "latitude": ngo.latitude,
            "longitude": ngo.longitude,
            "is_verified": ngo.is_verified,
            "is_active": ngo.is_active,
            "created_at": ngo.created_at
        }
        for ngo in ngos
    ]

@router.patch("/ngos/{ngo_id}/approve")
def approve_ngo(
    ngo_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if ngo is None:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    ngo.is_verified = True
    ngo.is_active = True

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO approved successfully",
        "ngo_id": ngo.id,
        "is_verified": ngo.is_verified,
        "is_active": ngo.is_active
    }
@router.patch("/ngos/{ngo_id}/reject")
def reject_ngo(
    ngo_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if ngo is None:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    ngo.is_verified = False
    ngo.is_active = False

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO rejected successfully",
        "ngo_id": ngo.id,
        "is_verified": ngo.is_verified,
        "is_active": ngo.is_active
    }
@router.patch("/ngos/{ngo_id}/deactivate")
def deactivate_ngo(
    ngo_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if ngo is None:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    ngo.is_active = False

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO deactivated successfully",
        "ngo_id": ngo.id,
        "is_verified": ngo.is_verified,
        "is_active": ngo.is_active
    }
#incase if accidently deactivated 
@router.patch("/ngos/{ngo_id}/activate")
def activate_ngo(
    ngo_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if ngo is None:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    if not ngo.is_verified:
        raise HTTPException(
            status_code=400,
            detail="NGO must be verified before activation"
        )

    ngo.is_active = True

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO activated successfully",
        "ngo_id": ngo.id,
        "is_verified": ngo.is_verified,
        "is_active": ngo.is_active
    }
