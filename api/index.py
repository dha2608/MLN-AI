from backend.main import app

# This is required for Vercel Serverless Functions to work with FastAPI
# It exposes the 'app' object as the entry point
# Vercel needs 'app' to be importable
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
