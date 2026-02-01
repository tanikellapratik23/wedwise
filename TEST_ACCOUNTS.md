# Test Accounts for Vivaha

All test accounts have been successfully created and are ready to use for testing the Vivaha wedding planning application.

## Test Account Credentials

| Email | Password | Wedding Date | Location | Guests | Budget | Religion |
|-------|----------|--------------|----------|--------|--------|----------|
| sarah@test.com | TestPassword123! | 2026-06-15 | Los Angeles, CA | 150 | $75,000 | Christian |
| marcus@test.com | TestPassword123! | 2026-09-20 | New York, NY | 200 | $150,000 | Secular |
| priya@test.com | TestPassword123! | 2026-08-10 | San Francisco, CA | 120 | $100,000 | Hindu |
| emma@test.com | TestPassword123! | 2026-07-25 | Boston, MA | 100 | $60,000 | Catholic |
| alex@test.com | TestPassword123! | 2026-10-05 | Seattle, WA | 80 | $50,000 | Secular |

## Features Included

Each test account comes pre-loaded with:
- ✅ Wedding date and location
- ✅ Guest count estimation  
- ✅ Budget information
- ✅ Religious preference (for vendor matching)
- ✅ Top planning priorities
- ✅ Bachelor/Bachelorette trip preferences
- ✅ Auto-save to account enabled
- ✅ All dashboard features available

## How to Use

1. Go to login page
2. Enter email from table above (e.g., `sarah@test.com`)
3. Enter password: `TestPassword123!`
4. All your wedding planning data will load automatically
5. Any changes you make will be auto-saved to the account

## Resetting Test Accounts

To recreate test accounts with fresh data:

```bash
cd server
npm run create-test-accounts
```

## Data Persistence

Test persistence:
1. Login and make a change (add guest, edit budget, create trip)
2. Logout completely
3. Login again
4. Verify change is still there

All changes are automatically saved:
- ✅ Guest additions/edits
- ✅ Budget tracking
- ✅ Ceremony planning
- ✅ Seating arrangements
- ✅ Vendor selections
- ✅ Bachelor trip details

## Testing Workflows

### Workflow 1: Bachelor Trip Creation
1. Login as `sarah@test.com`
2. Go to Bachelor/Bachelorette tab
3. Click Create Trip
4. Fill form and submit
5. Verify trip appears and saves

### Workflow 2: Vendor Search
1. Login as any account
2. Go to Vendor Management
3. Search for vendors
4. Check pagination (12 vendors per page)
5. Add vendors to favorites

### Workflow 3: Data Persistence
1. Login with test account
2. Make multiple changes
3. Logout
4. Login again
5. Verify all changes persisted

## Debugging

### Server Logs
Enhanced logging shows:
```
🔍 Bachelor Trip Create Request:
  User ID: [shown]
  Event Name: [shown]
  Trip Date: [shown]
  Location: [shown]
```

### Browser Console
Frontend logs show request/response data and errors

### Database Check
```bash
mongo vivaha
db.users.find({ email: /test/ }).pretty()
```

## Related Documentation

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing guide
- [FIXES_NEEDED.md](FIXES_NEEDED.md) - Known issues and fixes
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
