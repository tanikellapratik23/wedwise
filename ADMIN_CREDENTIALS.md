# Admin Account Credentials

## Admin User Details
- **Name:** Pratik Tanikella
- **Email:** pratiktanikella@gmail.com
- **Password:** WedWise2024!Admin
- **Role:** Admin (isAdmin: true)

## How to Create Admin Account

Run the following command from the `server` directory:

```bash
node createAdmin.js
```

This will:
1. Connect to MongoDB
2. Check if admin already exists
3. Create admin user with hashed password
4. Set onboardingCompleted to true (skip onboarding)
5. Set isAdmin flag to true

## Admin Features

The admin account has:
- Full access to all features
- Onboarding automatically completed
- Access to view all user data (if admin panel is implemented)
- Priority support and testing capabilities

## Security Notes

⚠️ **IMPORTANT**: 
- Store these credentials securely
- Do not commit plain passwords to git
- Change the password after first login
- Use environment variables for production

## Login URL

- **Local:** http://localhost:5175/login
- **Production:** https://tanikellapratik23.github.io/vivaha/login
