"""Search result schema — match frontend SearchResult."""
from pydantic import BaseModel


class SearchResultOut(BaseModel):
    id: str
    title: str
    description: str
    source: str
    sourceIcon: str  # frontend camelCase
    url: str
    type: str  # task | message | document | integration
