from fastapi import APIRouter, Depends

from models.user import User
from security.dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "date_of_birth": current_user.date_of_birth,
        "location": current_user.location
    }