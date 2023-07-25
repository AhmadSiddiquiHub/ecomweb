const mongoose = require("mongoose");

const connectDB = async () => {
  const db = await mongoose.connect(process.env.MONGO_URL);

  if (db) {
    console.log("Database Connected Successfully!".bgBlue.white);
  } else {
    console.log("Database Connection Failed!".bgRed.white);
  }
};

module.exports = connectDB;
