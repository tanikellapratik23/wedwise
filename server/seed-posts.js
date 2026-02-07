const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedwise';

const samplePosts = [
  {
    userName: "Priya & Michael",
    postType: "photo",
    category: "wedding-rave",
    content: "Still can't believe how smoothly our wedding came together. Two cultures, one ceremony, zero chaos. The joint rituals felt intentional, not rushed, and our families finally got each other by the end of the night.",
    photoUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",
    location: "Edison, NJ",
    tags: ["RoyalAlcoveEvents", "EdisonNJ", "ShaadiDecorCo"],
    likes: 24,
    likedBy: [],
    comments: [
      {
        userName: "Sarah & Raj",
        content: "This is so beautiful! We're planning a fusion wedding too. Any tips?",
        createdAt: new Date()
      }
    ]
  },
  {
    userName: "Aisha & David",
    postType: "blog",
    category: "app-feedback",
    content: "The budget tracker and split payments saved us multiple arguments 😅\nWould love to see a vendor comparison feature next—especially for photographers across regions. Overall though, Vivaha made planning feel less overwhelming.",
    photoUrl: "",
    location: "San Jose, CA",
    tags: ["VivahaApp", "WeddingPlanning", "BayAreaWeddings"],
    appRating: 4,
    likes: 18,
    likedBy: [],
    comments: []
  },
  {
    userName: "Maya & James",
    postType: "blog",
    category: "wedding-rave",
    content: "Our biggest fear was blending traditions without offending anyone. Vivaha's cultural checklist helped us explain why certain rituals mattered, which made family conversations way easier. Highly recommend for interfaith couples.",
    photoUrl: "",
    location: "Dallas, TX",
    tags: ["InterfaithWedding", "DallasWeddings", "FamilyFirst"],
    likes: 31,
    likedBy: [],
    comments: [
      {
        userName: "Lisa & Ahmed",
        content: "We needed this advice 6 months ago! Thank you for sharing 💕",
        createdAt: new Date()
      }
    ]
  },
  {
    userName: "Neha & Chris",
    postType: "photo",
    category: "app-feedback",
    content: "Love the timeline reminders—especially for ceremonies with multiple rituals. Would be great if guests could see a simplified version so everyone knows what's happening without asking 10 questions.",
    photoUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    location: "Chicago, IL",
    tags: ["VivahaFeedback", "ChicagoWedding", "WeddingTech"],
    appRating: 5,
    likes: 15,
    likedBy: [],
    comments: []
  },
  {
    userName: "Ananya & Ryan",
    postType: "photo",
    category: "wedding-rave",
    content: "From engagement to reception, having everything in one place just worked. Seeing other couples' posts here also helped us realize we weren't alone in stressing over the small stuff.",
    photoUrl: "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80",
    location: "Fremont, CA",
    tags: ["VivahaCommunity", "BayAreaWedding", "ModernTraditions"],
    likes: 27,
    likedBy: [],
    comments: [
      {
        userName: "Jessica & Arjun",
        content: "Same! This community has been a lifesaver",
        createdAt: new Date()
      }
    ]
  }
];

async function seedPosts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Post model
    const Post = mongoose.model('Post', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      postType: String,
      category: String,
      content: String,
      photoUrl: String,
      location: String,
      tags: [String],
      likes: { type: Number, default: 0 },
      likedBy: [String],
      comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
      }],
      appRating: Number
    }, { timestamps: true }));

    // Check if posts already exist
    const existingCount = await Post.countDocuments();
    if (existingCount >= 5) {
      console.log(`ℹ️  Already have ${existingCount} posts. Skipping seed.`);
      process.exit(0);
    }

    // Insert sample posts
    console.log('📝 Creating sample posts...');
    await Post.insertMany(samplePosts);
    
    const totalPosts = await Post.countDocuments();
    console.log(`✅ Successfully created ${samplePosts.length} sample posts!`);
    console.log(`📊 Total posts in database: ${totalPosts}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    process.exit(1);
  }
}

seedPosts();
