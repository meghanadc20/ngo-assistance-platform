from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Database.connection import SessionLocal
from models.ngo import NGO
from models.request import AssistanceRequest
from models.employee import Employee
from models.assignment import Assignment
from schemas.assignment import AssignmentCreate
from security.dependencies import get_current_ngo


router = APIRouter(
    prefix="/ngo/assignments",
    tags=["NGO Assignments"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def assign_employee(
    assignment_data: AssignmentCreate,
    request_id: int,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    # Find the request assigned to this NGO
    request = db.query(AssistanceRequest).filter(
        AssistanceRequest.id == request_id,
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "ACCEPTED"
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Accepted request not found or not assigned to this NGO"
        )

    # Find the employee and make sure they belong to this NGO
    employee = db.query(Employee).filter(
        Employee.id == assignment_data.employee_id,
        Employee.ngo_id == current_ngo.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found or does not belong to this NGO"
        )

    # Check employee availability
    if not employee.is_available:
        raise HTTPException(
            status_code=400,
            detail="Employee is not available"
        )

    # Check if request already has an assignment
    existing_assignment = db.query(Assignment).filter(
        Assignment.request_id == request.id,
        Assignment.status == "ACTIVE"
    ).first()

    if existing_assignment:
        raise HTTPException(
            status_code=400,
            detail="Request already has an active assignment"
        )

    # Create assignment
    new_assignment = Assignment(
        request_id=request.id,
        employee_id=employee.id,
        status="ACTIVE"
    )

    # Update employee availability
    employee.is_available = False

    # Update request status
    request.status = "ASSIGNED"

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
        "message": "Employee assigned successfully",
        "assignment_id": new_assignment.id,
        "request_id": request.id,
        "employee_id": employee.id,
        "employee_name": employee.name,
        "status": new_assignment.status
    }

@router.patch("/{assignment_id}/complete")
def complete_assignment(
    assignment_id: int,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    # Find the assignment
    assignment = (
        db.query(Assignment)
        .join(
            AssistanceRequest,
            Assignment.request_id == AssistanceRequest.id
        )
        .filter(
            Assignment.id == assignment_id,
            AssistanceRequest.current_ngo_id == current_ngo.id,
            Assignment.status == "ACTIVE"
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Active assignment not found"
        )

    # Find the employee
    employee = db.query(Employee).filter(
        Employee.id == assignment.employee_id,
        Employee.ngo_id == current_ngo.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Find the assistance request
    request = db.query(AssistanceRequest).filter(
        AssistanceRequest.id == assignment.request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Assistance request not found"
        )

    # Mark assignment as completed
    assignment.status = "COMPLETED"

    # Record completion time
    assignment.completed_at = datetime.utcnow()

    # Make employee available again
    employee.is_available = True

    # Mark assistance request as completed
    request.status = "COMPLETED"

    db.commit()

    return {
        "message": "Assistance request completed successfully",
        "assignment_id": assignment.id,
        "request_id": request.id,
        "employee_id": employee.id,
        "employee_name": employee.name,
        "status": request.status,
        "employee_available": employee.is_available
    }