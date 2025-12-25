"""
Simple test script to verify the setup is correct.
This script checks if all dependencies are installed and configuration is readable.
"""

def check_dependencies():
    """Check if all required dependencies are installed."""
    print("Checking dependencies...")
    
    try:
        import selenium
        print(f"✓ Selenium installed (version {selenium.__version__})")
    except ImportError:
        print("✗ Selenium not installed")
        return False
    
    try:
        import dotenv
        print("✓ python-dotenv installed")
    except ImportError:
        print("✗ python-dotenv not installed")
        return False
    
    try:
        import webdriver_manager
        print("✓ webdriver-manager installed")
    except ImportError:
        print("✗ webdriver-manager not installed")
        return False
    
    return True


def check_config():
    """Check if configuration file exists and is readable."""
    print("\nChecking configuration...")
    
    try:
        import config
        print("✓ config.py is readable")
        
        if config.LINKEDIN_EMAIL and config.LINKEDIN_PASSWORD:
            print("✓ Credentials are set in .env file")
        else:
            print("✗ Credentials not set. Please configure your .env file")
            return False
            
        print(f"  - Max invites per day: {config.MAX_INVITES_PER_DAY}")
        print(f"  - Search keyword: {config.SEARCH_KEYWORD}")
        print(f"  - Search location: {config.SEARCH_LOCATION}")
        
        return True
        
    except ImportError:
        print("✗ config.py not found")
        return False
    except Exception as e:
        print(f"✗ Error reading config: {str(e)}")
        return False


def main():
    """Main test function."""
    print("=" * 50)
    print("LinkedIn Auto-Connect Setup Verification")
    print("=" * 50)
    
    deps_ok = check_dependencies()
    config_ok = check_config()
    
    print("\n" + "=" * 50)
    if deps_ok and config_ok:
        print("✓ Setup verified successfully!")
        print("You can now run: python linkedin_autoconnect.py")
    else:
        print("✗ Setup incomplete. Please fix the issues above.")
        if not deps_ok:
            print("\nTo install dependencies, run:")
            print("  pip install -r requirements.txt")
        if not config_ok:
            print("\nTo configure credentials, edit the .env file.")
    print("=" * 50)


if __name__ == "__main__":
    main()
