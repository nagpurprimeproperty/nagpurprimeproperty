const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://akashtikhat50_db_user:K6ehVtNzFN4NaVwu@cluster0.gzujoaq.mongodb.net/production?appName=Cluster0';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // Register models
    require('./server/src/modules/property/property.model.js');
    require('./server/src/modules/lead/leads.model.js');

    const Property = mongoose.model('Property');
    const Lead = mongoose.model('Lead');

    console.log('\n--- Property Model propertyType Enum ---');
    console.log(Property.schema.path('propertyType').enumValues);

    console.log('\n--- Lead Model propertyType Enum ---');
    console.log(Lead.schema.path('propertyType').enumValues);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();


