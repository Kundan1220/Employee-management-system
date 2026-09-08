from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=2, max_length=100)
    position: str = Field(..., min_length=2, max_length=100)
    salary: float = Field(..., gt=0)
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    position: Optional[str] = Field(None, min_length=2, max_length=100)
    salary: Optional[float] = Field(None, gt=0)
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeResponse(EmployeeBase):
    id: int