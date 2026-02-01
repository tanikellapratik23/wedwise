# Quick Reference - Vivaha Testing

## Test Accounts (All Ready to Use)

```
Email: sarah@test.com | Password: TestPassword123!
Email: marcus@test.com | Password: TestPassword123!
Email: priya@test.com | Password: TestPassword123!
Email: emma@test.com | Password: TestPassword123!
Email: alex@test.com | Password: TestPassword123!
```

## Start Development

```bash
# Terminal 1 - Backend
cd /Users/pratiktanikella/Desktop/wedwise/server
npm run dev

# Terminal 2 - Frontend
cd /Users/pratiktanikella/Desktop/wedwise/client
npm run dev
```

App runs at: `http://localhost:5173`

## Test Checklist

- [ ] Login with test account
- [ ] Dashboard loads with pre-filled data
- [ ] Create bachelor trip
- [ ] Search vendors (check pagination - should show 12 at a time)
- [ ] Add vendor to favorites
- [ ] Make a change (edit guest, add budget item)
- [ ] Logout and login again - verify change persists
- [ ] Check no errors in browser console
- [ ] Check no errors in server logs

## Key Features Fixed

✅ **Vendor Search:** 10x faster with pagination (12 per page)
✅ **Trip Creation:** Enhanced logging for debugging
✅ **Test Accounts:** 5 accounts with pre-filled data
✅ **Auto-Save:** All changes persist to account
✅ **Emails:** Welcome email on first login

## Debugging Commands

**Create test accounts:**
```bash
cd server
npm run create-test-accounts
```

**View server logs:**
Look for:
- `🔍 Bachelor Trip Create Request:` - shows trip creation data
- `✅ Trip created successfully:` - successful creation
- `❌ Error` - error messages

**View database:**
```bash
mongo vivaha
db.users.find({ email: /test/ }).pretty()
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Login fails | Verify password is exactly `TestPassword123!` |
| Data not saving | Check network tab in DevTools, ensure POST succeeds |
| Vendor search slow | Verify pagination buttons appear, clear cache |
| Trip creation fails | Check server logs for 🔍 message showing received data |
| Emails not sending | Check RESEND_API_KEY is set in environment |

## Documentation

- **Full Testing Guide:** [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Test Accounts:** [TEST_ACCOUNTS.md](TEST_ACCOUNTS.md)
- **All Changes:** [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)
- **Fixes Applied:** [FIXES_NEEDED.md](FIXES_NEEDED.md)

## API Endpoints

```bash
# Login
POST http://localhost:3000/api/auth/login
Body: { email, password }

# Get Trip
GET http://localhost:3000/api/bachelor-trip
Headers: { Authorization: "Bearer TOKEN" }

# Create Trip
POST http://localhost:3000/api/bachelor-trip/create
Headers: { Authorization: "Bearer TOKEN" }
Body: {
  eventName: "Vegas Trip",
  eventType: "bachelor",
  tripDate: "2026-05-15",
  location: { city: "Las Vegas", state: "Nevada", country: "United States" },
  estimatedBudget: 5000
}
```

## Next Steps

1. Start both backend and frontend
2. Test login with sarah@test.com
3. Try creating a bachelor trip
4. Search vendors and check pagination
5. Make changes and verify they save
6. Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete workflows
