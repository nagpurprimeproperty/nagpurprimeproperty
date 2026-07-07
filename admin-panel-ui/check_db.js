const mongoose = require('mongoose');

// Use the EXACT same URI as .env.local (includes /production database)
const MONGO_URI = 'mongodb+srv://akashtikhat50_db_user:K6ehVtNzFN4NaVwu@cluster0.gzujoaq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB (production database)...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;

    // ── Check blogs ──────────────────────────────────────────────────────────
    const allBlogs = await db.collection('blogs').find({}).toArray();
    const publishedBlogs = allBlogs.filter(b => b.isPublished === true);
    console.log('📰 BLOGS:');
    console.log(`   Total in collection:    ${allBlogs.length}`);
    console.log(`   With isPublished=true:  ${publishedBlogs.length}`);
    allBlogs.forEach(b =>
      console.log(`   - "${b.title}" | slug=${b.slug} | isPublished=${b.isPublished}`)
    );

    // ── Check areas ──────────────────────────────────────────────────────────
    const allAreas = await db.collection('areas').find({}).toArray();
    const publishedAreas = allAreas.filter(a => a.isPublished === true);
    console.log('\n🏙️  AREAS:');
    console.log(`   Total in collection:    ${allAreas.length}`);
    console.log(`   With isPublished=true:  ${publishedAreas.length}`);
    allAreas.forEach(a =>
      console.log(`   - "${a.name}" | slug=${a.slug} | isPublished=${a.isPublished}`)
    );

    // ── If empty, insert test data so the website shows something ────────────
    if (allBlogs.length === 0) {
      console.log('\n⚠️  No blogs found — inserting a test blog...');
      await db.collection('blogs').insertOne({
        slug: 'nagpur-property-investment-guide-2025',
        title: 'Nagpur Property Investment Guide 2025',
        excerpt: 'Everything you need to know about investing in Nagpur real estate in 2025.',
        cover: '',
        author: 'Nagpur Prime Property',
        authorImage: '',
        date: new Date(),
        readMins: 5,
        tags: ['Investment', 'Nagpur', 'Guide'],
        content: [
          {
            heading: 'Why Invest in Nagpur?',
            body: 'Nagpur is one of the fastest-growing cities in Maharashtra with excellent infrastructure, the MIHAN SEZ, and rapid urbanisation making it ideal for property investment.'
          },
          {
            heading: 'Top Areas to Consider',
            body: 'Wardha Road, MIHAN, Dighori, and Hingna are among the hottest investment corridors. Each offers a unique mix of affordability and appreciation potential.'
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('   ✅ Test blog inserted');
    }

    if (allAreas.length === 0) {
      console.log('\n⚠️  No areas found — inserting a test area...');
      await db.collection('areas').insertOne({
        slug: 'wardha-road-nagpur',
        name: 'Wardha Road',
        city: 'Nagpur',
        banner: '',
        startingPrice: '₹35L',
        description: 'Wardha Road is one of Nagpur\'s most sought-after real estate corridors, connecting the city to MIHAN and offering excellent connectivity.',
        metaTitle: 'Wardha Road Properties | Nagpur Prime Property',
        metaDescription: 'Find flats, plots and villas on Wardha Road, Nagpur. Explore locality guide, pricing and connectivity.',
        connectivity: 'Well connected via NH-44, 15 km from Nagpur Airport (MIHAN), close to Dr. Ambedkar International Airport.',
        schools: ['Nagpur Public School', 'DPS Nagpur', 'Somalwar School'],
        hospitals: ['AIIMS Nagpur', 'Wockhardt Hospital', 'Care Hospital'],
        investment: 'Property values on Wardha Road have appreciated 18% YoY owing to MIHAN proximity and metro rail development.',
        faqs: [
          { question: 'Is Wardha Road good for investment?', answer: 'Yes, Wardha Road offers excellent appreciation potential due to its proximity to MIHAN SEZ and rapid infrastructure development.' }
        ],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('   ✅ Test area inserted');
    }

    // ── Final count ──────────────────────────────────────────────────────────
    const finalBlogs = await db.collection('blogs').countDocuments({ isPublished: true });
    const finalAreas = await db.collection('areas').countDocuments({ isPublished: true });
    console.log(`\n📊 Final counts (isPublished=true):`);
    console.log(`   Blogs: ${finalBlogs}`);
    console.log(`   Areas: ${finalAreas}`);
    console.log('\n✅ Now visit:');
    console.log('   http://localhost:3000/blogs  → should show blogs');
    console.log('   http://localhost:3000/areas  → should show areas');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
