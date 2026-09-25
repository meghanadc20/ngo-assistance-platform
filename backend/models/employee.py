from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from Database.connection import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    ngo_id: Mapped[int] = mapped_column(
        ForeignKey("ngos.id"),
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )