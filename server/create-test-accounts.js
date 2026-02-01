#!/usr/bin/env node

/**
 * Test Account Generator for Vivaha Wedding Planning App
 * This script creates test accounts with sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

// Import models
const User = require('./dist/models/User').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vivaha';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const jwt = require('jsonwebtoken');

const testAccounts = [
  {
    name: 'Sarah Anderson',
    email: 'sarah@test.com',
    password: 'TestPassword123!',
    weddingDate: '2026-06-15',
    weddingCity: 'Los Angeles',
    weddingState: 'CA',
    guestCount: 150,
    estimatedBudget: 75000,
    isReligious: true,
    religions: ['Christian'],
    topPriority: ['Photography', 'Venue', 'Catering'],
    wantsBachelorParty: true,
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus@test.com',
    password: 'TestPassword123!',
    weddingDate: '2026-09-20',
    weddingCity: 'New York',
    weddingState: 'NY',
    guestCount: 200,
    estimatedBudget: 150000,
    isReligious: false,
    religions: [],
    topPriority: ['Venue', 'Catering', 'Music'],
    wantsBachelorParty: true,
  },
  {
    name: 'Priya Patel',
    email: 'priya@test.com',
    password: 'TestPassword123!',
    weddingDate: '2026-05-10',
    weddingCity: 'San Francisco',
    weddingState: 'CA',
    guestCount: 120,
    estimatedBudget: 100000,
    isReligious: true,
    religions: ['Hindu'],
    topPriority: ['Photographer', 'Decorator', 'Caterer'],
    wantsBachelorParty: true,
  },
  {
    name: 'Emma Williams',
    email: 'emma@test.com',
    password: 'TestPassword123!',
    weddingDate: '2026-07-04',
    weddingCity: 'Boston',
    weddingState: 'MA',
    guestCount: 100,
    estimatedBudget: 60000,
    isReligious: true,
    religions: ['Catholic'],
    topPriority: ['Church', 'Reception Venue', 'Flowers'],
    wantsBachelorParty: false,
  },
  {
    name: 'Alex Chen',
    email: 'alex@test.com',
    password: 'TestPassword123!',
    weddingDate: '2026-11-11',
    weddingCity: 'Seattle',
    weddingState: 'WA',
    guestCount: 80,
    estimatedBudget: 50000,
    isReligious: false,
    religions: [],
    topPriority: ['Outdoor Venue', 'Catering', 'Photography'],
    wantsBachelorParty: true,
  },
];

async function createTestAccounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nCreating test accounts...\n');

    for (const account of testAccounts) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: account.email });
        if (existingUser) {
          console.log(`✓ ${account.email} - Already exists`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(account.password, 10);

        // Create user
        const user = new User({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          onboardingData: {
            weddingDate: account.weddingDate,
            weddingCity: account.weddingCity,
            weddingState: account.weddingState,
            guestCount: account.guestCount,
            estimatedBudget: account.estimatedBudget,
            isReligious: account.isReligious,
            religions: account.religions,
            topPriority: account.topPriority,
            wantsBachelorParty: account.wantsBachelorParty,
          },
          onboardingCompleted: true,
        });

        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: '30d',
        });

        console.log(`✓ ${account.email}`);
        console.log(`  Token: ${token}`);
        console.log(`  Password: ${account.password}\n`);
      } catch (err) {
        console.error(`✗ Failed to create ${account.email}:`, err.message);
      }
    }

    console.log('\n✅ Test accounts created successfully!');
    console.log('\nTest Account Credentials:');
    console.log('================================================');
    testAccounts.forEach((acc) => {
      console.log(`Email: ${acc.email}`);
      console.log(`Password: ${acc.password}\n`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestAccounts();
