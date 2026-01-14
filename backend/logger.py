import logging
import os
from datetime import datetime

# Create logs directory if it doesn't exist
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Generate log filename with timestamp
log_filename = f"{log_dir}/app_{datetime.now().strftime('%Y-%m-%d')}.log"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler() # Also output to console
    ]
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
