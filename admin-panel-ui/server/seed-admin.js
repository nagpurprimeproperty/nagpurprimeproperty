import mongoose from 'mongoose';
import Admin from './src/models/admin.model.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not defined.');
  process.exit(1);
}

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully to MongoDB.');

    // CLI Arguments: email, password, phone, firstName, lastName
    const email = process.argv[2] || 'admin@nagpurprimeproperty.com';
    const password = process.argv[3] || 'NagpurAdmin123!';
    const phone = process.argv[4] || '+919011111504';
    const firstName = process.argv[5] || 'Super';
    const lastName = process.argv[6] || 'Admin';

    if (password.length < 8) {
      console.error('ERROR: Password must be at least 8 characters long.');
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email "${email}" already exists. Updating password...`);
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log(`Creating new admin user: ${firstName} ${lastName} (${email})...`);
      const newAdmin = new Admin({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: 'admin',
        isActive: true
      });
      await newAdmin.save();
      console.log('Admin user seeded successfully!');
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
