from pydantic import BaseModel, EmailStr, Field


class NGOApplication(BaseModel):
    name: str = Field(min_length=2, max_length=150)

    email: EmailStr

    phone: str = Field(min_length=10, max_length=20)

    password: str = Field(
        min_length=8,
        max_length=72
    )

    address: str = Field(min_length=3, max_length=255)

    latitude: float

    longitude: float
class NGOLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )