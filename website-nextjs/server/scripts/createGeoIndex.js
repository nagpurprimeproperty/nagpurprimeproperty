/**
 * Script to create the 2dsphere geospatial index on properties collection
 * This is required for $nearSphere queries to work on location data
 * 
 * Run with: npm run create-geo-index
 * or: node scripts/createGeoIndex.js
 */
import mongoose from 'mongoose';
import env from '../src/config/env.js';

async function createGeoIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('properties');

    console.log('\n📍 Creating 2dsphere index on location.coordinates...');
    const result = await collection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { background: true, name: 'location_coordinates_2dsphere' }
    );
    console.log(`✅ 2dsphere index created: ${result}`);

    console.log('\n📋 All indexes on properties collection:');
    const indexes = await collection.getIndexes();
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`  • ${name}:`, spec);
    });

    console.log('\n✅ Geo index creation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

createGeoIndex();
