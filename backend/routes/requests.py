from sqlalchemy import func, cast
from sqlalchemy.orm import Session
from geoalchemy2 import Geography
from fastapi import APIRouter, Depends, HTTPException
from models.request_ngo_attempt import RequestNGOAttempt

from Database.connection import SessionLocal
from models.request import AssistanceRequest
from models.user import User
from schemas.request import AssistanceRequestCreate
from security.dependencies import get_current_user
from models.ngo import NGO
from models.employee import Employee
from models.assignment import Assignment 

router = APIRouter(
    prefix="/requests",
    tags=["Assistance Requests"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_assistance_request(
    request_data: AssistanceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Search radii in kilometers
    search_radii = [2, 5, 10, 20]

    nearest_ngo = None
    nearest_distance = None

    # Create the user's location as a PostGIS geography point
    user_location = cast(
        func.ST_SetSRID(
            func.ST_MakePoint(
                request_data.longitude,
                request_data.latitude
            ),
            4326
        ),
        Geography(geometry_type="POINT", srid=4326)
    )

    # Try progressively larger search radii
    for radius_km in search_radii:

        radius_meters = radius_km * 1000

        # Find verified and active NGOs within this radius
        ngos = (
            db.query(
                NGO,
                func.ST_Distance(
                    NGO.location,
                    user_location
                ).label("distance_meters")
            )
            .filter(
                NGO.is_verified == True,
                NGO.is_active == True,
                NGO.location.isnot(None),
                func.ST_DWithin(
                    NGO.location,
                    user_location,
                    radius_meters
                )
            )
            .order_by(
                func.ST_Distance(
                    NGO.location,
                    user_location
                )
            )
            .all()
        )

        # If NGOs were found, take the nearest one
        if ngos:
            nearest_ngo, distance_meters = ngos[0]
            nearest_distance = distance_meters / 1000
            break

    # No NGO found even within the maximum radius
    if nearest_ngo is None:
        raise HTTPException(
            status_code=503,
            detail="No verified NGOs are available within 20 km"
        )

    # Create the assistance request
    new_request = AssistanceRequest(
        user_id=current_user.id,
        request_type=request_data.request_type,
        description=request_data.description,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        current_ngo_id=nearest_ngo.id
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Record the first NGO attempt
    ngo_attempt = RequestNGOAttempt(
        request_id=new_request.id,
        ngo_id=nearest_ngo.id,
        status="PENDING"
    )

    db.add(ngo_attempt)
    db.commit()

    return {
        "message": "Assistance request created successfully",
        "request_id": new_request.id,
        "status": new_request.status,
        "assigned_ngo_id": nearest_ngo.id,
        "assigned_ngo_name": nearest_ngo.name,
        "distance_km": round(nearest_distance, 2)
    }

@router.get("/my")
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requests = (
        db.query(AssistanceRequest)
        .filter(AssistanceRequest.user_id == current_user.id)
        .order_by(AssistanceRequest.created_at.desc())
        .all()
    )

    result = []

    for request in requests:

        # Get current NGO
        ngo = None

        if request.current_ngo_id:
            ngo = db.query(NGO).filter(
                NGO.id == request.current_ngo_id
            ).first()

        # Get active assignment
        assignment = db.query(Assignment).filter(
            Assignment.request_id == request.id,
            Assignment.status == "ACTIVE"
        ).first()

        employee = None

        if assignment:
            employee = db.query(Employee).filter(
                Employee.id == assignment.employee_id
            ).first()

        result.append({
            "request_id": request.id,
            "request_type": request.request_type,
            "description": request.description,
            "status": request.status,
            "created_at": request.created_at,

            "ngo": {
                "id": ngo.id,
                "name": ngo.name,
                "phone": ngo.phone,
                "address": ngo.address
            } if ngo else None,

            "assigned_employee": {
                "id": employee.id,
                "name": employee.name,
                "phone": employee.phone,
                "email": employee.email
            } if employee else None
        })

    return result

@router.get("/{request_id}")
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = (
        db.query(AssistanceRequest)
        .filter(
            AssistanceRequest.id == request_id,
            AssistanceRequest.user_id == current_user.id
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    # Get current NGO
    ngo = None

    if request.current_ngo_id:
        ngo = db.query(NGO).filter(
            NGO.id == request.current_ngo_id
        ).first()

    # Get active assignment
    assignment = db.query(Assignment).filter(
        Assignment.request_id == request.id,
        Assignment.status == "ACTIVE"
    ).first()

    employee = None

    if assignment:
        employee = db.query(Employee).filter(
            Employee.id == assignment.employee_id
        ).first()

    return {
        "request_id": request.id,
        "request_type": request.request_type,
        "description": request.description,
        "status": request.status,
        "created_at": request.created_at,

        "ngo": {
            "id": ngo.id,
            "name": ngo.name,
            "phone": ngo.phone,
            "address": ngo.address
        } if ngo else None,

        "assigned_employee": {
            "id": employee.id,
            "name": employee.name,
            "phone": employee.phone,
            "email": employee.email
        } if employee else None
    }