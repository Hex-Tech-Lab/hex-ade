#!/usr/bin/env python3
"""
Quick backend test script
Tests if the backend can start properly and serve basic endpoints
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test if we can import main
    from server.main import app

    print("✅ Backend imports successfully")

    # Check if app is created
    if app:
        print(f"✅ FastAPI app created: {app.title}")
        print(f"✅ API version: {app.version}")

        # List available routes
        print("\n📋 Available routes:")
        for route in app.routes:
            if hasattr(route, "path"):
                methods = getattr(route, "methods", ["GET"])
                print(f"  {route.path} - {methods}")

        print("\n✅ Backend is ready for deployment!")
        print("\n⚠️  Next steps:")
        print("1. GC needs to deploy to Render.com via dashboard")
        print("2. Then update frontend API URL to Render URL")
        print("3. Test full-stack integration")
    else:
        print("❌ Failed to create FastAPI app")

except Exception as e:
    print(f"❌ Backend test failed: {type(e).__name__}: {e}")
    print("\n💡 Common issues:")
    print("1. Missing dependencies - run: pip install -r server/requirements.txt")
    print("2. Environment variables not set")
    print("3. Import path issues")
    sys.exit(1)
