import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../src/models/admin.model.js";  
import path from "path";


dotenv.config({ path: path.resolve(process.cwd(),  ".env.development") });

const seedAdmin = async () => {
  try {
    // 1. Connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // 3. Create admin
    const admin = await Admin.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@gmail.com",
      password: "Admin@123", // will be hashed automatically
      phone: "9876543210",
      role: "admin", // must match ADMIN_ROLLS_ENUM
      bio: "Default system admin"
    });

    console.log("Admin created successfully");
    console.log({
      email: admin.email,
      id: admin._id
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();