import mongoose from "mongoose";
import { Agenda} from 'agenda';
import dotenv from "dotenv";

dotenv.config();

mongoose.Promise = global.Promise;

const DB_URI = `mongodb://${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`;
const DB_AGENDA_URI = `mongodb://${process.env.MONGODB_HOST}/${process.env.MONGODB_AGENDA_DATABASE}`;

mongoose.connect(DB_URI, {
    authSource: process.env.MONGODB_DATABASE,
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    keepAlive: true,
});

const agenda = new Agenda({
    db: {
        address: DB_AGENDA_URI,
        collection: 'agenda',
        options: {
            authSource: process.env.MONGODB_DATABASE,
            auth: {
                username: process.env.MONGODB_USER,
                password: process.env.MONGODB_PASSWORD,
            }
        },

    }
});

const connection = mongoose.connection;

export { connection, agenda };
