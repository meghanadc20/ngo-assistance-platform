from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Database.connection import SessionLocal
from models.employee import Employee
from schemas.employee import EmployeeCreate
from security.dependencies import get_current_ngo
from models.ngo import NGO


router = APIRouter(
    prefix="/ngo/employees",
    tags=["NGO Employees"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_employee(
    employee_data: EmployeeCreate,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    existing_employee = db.query(Employee).filter(
        Employee.email == employee_data.email
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee with this email already exists"
        )

    new_employee = Employee(
        ngo_id=current_ngo.id,
        name=employee_data.name,
        email=employee_data.email,
        phone=employee_data.phone,
        is_available=True
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "message": "Employee created successfully",
        "employee_id": new_employee.id,
        "ngo_id": current_ngo.id,
        "name": new_employee.name,
        "email": new_employee.email,
        "phone": new_employee.phone,
        "is_available": new_employee.is_available
    }
@router.get("/")
def get_my_employees(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    employees = db.query(Employee).filter(
        Employee.ngo_id == current_ngo.id
    ).all()

    return employees