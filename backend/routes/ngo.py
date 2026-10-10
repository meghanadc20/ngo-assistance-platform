from fastapi import APIRouter, Depends,  HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast
from geoalchemy2 import Geography
from models.employee import Employee
from models.request import AssistanceRequest
from models.user import User
from models.assignment import Assignment

from Database.connection import SessionLocal
from models.ngo import NGO
from schemas.ngo import NGOApplication, NGOLogin
from security.jwt import create_access_token
from security.password import hash_password, verify_password
from security.dependencies import get_current_ngo
from models.request_ngo_attempt import RequestNGOAttempt


router = APIRouter(
    prefix="/ngo",
    tags=["NGO"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.get("/requests")
def get_ngo_requests(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    requests = (
        db.query(AssistanceRequest)
        .filter(
            AssistanceRequest.current_ngo_id == current_ngo.id
        )
        .order_by(AssistanceRequest.created_at.desc())
        .all()
    )

    result = []

    for request in requests:

        # Get user who created the request
        user = db.query(User).filter(
            User.id == request.user_id
        ).first()

        # Get active assignment, if one exists
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

            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "date_of_birth": user.date_of_birth,
                "location": user.location
            } if user else None,

            "request": {
                "type": request.request_type,
                "description": request.description,
                "latitude": request.latitude,
                "longitude": request.longitude,
                "status": request.status,
                "created_at": request.created_at
            },
            
            "assignment_id": assignment.id if assignment else None,

           "assigned_employee": {
           "id": employee.id,
           "name": employee.name,
           "phone": employee.phone,
           "email": employee.email
          } if employee else None
          })

    return result
@router.patch("/requests/{request_id}/accept")
def accept_request(
    request_id: int,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    request = db.query(AssistanceRequest).filter(
        AssistanceRequest.id == request_id,
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "PENDING"
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found or not assigned to this NGO"
        )

    request.status = "ACCEPTED"

    db.commit()
    db.refresh(request)

    return {
        "message": "Assistance request accepted",
        "request_id": request.id,
        "status": request.status,
        "ngo_id": current_ngo.id
    }

@router.patch("/requests/{request_id}/decline")
def decline_request(
    request_id: int,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    request = db.query(AssistanceRequest).filter(
        AssistanceRequest.id == request_id,
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "PENDING"
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found or not assigned to this NGO"
        )

    # Mark the current NGO attempt as declined
    current_attempt = db.query(RequestNGOAttempt).filter(
        RequestNGOAttempt.request_id == request.id,
        RequestNGOAttempt.ngo_id == current_ngo.id,
        RequestNGOAttempt.status == "PENDING"
    ).first()

    if current_attempt:
        current_attempt.status = "DECLINED"

    # Get NGOs that have already been attempted
    attempted_ngo_ids = db.query(
        RequestNGOAttempt.ngo_id
    ).filter(
        RequestNGOAttempt.request_id == request.id
    ).all()

    attempted_ngo_ids = [
        ngo_id[0] for ngo_id in attempted_ngo_ids
    ]

    # Search radii in kilometers
    search_radii = [2, 5, 10, 20]

    nearest_ngo = None
    nearest_distance = None

    # Create user's request location as a PostGIS geography point
    user_location = cast(
        func.ST_SetSRID(
            func.ST_MakePoint(
                request.longitude,
                request.latitude
            ),
            4326
        ),
        Geography(
            geometry_type="POINT",
            srid=4326
        )
    )

    # Search progressively larger radii
    for radius_km in search_radii:

        radius_meters = radius_km * 1000

        remaining_ngos = (
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
                ~NGO.id.in_(attempted_ngo_ids),
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

        if remaining_ngos:
            nearest_ngo, distance_meters = remaining_ngos[0]
            nearest_distance = distance_meters / 1000
            break

    # No other NGO found within 20 km
    if nearest_ngo is None:

        request.current_ngo_id = None
        request.status = "DECLINED"

        db.commit()

        return {
            "message": "No other verified NGOs are available within 20 km",
            "request_id": request.id,
            "status": request.status
        }

    # Forward request to the next nearest NGO
    request.current_ngo_id = nearest_ngo.id
    request.status = "PENDING"

    # Record the new NGO attempt
    new_attempt = RequestNGOAttempt(
        request_id=request.id,
        ngo_id=nearest_ngo.id,
        status="PENDING"
    )

    db.add(new_attempt)

    db.commit()
    db.refresh(request)

    return {
        "message": "Request forwarded to the next nearest NGO",
        "request_id": request.id,
        "status": request.status,
        "assigned_ngo_id": nearest_ngo.id,
        "assigned_ngo_name": nearest_ngo.name,
        "distance_km": round(nearest_distance, 2)
    }
    
@router.post("/apply")
def apply_as_ngo(
    ngo_data: NGOApplication,
    db: Session = Depends(get_db)
):
    existing_ngo = (
        db.query(NGO)
        .filter(NGO.email == ngo_data.email)
        .first()
    )
    if existing_ngo:
        raise HTTPException(
            status_code=400,
            detail="NGO with this email already exists"
        )

    ngo = NGO(
         name=ngo_data.name,
    email=ngo_data.email,
    phone=ngo_data.phone,
    password_hash=hash_password(ngo_data.password),
    address=ngo_data.address,
    latitude=ngo_data.latitude,
    longitude=ngo_data.longitude,

    location=cast(
        func.ST_SetSRID(
            func.ST_MakePoint(
                ngo_data.longitude,
                ngo_data.latitude
            ),
            4326
        ),
        Geography(geometry_type="POINT", srid=4326)
    ),

    is_verified=False,
    is_active=True
    )

    db.add(ngo)
    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO application submitted successfully",
        "ngo_id": ngo.id,
        "status": "PENDING"
    }
@router.post("/login")
def ngo_login(
    ngo_data: NGOLogin,
    db: Session = Depends(get_db)
):
    ngo = (
        db.query(NGO)
        .filter(NGO.email == ngo_data.email)
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        ngo_data.password,
        ngo.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not ngo.is_verified:
        raise HTTPException(
            status_code=403,
            detail="NGO account is not verified yet"
        )

    if not ngo.is_active:
        raise HTTPException(
            status_code=403,
            detail="NGO account is inactive"
        )

    access_token = create_access_token(
        {
            "sub": str(ngo.id),
            "email": ngo.email,
            "role": "ngo"
        }
    )

    return {
        "message": "NGO login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }
@router.get("/me")
def get_ngo_profile(
    current_ngo: NGO = Depends(get_current_ngo)
):
    return {
        "id": current_ngo.id,
        "name": current_ngo.name,
        "email": current_ngo.email,
        "phone": current_ngo.phone,
        "address": current_ngo.address,
        "is_verified": current_ngo.is_verified,
        "is_active": current_ngo.is_active
    }
@router.get("/dashboard")
def get_ngo_dashboard(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db)
):
    # Count requests currently assigned to this NGO
    pending_count = db.query(AssistanceRequest).filter(
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "PENDING"
    ).count()

    accepted_count = db.query(AssistanceRequest).filter(
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "ACCEPTED"
    ).count()

    assigned_count = db.query(AssistanceRequest).filter(
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "ASSIGNED"
    ).count()

    completed_count = db.query(AssistanceRequest).filter(
        AssistanceRequest.current_ngo_id == current_ngo.id,
        AssistanceRequest.status == "COMPLETED"
    ).count()

    # Get employees belonging only to this NGO
    employees = db.query(Employee).filter(
        Employee.ngo_id == current_ngo.id
    ).all()

    employee_data = []

    for employee in employees:
        employee_data.append({
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "phone": employee.phone,
            "is_available": employee.is_available
        })

    return {
        "ngo": {
            "id": current_ngo.id,
            "name": current_ngo.name,
            "email": current_ngo.email
        },
        "request_counts": {
            "pending": pending_count,
            "accepted": accepted_count,
            "assigned": assigned_count,
            "completed": completed_count
        },
        "employees": employee_data
    }
