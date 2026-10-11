from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Database.connection import engine, Base
from models.user import User
from models.ngo import NGO
from models.employee import Employee
from models.request import AssistanceRequest
from models.assignment import Assignment
from models.notification import Notification
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.requests import router as requests_router
from routes.ngo import router as ngo_router
from models.admin import Admin
from routes.admin import router as admin_router
from models.request_ngo_attempt import RequestNGOAttempt
from routes.employee import router as employee_router
from routes.assignment import router as assignment_router

app = FastAPI(
    title="NGO Assistance Platform API",
    description="Backend API for connecting people who need assistance with NGOs",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requests_router)
app.include_router(ngo_router)
app.include_router(admin_router)
app.include_router(employee_router)
app.include_router(assignment_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://friendly-potato-x5pgj4www475fvjjr-5173.app.github.dev",
         "https://ngo-assistance-platform.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "NGO Assistance Platform API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
