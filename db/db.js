import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
const connectDB = async () => {
  const URI = process.env.DB_URI;
  try {
    await mongoose.connect(URI);
    console.log(` Sucessfully connected to MongoDB `);
  } catch (error) {
    console.log(`Something went wrong :  ${error}`);
  }
};

export default connectDB;
