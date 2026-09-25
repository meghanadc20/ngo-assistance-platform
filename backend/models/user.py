from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from Database.connection import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    date_of_birth: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    
    latitude: Mapped[float | None] = mapped_column(
    Float,
    nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
    Float,
    nullable=True
    )
 
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )