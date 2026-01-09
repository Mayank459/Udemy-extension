import httpx
import asyncio

async def test_server():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get('http://localhost:8000/health')
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            # Test the process endpoint with sample data
            test_data = {
                "transcript": "This is a test lecture about Python. We will learn about functions. def hello(): print('world')",
                "lecture_title": "Test Lecture"
            }
            response2 = await client.post('http://localhost:8000/api/process', json=test_data)
            print(f"\nProcess API Status: {response2.status_code}")
            print(f"Process Response: {response2.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_server())
