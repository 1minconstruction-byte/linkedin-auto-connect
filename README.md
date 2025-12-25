# LinkedIn Auto-Connect

An automated tool to send connection requests on LinkedIn using Python and Selenium.

## ⚠️ Disclaimer

**Important:** This tool is for educational purposes only. Use it responsibly and in accordance with LinkedIn's Terms of Service. Excessive automation may result in your LinkedIn account being restricted or banned. 

**Best Practices:**
- Keep MAX_INVITES_PER_DAY to a reasonable number (recommended: 20-50)
- Add delays between actions to mimic human behavior
- Don't run the script multiple times per day
- Use at your own risk

## Features

- ✅ Automated login to LinkedIn
- ✅ Search for people by keywords and location
- ✅ Send connection requests automatically
- ✅ Configurable daily limits
- ✅ Logging for tracking actions
- ✅ Error handling and recovery

## Prerequisites

- Python 3.7 or higher
- Chrome browser installed
- LinkedIn account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/1minconstruction-byte/linkedin-auto-connect.git
cd linkedin-auto-connect
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your LinkedIn credentials and preferences:
```
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
MAX_INVITES_PER_DAY=50
SEARCH_KEYWORD=Software Engineer
SEARCH_LOCATION=United States
```

5. Verify your setup (optional):
```bash
python test_setup.py
```


## Configuration

Edit the `.env` file to customize the bot's behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| `LINKEDIN_EMAIL` | Your LinkedIn email address | (required) |
| `LINKEDIN_PASSWORD` | Your LinkedIn password | (required) |
| `MAX_INVITES_PER_DAY` | Maximum connection requests per run | 50 |
| `SEARCH_KEYWORD` | Search term for finding people | Software Engineer |
| `SEARCH_LOCATION` | Location filter for search (currently informational only) | United States |
| `HEADLESS_MODE` | Run browser in headless mode | False |
| `BROWSER_WAIT_TIME` | Timeout for browser operations (seconds) | 5 |

**Note:** Location filtering requires manual application on LinkedIn's search page after the script navigates there.

## Usage

Run the script:
```bash
python linkedin_autoconnect.py
```

The bot will:
1. Open a Chrome browser window
2. Log in to LinkedIn with your credentials
3. Search for people based on your search criteria
4. Send connection requests up to the daily limit
5. Log all actions to `linkedin_autoconnect.log`

## Logs

All actions are logged to `linkedin_autoconnect.log` in the same directory. Check this file to see:
- Login status
- Number of connection requests sent
- Any errors encountered

## Troubleshooting

### Login Issues
- Verify your credentials in the `.env` file
- LinkedIn may require CAPTCHA or two-factor authentication - run without headless mode to handle manually
- Check if your account has any restrictions

### Connection Requests Not Sending
- LinkedIn's UI may have changed - check the logs for specific errors
- Ensure you haven't exceeded LinkedIn's weekly connection request limit
- Some profiles may not have a "Connect" button visible

### Browser Issues
- Make sure Chrome is installed and up to date
- The script will automatically download the appropriate ChromeDriver

## Security

- **Never commit your `.env` file** - it's included in `.gitignore` by default
- Use a strong, unique password for LinkedIn
- Consider using a test account for initial testing
- Be aware that storing passwords in plain text (even in .env files) has security implications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is provided as-is for educational purposes. Use at your own risk.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
