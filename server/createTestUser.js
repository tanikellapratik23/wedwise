const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wedwise')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define User schema (same as in your app)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onboardingCompleted: { type: Boolean, default: false },
  role: String,
  partnerName: String,
  weddingDate: Date,
  location: {
    city: String,
    state: String,
    country: String,
  },
  budget: Number,
  guestCount: Number,
  religions: [String],
  ceremonyType: String,
  preferences: {
    style: [String],
    colors: [String],
    season: String,
  },
  goals: [String],
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Check if test user already exists
    const existing = await User.findOne({ email: 'test@wedwise.com' });
    if (existing) {
      console.log('✅ Test user already exists!');
      console.log('\n📧 Email: test@wedwise.com');
      console.log('🔒 Password: password123');
      console.log('\nYou can now log in with these credentials!\n');
      process.exit(0);
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      name: 'Test User',
      email: 'test@wedwise.com',
      password: hashedPassword,
      onboardingCompleted: false,
    });

    await testUser.save();
    console.log('✅ Test user created successfully!\n');
    console.log('📧 Email: test@wedwise.com');
    console.log('🔒 Password: password123');
    console.log('\nYou can now log in with these credentials!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
