import mongoose from "mongoose";

const DB_URI = "mongodb://diminutouser:diminutouser@localhost:27017/acme-diminuto-db";

mongoose.Promise = global.Promise;
mongoose.connect(DB_URI,{
    connectTimeoutMS: 5000,
    keepAlive: true,
    maxPoolSize: 10,
},(err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});

export default mongoose.connection;
