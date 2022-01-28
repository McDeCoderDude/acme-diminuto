import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.Promise = global.Promise;
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/test";
mongoose.connect(DB_URI,{
    connectTimeoutMS: 5000,
    keepAlive: true,
    maxPoolSize: 10,
});

export default mongoose.connection;
