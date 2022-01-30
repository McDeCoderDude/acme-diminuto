import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.Promise = global.Promise;

const DB_URI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOCKER_HOST}/${process.env.MONGODB_DATABASE}`;

mongoose.connect(DB_URI,{
    connectTimeoutMS: 5000,
    keepAlive: true,
    maxPoolSize: 10,
});

export default mongoose.connection;
