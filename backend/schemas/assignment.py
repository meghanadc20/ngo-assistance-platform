from pydantic import BaseModel


class AssignmentCreate(BaseModel):
    employee_id: int