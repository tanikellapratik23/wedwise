const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedwise';

const samplePosts = [
  // BLOG POST 1: How to Plan an Interfaith Wedding
  {
    userName: "Vivaha Team",
    postType: "blog",
    category: "app-feedback",
    content: `**How to Plan an Interfaith Wedding: A Complete Guide**

Planning an interfaith wedding can feel overwhelming, but it's also an incredible opportunity to celebrate two cultures coming together. Here's everything you need to know:

**1. Start with Open Conversations**
Before diving into logistics, sit down with your partner and discuss what traditions matter most to each of you. Be specific: Is it the ceremony structure? Certain rituals? Family participation? Understanding priorities early prevents conflicts later.

**2. Find the Right Officiant**
Look for someone experienced in interfaith ceremonies. Many cities have interfaith ministers who specialize in blending traditions. Interview at least 3 candidates and ask about their approach to combining different religious elements.

**3. Educate Your Guests**
Create a ceremony program that explains each ritual's significance. This helps guests from both sides understand and appreciate the traditions they're witnessing. Consider brief announcements during the ceremony as well.

**4. Compromise Creatively**
You don't have to choose between traditions—blend them! Have two ceremony parts (one for each faith), incorporate symbolic gestures that work for both cultures, or create new traditions that represent your unique union.

**5. Respect Family Concerns**
Some family members may have reservations. Listen with empathy, explain your choices, and involve them where possible. Sometimes giving them a special role (like a reading or blessing) helps them feel included.

**6. Handle Logistics Thoughtfully**
Consider timing (avoiding both religions' major holidays), dietary restrictions (kosher, halal, vegetarian options), dress codes, and seating arrangements. Small details show respect for everyone's beliefs.

**7. Use Planning Tools**
Apps like Vivaha are designed specifically for interfaith weddings, with ceremony templates, cultural checklists, and budget trackers that account for multiple traditions. They make coordination so much easier.

**Real Talk: It Won't Be Perfect**
And that's okay. Focus on what matters: celebrating your love and bringing two families together. The goal isn't perfection—it's creating a meaningful day that honors both your backgrounds.

Need help planning your interfaith wedding? Vivaha has ceremony templates for Hindu-Christian, Muslim-Jewish, Buddhist-Catholic, and many other combinations. Start planning today!`,
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    location: "United States",
    tags: ["InterfaithWedding", "WeddingPlanning", "CulturalFusion", "VivahaGuide"],
    likes: 142,
    likedBy: [],
    comments: [
      {
        userName: "Sarah & Raj",
        content: "This guide is exactly what we needed! Planning our Hindu-Christian wedding and feeling so much more confident now.",
        createdAt: new Date('2026-01-15')
      },
      {
        userName: "Emily Chen",
        content: "The officiant tip is gold. We found an amazing interfaith minister through a referral and she made our ceremony so special.",
        createdAt: new Date('2026-01-18')
      }
    ]
  },

  // BLOG POST 2: Budget-Saving Tips
  {
    userName: "Vivaha Team",
    postType: "blog",
    category: "app-feedback",
    content: `**10 Budget-Saving Tips for Modern Weddings (Without Sacrificing Style)**

Weddings are expensive—the average U.S. wedding costs $30,000-$50,000. But you can create a beautiful celebration without breaking the bank. Here's how:

**1. Choose an Off-Season Date (Save 20-30%)**
November-March weddings (excluding holidays) cost significantly less. Vendors have more availability, venues offer discounts, and you'll have better negotiating power. A February wedding can save you $5,000-$10,000 instantly.

**2. Go Weekday or Sunday (Save $2,000-$5,000)**
Saturday weddings command premium pricing. Friday evening or Sunday afternoon weddings cost 20-40% less at the same venues. Your close friends and family will make it work.

**3. Reduce Your Guest List (Biggest Savings)**
Each guest costs $150-$300 (food, drinks, favors, invitations). Cutting 50 guests saves $7,500-$15,000. Keep it intimate—you'll actually talk to everyone and create deeper memories.

**4. DIY Smartly (Not Everything)**
Skip DIY for: catering, photography, and venue setup (too stressful)
DO DIY: invitations, favors, centerpieces, welcome signs, playlist curation
Save: $2,000-$4,000

**5. Hire Emerging Talent**
Book photographers/videographers with <3 years experience (review portfolios carefully). They're hungry for work, cost 50% less, and often deliver stunning results. Save: $2,000-$4,000.

**6. Simplify Florals**
Use greenery-heavy arrangements, seasonal flowers, and potted plants guests can take home. Skip elaborate arbors and aisle flowers. Or go non-floral with candles, lanterns, or fabric draping. Save: $1,500-$3,000.

**7. Buffet > Plated Dinner (Save $20-40/person)**
Buffets need less staff, offer more variety, and cost significantly less. Or do family-style service for a warm, communal feel at buffet pricing. On 150 guests, save: $3,000-$6,000.

**8. Limit Bar Options**
Open bar with beer, wine, and 2-3 signature cocktails costs 30-50% less than full liquor service. Or do beer/wine only. Most guests won't notice. Save: $1,500-$3,000.

**9. Digital Invitations for Some Guests**
Send paper invites to older relatives and VIPs. Use digital (Paperless Post, Greenvelope) for younger guests who prefer it anyway. Save: $500-$1,200.

**10. Use Venue's Existing Decor**
Choose venues with beautiful built-in features (gardens, historic buildings, art galleries). You'll need minimal additional decoration. Save: $1,500-$3,000.

**Total Potential Savings: $20,000-$45,000**

Remember: Guests remember the atmosphere, not the centerpiece details. Invest in great food, music, and photography—skimp on everything else.

Track your budget with Vivaha's smart tracker—it shows exactly where your money goes and suggests where to cut without sacrificing guest experience.`,
    photoUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
    location: "United States",
    tags: ["BudgetWedding", "WeddingSavings", "SmartPlanning", "WeddingTips"],
    likes: 298,
    likedBy: [],
    comments: [
      {
        userName: "Jessica M.",
        content: "The off-season tip saved us $8,000! We did a March wedding and had our dream venue at 40% off.",
        createdAt: new Date('2026-01-20')
      },
      {
        userName: "Mike & Laura",
        content: "Cutting the guest list was hard but necessary. We went from 200 to 120 and honestly, the smaller wedding felt so much more intimate and special.",
        createdAt: new Date('2026-01-22')
      },
      {
        userName: "Priya S.",
        content: "The emerging photographer tip is brilliant! We found an amazing photographer in her 2nd year and paid $1,800 instead of $4,500. Photos are stunning.",
        createdAt: new Date('2026-01-25')
      }
    ]
  },

  // REAL WEDDING 1: Priya & Michael's Hindu-Christian Fusion
  {
    userName: "Priya & Michael",
    postType: "photo",
    category: "wedding-rave",
    content: `**Our Hindu-Christian Fusion Wedding in San Francisco**

After 18 months of planning, we finally celebrated our two-day fusion wedding last month, and it exceeded every expectation.

**Day 1: Hindu Ceremonies**
We started with a traditional Mehndi party at my parents' home in Sunnyvale. 60 guests, Bollywood music, henna artists, and my grandmother teaching Michael's mom how to drape a saree. The joy in that room was indescribable.

The next morning, we held the Baraat (Michael rode a white horse!) followed by the full Hindu ceremony under a mandap at the Santa Clara Convention Center. Our pandit was incredibly patient explaining each ritual in English for Michael's family. The saptapadi (seven steps) made everyone cry—even my usually stoic father.

**Day 2: Christian Ceremony**
Sunday morning, we had an intimate church ceremony at Mission Dolores Basilica. Michael's childhood priest officiated, and we incorporated readings from both the Bible and Bhagavad Gita. My parents lit a diya (oil lamp) during the ceremony as a symbolic blessing.

The reception was at City View at Metreon with 180 guests. We had both Indian food (biryani, paneer, samosas) and American comfort food (steak, salmon). First dance to "Tum Hi Ho" followed by father-daughter dance to "My Girl."

**What Worked**:
- Hiring a day-of coordinator who understood both cultures
- Creating a detailed ceremony program explaining every ritual
- Vivaha app for tracking everything (lifesaver!)
- Having two outfit changes: lehenga + saree for Day 1, white wedding dress for Day 2
- Assigning cultural ambassadors to help guests feel comfortable

**What We'd Change**:
- Wish we'd done a full rehearsal for the Hindu ceremony—timing was off
- Should've hired a second photographer for Mehndi party
- Underestimated how exhausting two full days would be

**Budget Breakdown (Total: $52,000)**:
- Venues (both days): $8,500
- Catering: $14,200
- Photography/Video: $6,500
- Decor/Florals: $7,800
- Outfits: $4,200
- DJ/Music: $3,200
- Mehndi artists + Pandit: $1,800
- Invitations/Printing: $1,200
- Other: $4,600

**Words of Wisdom**:
Don't try to please everyone. Some people will think it's "too much," others "not traditional enough." We focused on creating a celebration that felt authentic to US—and it was magical. The moments when our families truly connected (during the Baraat, dancing at the reception) made all the stress worth it.

Michael's grandmother told me: "I didn't understand most of the Hindu ceremony, but I understood the love." That's what matters.

Planning your own interfaith wedding? Happy to answer questions—drop a comment!

📸 Photos by Aperture Films & Photography
📍 San Francisco Bay Area
🎵 DJ Prashant Entertainment`,
    photoUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80",
    location: "San Francisco, CA",
    tags: ["HinduChristianWedding", "BayAreaWedding", "InterfaithLove", "FusionWedding", "RealWedding"],
    likes: 567,
    likedBy: [],
    comments: [
      {
        userName: "Sarah & Raj",
        content: "This is EXACTLY the wedding we're trying to plan! The two-day format is genius. Did guests stay for both days?",
        createdAt: new Date('2026-01-28')
      }
    ]
  },

  // REAL WEDDING 2: Aisha & David's Muslim-Jewish Wedding
  {
    userName: "Aisha & David",
    postType: "photo",
    category: "wedding-rave",
    content: `**How We Blended Muslim & Jewish Traditions in Our Brooklyn Wedding**

When David proposed, we knew we wanted a wedding that honored both our faiths—but had no idea how to actually do it. After months of research and MANY family discussions, we pulled off a one-day fusion ceremony that both families loved.

**The Ceremony (90 minutes)**
We held everything at The Wythe Hotel in Williamsburg, Brooklyn. Our interfaith officiant (Rabbi Sarah Levin, who's certified in Muslim marriage ceremonies) co-officiated with my family's imam.

**Reception Details**:
- 140 guests
- Kosher + Halal catering (Mazal Tov Kosher Catering nailed it!)
- No alcohol (respected both our families' preferences)
- Mix of Arabic and Jewish music (our DJ was incredible)
- Dancing: Hora + Dabke (everyone loved learning both!)

**Budget: $48,000 (NYC prices)**

**The Most Beautiful Moments**:
- When David's grandmother and my grandmother hugged and cried during the ceremony
- Watching my father and David's father lead the Hora together
- Our parents giving joint speeches about unity and love

To couples planning interfaith weddings: Be patient with your families. They come from a place of love, even when they don't understand. Education and inclusion go a long way.

📸 Photography by Lara Khalil Photography
📍 Wythe Hotel, Brooklyn, NY`,
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    location: "Brooklyn, NY",
    tags: ["MuslimJewishWedding", "InterfaithCeremony", "NYCWedding", "CulturalFusion", "RealWedding"],
    likes: 823,
    likedBy: [],
    comments: []
  }
];

async function seedPosts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');

    // Clear existing posts from Vivaha Team
    await Post.deleteMany({ userName: { $in: ['Vivaha Team', 'Priya & Michael', 'Aisha & David'] } });
    console.log('🗑️  Cleared existing seed posts');

    // Insert new posts
    const result = await Post.insertMany(samplePosts);
    console.log(`✅ Inserted ${result.length} posts successfully`);

    console.log('\n📝 Posts created:');
    result.forEach(post => {
      console.log(`   - ${post.userName}: ${post.content.substring(0, 60)}...`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    process.exit(1);
  }
}

seedPosts();
