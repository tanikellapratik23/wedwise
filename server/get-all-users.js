#!/usr/bin/env node
/**
 * Script to fetch all registered users from MongoDB
 * Usage: node get-all-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isAdmin: Boolean,
  onboardingCompleted: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

async function getAllUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedwise';
    console.log(`🔗 Connecting to MongoDB: ${mongoUri.split('@')[mongoUri.split('@').length - 1]}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    console.log(`📊 Total Registered Accounts: ${users.length}\n`);
    console.log('═'.repeat(100));
    console.log('ALL REGISTERED ACCOUNTS:');
    console.log('═'.repeat(100));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'N/A'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role || 'user'}`);
      console.log(`   🔑 Admin: ${user.isAdmin ? 'YES' : 'NO'}`);
      console.log(`   ✅ Onboarding: ${user.onboardingCompleted ? 'Complete' : 'Incomplete'}`);
      console.log(`   📅 Created: ${new Date(user.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '═'.repeat(100));
    console.log(`\n✨ Summary: ${users.length} account(s) found\n`);

    // Export as JSON
    const jsonFile = './all-users.json';
    require('fs').writeFileSync(jsonFile, JSON.stringify(users, null, 2));
    console.log(`📁 User list exported to: ${jsonFile}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getAllUsers();
