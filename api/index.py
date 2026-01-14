import sys
import os
import traceback
from fastapi import FastAPI, Response

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
except Exception as e:
    # Fallback app to display startup errors
    app = FastAPI()
    error_msg = f"Startup Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
    print(error_msg) # Log to Vercel console

    @app.get("/{path:path}")
    def catch_all(path: str):
        return Response(content=error_msg, media_type="text/plain", status_code=500)

# This is required for Vercel Serverless Functions to work with FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
