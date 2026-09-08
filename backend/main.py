from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://employee-frontend-delta-five.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/employees/", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    existing_employee = (
        db.query(models.Employee)
        .filter(models.Employee.email == employee.email.lower())
        .first()
    )

    if existing_employee:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_employee = models.Employee(
        name=employee.name,
        email=employee.email.lower(),
        department=employee.department,
        position=employee.position,
        salary=employee.salary,
        phone=employee.phone,
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee