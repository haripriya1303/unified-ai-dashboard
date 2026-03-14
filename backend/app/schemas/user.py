"""User request/response schemas."""
from pydantic import BaseModel


class UserMe(BaseModel):
    id: str
    email: str
    name: str | None = None

    class Config:
        from_attributes = True


class UserMeUpdate(BaseModel):
    name: str | None = None
