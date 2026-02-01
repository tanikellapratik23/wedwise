# Vivaha - Complete Wedding Planning Platform

## 🎉 New Features Added

### 1. ✅ **Real Vendor APIs (Yelp Integration)**
- Integrated Yelp Fusion API for real vendor data
- Shows actual wedding vendors (photographers, DJs, venues, etc.) in your city
- Falls back to Google Maps search links if no Yelp API key
- **Setup**: Add `YELP_API_KEY` to `/server/.env` (get from https://www.yelp.com/developers)

### 2. ✅ **Excel Import for Guest List**
- Import guests from Excel/CSV files
- Supports columns: Name, Email, Phone, Group, Meal Preference, Plus One
- Export your guest list to Excel anytime
- No need to type guests manually!

### 3. ✅ **Public Dashboard Sharing**
- Generate shareable links for family and friends
- Two access levels: **View Only** or **Can Edit**
- No account required for shared access
- Links expire after 90 days (configurable)
- Manage and revoke links anytime

### 4. ✅ **Wedding Countdown**
- Real-time countdown on Overview dashboard
- Shows days, hours, and minutes until your wedding
- Based on the date and time you entered during signup

### 5. ✅ **Religious Ceremony Section**
- Dedicated "Ceremony" tab in dashboard (appears only for religious weddings)
- Auto-generated ritual suggestions for 14+ religions
- Interfaith ceremony support
- Custom ritual additions

## 🚀 Quick Start

### Backend Setup
```bash
cd server
npm install
# Create .env file:
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit: **http://localhost:5174**

## 🔑 API Keys (Optional but Recommended)

### Yelp Fusion API (For Real Vendors)
1. Go to https://www.yelp.com/developers/v3/manage_app
2. Create a new app
3. Copy your API Key
4. Add to `/server/.env`:
   ```
   YELP_API_KEY=your_api_key_here
   ```

Without the API key, the app will use Google Maps search links (which still work great!).

## 📊 Excel Guest List Format

Your Excel file should have these columns:
- **Name** (required)
- **Email** (optional)
- **Phone** (optional)
- **Group** (e.g., Family, Friends, Coworkers)
- **Meal Preference** (optional)
- **Plus One** (Yes/No)

## 🔗 Sharing Your Dashboard

1. Go to **Settings** tab in dashboard
2. Scroll to "Share Dashboard" section
3. Click "Create View-Only Link" or "Create Editing Link"
4. Copy and share the link with family/friends
5. They can access without creating an account!

## 📱 Features Overview

- ✅ Personalized 8-step onboarding
- ✅ Wedding date & time with countdown
- ✅ Location auto-detection
- ✅ Religious & interfaith ceremony planning
- ✅ Real vendor search (photographers, DJs, venues, caterers, florists, officiants, planners)
- ✅ Guest list management with Excel import/export
- ✅ Budget tracker with city-specific data
- ✅ To-do list
- ✅ Seating planner
- ✅ Dashboard sharing (view & edit access)
- ✅ Settings management

## 🏙️ Supported Cities (with wedding cost data)

New York, San Francisco, Los Angeles, Chicago, Miami, Boston, Seattle, Austin, Denver, Portland, Nashville, Atlanta, Phoenix

The app works for ANY city, but these have specific budget recommendations.

## 🔒 Security

- JWT authentication
- MongoDB for data storage
- Shareable links with expiration
- Environment variables for sensitive data

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **APIs**: Yelp Fusion, OpenStreetMap Nominatim
- **Libraries**: xlsx (Excel), Recharts (charts), Lucide React (icons)

## 📝 Notes

- Countdown appears automatically after setting wedding date in onboarding
- Religious ceremony tab only shows if you selected a religious wedding
- Excel import is flexible - it will map columns automatically
- Sharing links can be revoked anytime from Settings

Enjoy planning your perfect wedding! 💕
