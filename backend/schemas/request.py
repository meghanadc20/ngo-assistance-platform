from pydantic import BaseModel, Field


class AssistanceRequestCreate(BaseModel):
    request_type: str = Field(
        min_length=2,
        max_length=50
    )

    description: str | None = Field(
        default=None,
        max_length=1000
    )

    latitude: float

    longitude: float