import mongoose, { Schema } from "mongoose";

interface DiminutoUrlModel extends mongoose.Document {
    originalUrl: string,
    urlCode: string,
    shortUrl: string,
    createdAt: Date,
    updatedAt: Date
}

const diminutoUrlSchema = new Schema<DiminutoUrlModel>({
    originalUrl: String,
    urlCode: String,
    shortUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("DiminutoUrlModel", diminutoUrlSchema);
