import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env from server/.env
env_path = Path("server/.env").resolve()
load_dotenv(dotenv_path=env_path)

# Add server to path
sys.path.insert(0, os.getcwd())

from server.agents.registry import register_project, list_registered_projects, _get_engine

def test_connection():
    print(f"Testing connection...")
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
    
    # Initialize engine
    engine, _ = _get_engine()
    print(f"Engine URL: {engine.url}")
    
    # Try to register a project
    test_name = "registry-test-script"
    test_path = Path("/tmp/registry-test-script").resolve()
    test_path.mkdir(exist_ok=True)
    
    print(f"Registering project {test_name}...")
    try:
        register_project(test_name, test_path)
        print("Registration call complete.")
    except Exception as e:
        print(f"Registration failed: {e}")
        return

    # List projects
    print("Listing projects...")
    projects = list_registered_projects()
    print(f"Projects found: {list(projects.keys())}")
    
    if test_name in projects:
        print("SUCCESS: Project found in registry.")
    else:
        print("FAILURE: Project NOT found in registry.")

if __name__ == "__main__":
    test_connection()
