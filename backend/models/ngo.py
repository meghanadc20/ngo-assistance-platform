from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from Database.connection import Base
from sqlalchemy import Boolean, DateTime, Float, Integer, String
from geoalchemy2 import Geography


class NGO(Base):
    __tablename__ = "ngos"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
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

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    location = mapped_column(
    Geography(geometry_type="POINT", srid=4326, spatial_index=False),
    nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
     String(255),
     nullable=False
    )

    is_verified: Mapped[bool] = mapped_column(
     Boolean,
     default=False,
     nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
     Boolean,
     default=True,
     nullable=False
    )