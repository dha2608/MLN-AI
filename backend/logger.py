import logging
import os
import sys
from datetime import datetime

# Configure logging
handlers = [logging.StreamHandler(sys.stdout)]

# Try to setup file logging, but don't fail if filesystem is read-only (like Vercel)
try:
    log_dir = "logs"
    # Only attempt to create directory if we are not in a serverless environment that forbids it
    # But easiest is to try and catch
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_filename = f"{log_dir}/app_{datetime.now().strftime('%Y-%m-%d')}.log"
    handlers.append(logging.FileHandler(log_filename))
except OSError:
    # Likely Read-only file system on Vercel
    pass
except Exception as e:
    print(f"Warning: Failed to setup file logging: {e}")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=handlers
)

logger = logging.getLogger("AIchatMLN")

def log_info(message: str):
    logger.info(message)

def log_error(message: str, error: Exception = None):
    if error:
        logger.error(f"{message}: {str(error)}", exc_info=True)
    else:
        logger.error(message)

def log_warning(message: str):
    logger.warning(message)
