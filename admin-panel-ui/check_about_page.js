const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://akashtikhat50_db_user:K6ehVtNzFN4NaVwu@cluster0.gzujoaq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    const page = await db.collection('staticpages').findOne({ slug: 'about-us' });
    console.log('--- ABOUT-US PAGE IN DB ---');
    console.log(page);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
