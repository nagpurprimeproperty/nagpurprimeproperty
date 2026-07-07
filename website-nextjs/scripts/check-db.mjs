// Quick MongoDB diagnostic — run with: node scripts/check-db.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  env[key] = value;
}

const MONGO_URI = env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');
console.log('   URI (masked):', MONGO_URI.replace(/:([^@]+)@/, ':***@'));

await mongoose.connect(MONGO_URI);
console.log('✅ Connected!\n');

// Check blogs collection
const blogColl = mongoose.connection.db.collection('blogs');
const allBlogs = await blogColl.find({}).toArray();
const publishedBlogs = allBlogs.filter(b => b.isPublished === true);
console.log('📰 Blogs:');
console.log(`   Total in DB:     ${allBlogs.length}`);
console.log(`   isPublished=true: ${publishedBlogs.length}`);
if (allBlogs.length > 0) {
  allBlogs.forEach(b => console.log(`   - "${b.title}" | published=${b.isPublished} | slug=${b.slug}`));
}

// Check areas collection
const areaColl = mongoose.connection.db.collection('areas');
const allAreas = await areaColl.find({}).toArray();
const publishedAreas = allAreas.filter(a => a.isPublished === true);
console.log('\n🏙️  Areas:');
console.log(`   Total in DB:      ${allAreas.length}`);
console.log(`   isPublished=true:  ${publishedAreas.length}`);
if (allAreas.length > 0) {
  allAreas.forEach(a => console.log(`   - "${a.name}" | published=${a.isPublished} | slug=${a.slug}`));
}

// If empty, insert test data
if (allBlogs.length === 0 && allAreas.length === 0) {
  console.log('\n⚠️  Database is completely empty! Inserting test data...');
  
  await blogColl.insertOne({
    slug: 'test-blog-post',
    title: 'Test Blog Post — Nagpur Property Guide',
    excerpt: 'This is a test blog post to verify the database connection.',
    cover: '',
    author: 'Admin',
    authorImage: '',
    date: new Date(),
    readMins: 3,
    tags: ['Test', 'Nagpur'],
    content: [{ heading: 'Introduction', body: 'This is a test blog post. If you see this on the website, the database connection is working correctly.' }],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  await areaColl.insertOne({
    slug: 'test-area-nagpur',
    name: 'Test Area',
    city: 'Nagpur',
    banner: '',
    startingPrice: '₹30L',
    description: 'This is a test area to verify the database connection.',
    metaTitle: 'Test Area | Nagpur Prime Property',
    metaDescription: 'Test area description.',
    connectivity: '',
    schools: ['Test School'],
    hospitals: ['Test Hospital'],
    investment: '',
    faqs: [],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Test blog and area inserted with isPublished=true');
  console.log('   Now visit http://localhost:3000/blogs and http://localhost:3000/areas to verify');
}

await mongoose.disconnect();
console.log('\n🔌 Disconnected. Done!');
