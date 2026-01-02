# Email Setup Instructions

## Configuration Required

To enable email functionality, you need to set up Gmail App Password in your `.env` file.

### Steps:

1. **Enable 2-Factor Authentication** on your Gmail account (sportsmantalenta56@gmail.com)

2. **Generate App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update `.env` file**:
   ```env
   EMAIL_USER=sportsmantalenta56@gmail.com
   EMAIL_PASS=your-16-character-app-password-here
   ```

4. **Restart your server** after updating the `.env` file

## Email Routing

Contact forms are automatically routed to the appropriate email:

- **Brands & Sponsors** → `sportsmantalentagencybrandprom@gmail.com`
- **Athletes & Talent** → `scoutresearchedusportsmantalent@gmail.com`
- **Media Inquiries** → `sportsmantalenta56@gmail.com`
- **Careers** → `sportsmantalenta56@gmail.com`

## Testing

After setup, test the contact forms to ensure emails are being sent correctly.

## Troubleshooting

If emails are not sending:
1. Verify EMAIL_PASS is set correctly in `.env`
2. Check that 2FA is enabled on the Gmail account
3. Verify the app password is correct (16 characters, no spaces)
4. Check server logs for error messages
5. Ensure port 587 is not blocked by firewall

