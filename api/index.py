from backend.main import app

# Vercel needs a handler variable. 
# Depending on how Vercel python builder works, it often looks for 'app' or 'handler'.
# FastAPI app is a valid WSGI/ASGI application.
# Vercel supports standard WSGI/ASGI apps.
