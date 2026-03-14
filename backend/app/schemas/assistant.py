"""Assistant request/response schemas."""
from pydantic import BaseModel


class AssistantQueryIn(BaseModel):
    query: str


class AssistantSource(BaseModel):
    title: str
    url: str


class AssistantQueryOut(BaseModel):
    answer: str
    sources: list[AssistantSource]
