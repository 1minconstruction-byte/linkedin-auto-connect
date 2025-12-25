"""Configuration module for LinkedIn Auto-Connect."""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# LinkedIn credentials
LINKEDIN_EMAIL = os.getenv('LINKEDIN_EMAIL', '')
LINKEDIN_PASSWORD = os.getenv('LINKEDIN_PASSWORD', '')

# Settings
MAX_INVITES_PER_DAY = int(os.getenv('MAX_INVITES_PER_DAY', 50))
SEARCH_KEYWORD = os.getenv('SEARCH_KEYWORD', 'Software Engineer')
SEARCH_LOCATION = os.getenv('SEARCH_LOCATION', 'United States')

# Browser settings
HEADLESS_MODE = os.getenv('HEADLESS_MODE', 'False').lower() == 'true'
BROWSER_WAIT_TIME = int(os.getenv('BROWSER_WAIT_TIME', 5))

# URLs
LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login'
LINKEDIN_SEARCH_URL = 'https://www.linkedin.com/search/results/people/'

def validate_config():
    """Validate that required configuration is set."""
    if not LINKEDIN_EMAIL or not LINKEDIN_PASSWORD:
        raise ValueError(
            "LinkedIn credentials not set. Please set LINKEDIN_EMAIL and "
            "LINKEDIN_PASSWORD in your .env file."
        )
    return True
