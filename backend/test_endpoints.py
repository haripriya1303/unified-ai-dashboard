import asyncio
import httpx

BASE_URL = "http://localhost:8000/api"
HEADERS = {
    # We use Bearer token or rely on dev_auth_bypass if it's set to True in config
    "Authorization": "Bearer test-dev-token"
}

endpoints = [
    ("GET", "/dashboard", None),
    ("GET", "/events", None),
    ("GET", "/activity", None),
    ("GET", "/integrations", None),
    ("GET", "/search?q=test", None),
    ("POST", "/assistant/query", {"query": "What tasks are due?"})
]

async def test_endpoints():
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
