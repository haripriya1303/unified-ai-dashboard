import asyncio
import httpx
from app.services.auth import create_access_token
from app.config import get_settings

BASE_URL = "http://localhost:8000/api"
# Tokens will be generated dynamically
HEADERS = {}

endpoints = [
    ("GET", "/dashboard", None),
    ("GET", "/events", None),
    ("GET", "/activity", None),
    ("GET", "/integrations", None),
    ("GET", "/search?q=test", None),
    ("POST", "/assistant/query", {"query": "What tasks are due?"})
]

async def test_endpoints():
    settings = get_settings()
    jwt_payload = {
        "sub": "dev-user",
        "email": "dev@localhost",
        "name": "Dev User"
    }
    jwt_token = create_access_token(jwt_payload, settings.secret_key)
    HEADERS["Authorization"] = f"Bearer {jwt_token}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        for method, endpoint, payload in endpoints:
            url = f"{BASE_URL}{endpoint}"
            print(f"Testing {method} {url}...")
            if method == "GET":
                response = await client.get(url, headers=HEADERS)
            else:
                response = await client.post(url, headers=HEADERS, json=payload)
            
            print(f"Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response (text): {response.text}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(test_endpoints())
