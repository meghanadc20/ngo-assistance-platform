from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from Database.connection import Base


class RequestNGOAttempt(Base):
    __tablename__ = "request_ngo_attempts"

    id: Mapped[int] = mapped_column( # here id means Unique attempt ID for this table
        Integer,
        primary_key=True,
        index=True
    )

    request_id: Mapped[int] = mapped_column(
        ForeignKey("assistance_requests.id"),
        nullable=False,
        index=True
    )

    ngo_id: Mapped[int] = mapped_column(
        ForeignKey("ngos.id"),
        nullable=False,
        index=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    attempted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )