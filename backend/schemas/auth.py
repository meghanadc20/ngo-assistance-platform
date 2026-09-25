from datetime import date
from pydantic import BaseModel, EmailStr, Field
class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)

    email: EmailStr

    phone: str = Field(
        min_length=10,
        max_length=20
    )

    date_of_birth: date

    location: str = Field(
        min_length=2,
        max_length=255
    )

    latitude: float

    longitude: float

    password: str = Field(
        min_length=8,
        max_length=72
    )
class UserLogin(BaseModel):
    email : EmailStr
    password: str = Field(
        min_length=8,
        max_length=72
    )