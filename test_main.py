import pytest
from httpx import AsyncClient
from main import app  # Import the FastAPI app from main.py

# Use pytest-asyncio to run async tests
@pytest.mark.asyncio
async def test_chat_help():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/chat", json={"message": "help"})
        assert response.status_code == 200
        assert "I can assist you with Ethereum blockchain and DeFi data." in response.json()["reply"]

@pytest.mark.asyncio
async def test_get_eth_supply():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/chat", json={"message": "get eth supply"})
        assert response.status_code == 200
        assert "The total supply of Ethereum is" in response.json()["reply"]

@pytest.mark.asyncio
async def test_get_eth_price_usd():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/chat", json={"message": "get eth price usd"})
        assert response.status_code == 200
        assert "The current price of Ethereum is" in response.json()["reply"]

@pytest.mark.asyncio
async def test_get_eth_price_btc():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/chat", json={"message": "get eth price btc"})
        assert response.status_code == 200
        assert "The current price of Ethereum is" in response.json()["reply"]

@pytest.mark.asyncio
async def test_get_defi_pools():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/chat", json={"message": "get defi pools"})
        assert response.status_code == 200
        # Check if the response contains the expected text about pools
        assert "First 5 Available Pools" in response.json()["reply"]

@pytest.mark.asyncio
async def test_get_defi_pool_info():
    pool_id = "747c1d2a-c668-4682-b9f9-296708a3dd90"
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/api/chat", json={"message": f"get defi pools id {pool_id}"})
        assert response.status_code == 200
        # Check if the response contains historical data or relevant information
        assert "Historical Data" in response.json()["reply"]
