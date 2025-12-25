"""LinkedIn Auto-Connect Bot.

This script automates sending connection requests on LinkedIn.
Use responsibly and in accordance with LinkedIn's terms of service.
"""
import time
import logging
import sys
from urllib.parse import quote_plus
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, 
    NoSuchElementException,
    ElementClickInterceptedException
)
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('linkedin_autoconnect.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class LinkedInAutoConnect:
    """Automates sending connection requests on LinkedIn."""
    
    def __init__(self):
        """Initialize the LinkedIn automation bot."""
        config.validate_config()
        self.driver = None
        self.wait = None
        self.invites_sent = 0
        self.max_invites = config.MAX_INVITES_PER_DAY
        
    def setup_driver(self):
        """Set up the Chrome WebDriver."""
        logger.info("Setting up Chrome WebDriver...")
        options = webdriver.ChromeOptions()
        
        if config.HEADLESS_MODE:
            options.add_argument('--headless')
        
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, config.BROWSER_WAIT_TIME)
        logger.info("Chrome WebDriver setup complete.")
        
    def login(self):
        """Log in to LinkedIn."""
        logger.info("Logging in to LinkedIn...")
        self.driver.get(config.LINKEDIN_LOGIN_URL)
        time.sleep(2)
        
        try:
            # Enter email
            email_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            email_field.send_keys(config.LINKEDIN_EMAIL)
            
            # Enter password
            password_field = self.driver.find_element(By.ID, "password")
            password_field.send_keys(config.LINKEDIN_PASSWORD)
            
            # Click login button
            login_button = self.driver.find_element(
                By.CSS_SELECTOR, "button[type='submit']"
            )
            login_button.click()
            
            # Wait for login to complete
            time.sleep(5)
            
            # Check if login was successful
            if "feed" in self.driver.current_url or "search" in self.driver.current_url:
                logger.info("Successfully logged in to LinkedIn.")
                return True
            else:
                logger.error("Login may have failed. Please check credentials.")
                return False
                
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return False
    
    def search_people(self):
        """Navigate to people search with specified criteria."""
        logger.info(f"Searching for: {config.SEARCH_KEYWORD} in {config.SEARCH_LOCATION}")
        
        # Build search URL with proper URL encoding
        search_url = (
            f"{config.LINKEDIN_SEARCH_URL}"
            f"?keywords={quote_plus(config.SEARCH_KEYWORD)}"
            f"&origin=SWITCH_SEARCH_VERTICAL"
        )
        
        self.driver.get(search_url)
        time.sleep(3)
        logger.info("Search page loaded.")
    
    def send_connection_requests(self):
        """Send connection requests to search results."""
        logger.info("Starting to send connection requests...")
        
        try:
            # Scroll to load more results
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
            
            # Find all "Connect" buttons
            # Note: XPath selectors may need updating if LinkedIn changes their UI
            connect_buttons = self.driver.find_elements(
                By.XPATH, 
                "//button[contains(@aria-label, 'Invite') or .//span[text()='Connect']]"
            )
            
            logger.info(f"Found {len(connect_buttons)} potential connections.")
            
            for button in connect_buttons:
                if self.invites_sent >= self.max_invites:
                    logger.info(f"Reached maximum invites limit: {self.max_invites}")
                    break
                
                try:
                    # Scroll button into view
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", button)
                    time.sleep(1)
                    
                    # Click the Connect button
                    button.click()
                    time.sleep(2)
                    
                    # Look for "Send without a note" or "Send" button in modal
                    # Note: Button text/labels may vary across LinkedIn locales
                    try:
                        send_button = self.wait.until(
                            EC.element_to_be_clickable(
                                (By.XPATH, "//button[contains(@aria-label, 'Send without a note') or .//span[text()='Send']]")
                            )
                        )
                        send_button.click()
                        self.invites_sent += 1
                        logger.info(f"Connection request sent. Total: {self.invites_sent}")
                        time.sleep(3)
                        
                    except TimeoutException:
                        # If no modal appears, the connection might have been sent directly
                        logger.info("No modal appeared, connection might be sent directly.")
                        self.invites_sent += 1
                    except Exception as e:
                        logger.warning(f"Could not send connection request: {str(e)}")
                        # Try to close any open modal
                        try:
                            close_button = self.driver.find_element(
                                By.XPATH, "//button[@aria-label='Dismiss']"
                            )
                            close_button.click()
                        except Exception:
                            pass
                        
                except ElementClickInterceptedException:
                    logger.warning("Button click was intercepted, skipping...")
                    continue
                except Exception as e:
                    logger.warning(f"Error clicking connect button: {str(e)}")
                    continue
            
            logger.info(f"Finished sending connection requests. Total sent: {self.invites_sent}")
            
        except Exception as e:
            logger.error(f"Error in send_connection_requests: {str(e)}")
    
    def run(self):
        """Run the LinkedIn auto-connect bot."""
        try:
            logger.info("Starting LinkedIn Auto-Connect Bot...")
            self.setup_driver()
            
            if not self.login():
                logger.error("Login failed. Exiting...")
                return
            
            self.search_people()
            self.send_connection_requests()
            
            logger.info("Bot execution completed.")
            
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            
        finally:
            if self.driver:
                logger.info("Closing browser...")
                time.sleep(2)
                self.driver.quit()


def main():
    """Main entry point for the script."""
    bot = LinkedInAutoConnect()
    bot.run()


if __name__ == "__main__":
    main()
