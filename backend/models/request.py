from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from Database.connection import Base


class AssistanceRequest(Base):
    __tablename__ = "assistance_requests"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    request_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
        index=True
    )

    current_ngo_id: Mapped[int | None] = mapped_column(
        ForeignKey("ngos.id"),
        nullable=True,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )