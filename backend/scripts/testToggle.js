import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/user/user.model.js";
import Property from "../src/modules/property/property.model.js";
import savedPropertyService from "../src/modules/property/savedProperty.service.js";
import SavedProperty from "../src/modules/property/savedProperty.model.js";
import propertyRepository from "../src/modules/property/property.repository.js";

async function main() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear old test data
    await User.deleteMany({ email: "testuser@gmail.com" });
    await SavedProperty.deleteMany({});
    await Property.deleteMany({ title: "Test Property" });

    // 1. Create a dummy user
    const user = await User.create({
      name: "Test User",
      email: "testuser@gmail.com",
      mobile: "1234567890",
      password: "TestPassword123"
    });
    console.log("Created user:", user._id);

    // 2. Create a dummy property
    const property = await Property.create({
      title: "Test Property",
      description: "Test description long enough to satisfy constraints.",
      listingCategory: "New",
      propertyType: "Flat/Apartment",
      location: {
        locality: "Dighori",
        coordinates: { type: "Point", coordinates: [79.0882, 21.1458] }
      },
      pricing: { totalPrice: 5000000 },
      details: { bhk: 3, carpetArea: 1200 },
      photos: ["https://example.com/photo.jpg"],
      brokerId: user._id
    });
    console.log("Created property:", property._id);

    // 3. Toggle Save - FIRST time (should save)
    console.log("Toggling save (1st time)...");
    const res1 = await savedPropertyService.savePropertyToggle(user._id.toString(), property._id.toString());
    console.log("Res 1:", res1);

    // Verify record in DB
    const count1 = await SavedProperty.countDocuments({ userId: user._id, propertyId: property._id });
    console.log("Saved property count in DB (should be 1):", count1);

    // Find with propertyRepository.findById
    const propDetails1 = await propertyRepository.findById(property._id.toString(), user._id.toString());
    console.log("Is saved in findById (should be true):", propDetails1.isSaved);

    // 4. Toggle Save - SECOND time (should unsave)
    console.log("Toggling save (2nd time)...");
    const res2 = await savedPropertyService.savePropertyToggle(user._id.toString(), property._id.toString());
    console.log("Res 2:", res2);

    // Verify record in DB
    const count2 = await SavedProperty.countDocuments({ userId: user._id, propertyId: property._id });
    console.log("Saved property count in DB (should be 0):", count2);

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
