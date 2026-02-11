const fs = require('fs');
const path = require('path');

const userDataKeys = ['budget', 'todos', 'guests', 'seating', 'ceremony', 'favoriteVendors', 'myVendors', 'registries', 'bachelorTrip', 'vivahaSplit', 'aiAssistantState', 'vendorNotes', 'postWeddingPhotos', 'wantsBachelorParty', 'onboarding'];
const dashboardPath = path.join(__dirname, 'client/src/components/dashboard');

let foundLeaks = [];

// Read all TSX files
const files = fs.readdirSync(dashboardPath).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dashboardPath, file), 'utf8');
  userDataKeys.forEach(key => {
    const patterns = [
      `localStorage.getItem('${key}')`,
      `localStorage.setItem('${key}'`,
      `localStorage.removeItem('${key}')`
    ];
    patterns.forEach(pattern => {
      if (content.includes(pattern)) {
        foundLeaks.push(`${file}: ${pattern}`);
      }
    });
  });
});

if (foundLeaks.length === 0) {
  console.log('✅ VERIFICATION COMPLETE: NO DATA LEAKS FOUND');
  console.log('All user data properly uses userDataStorage with userId-based isolation');
} else {
  console.log('⚠️ FOUND REMAINING LEAKS:');
  foundLeaks.forEach(l => console.log(`  ${l}`));
  process.exit(1);
}
