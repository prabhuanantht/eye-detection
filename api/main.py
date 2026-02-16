import os
import sys

# Ensure project root is on the path so that `backend` and `ml_pipeline` can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Import the existing Flask app
from backend.app import app  # noqa: E402,F401

