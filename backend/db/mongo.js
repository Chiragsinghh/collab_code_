const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://chiragsinghh:chirag%40singh@cluster0.svzbrgu.mongodb.net/?appName=Cluster0"
    );
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB; // 🔥 THIS FIXES EVERYTHING