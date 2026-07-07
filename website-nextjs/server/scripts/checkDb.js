import mongoose from "mongoose";
import env from "../src/config/env.js";
import Property from "../src/modules/property/property.model.js";
import SavedProperty from "../src/modules/property/savedProperty.model.js";

async function main() {
  try {
    console.log("Connecting to:", env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected successfully!");

    const propertiesCount = await Property.countDocuments();
    const savedCount = await SavedProperty.countDocuments();
    console.log("Total properties in DB:", propertiesCount);
    console.log("Total saved properties in DB:", savedCount);

    const savedList = await SavedProperty.find().limit(5);
    console.log("Sample saved properties:", savedList);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
