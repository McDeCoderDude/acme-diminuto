import mongoose, { Schema } from "mongoose";

interface DiminutoUrlModel extends mongoose.Document {
    longUrl: string,
    urlCode: string,
    shortUrl: string,
    createdAt: Date,
    updatedAt: Date
}

const diminutoUrlSchema = new Schema<DiminutoUrlModel>({
    longUrl: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2048,
        index: true
    },
    urlCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 4,
        maxlength: 32,
        index: true
    },
    shortUrl: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2083
    }
}, {
    timestamps: true
});

export default mongoose.model("DiminutoUrlModel", diminutoUrlSchema);
