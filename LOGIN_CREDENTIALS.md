# 🔐 Vivaha Login Credentials

## Working Test Account

Use these credentials to log in to your Vivaha application:

**📧 Email:** `test@wedwise.com`  
**🔒 Password:** `password123`

---

## Application URLs

- **Frontend:** http://localhost:5175/
- **Backend API:** http://localhost:3000/

---

## Features Ready to Test

✅ **Registration & Login** - Fixed with better error handling  
✅ **Multi-day Ceremony Planning** - Plan 3-4 day weddings  
✅ **Religious & Cultural Vendor Filters** - Hindu, Muslim, Indian, etc.  
✅ **Real Yelp Vendor API** - Live vendor data from Yelp  
✅ **Excel Guest Import/Export** - Upload and download guest lists  
✅ **Public Dashboard Sharing** - Generate shareable links  

---

## Registration Also Works!

You can also create a new account by:
1. Go to http://localhost:5175/
2. Click "Sign up"
3. Fill in your details
4. Complete the onboarding flow

Both login and registration now have:
- Better error messages
- Console logging for debugging
- Direct API calls (bypassing proxy issues)

---

## Troubleshooting

If you get "Registration failed", check:
- Backend server is running on port 3000
- MongoDB is running (`brew services list`)
- Open browser console (F12) to see detailed error logs
- Backend terminal will show registration/login attempts
