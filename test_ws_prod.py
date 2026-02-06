import asyncio
import websockets
import sys

async def test_connection():
    uri = "wss://ade-api.getmytestdrive.com/ws/projects/test-connection"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri, origin="https://ade.getmytestdrive.com") as websocket:
            print("✓ Connection established!")
            # We don't need to send anything, the handshake is the important part
            return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)
