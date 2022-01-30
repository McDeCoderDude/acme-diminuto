import express from 'express';
import { json } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors'
import dotenv from 'dotenv';
import connection from './config/db.config';
import { diminutoRouter } from './routes/diminuto';
import { redirectRouter } from './routes/redirect';
import {debug} from "util";

dotenv.config();

// Database Configuration
connection.once('open', () => {
  console.log('Connected to database');
});

connection.on('error', (err: string) => {
  console.log('Database error: ' + err);
});

const app = express();

app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(helmet());
app.use(diminutoRouter)
app.use(redirectRouter)

const PORT = process.env.NODE_DOCKER_PORT || 3000;

app.get('/', (req, res) =>
    res.send('Express + TypeScript Server'));

const server = app.listen(PORT, () => console.log(`⚡[server]: Sever is running http://localhost:${PORT}`));

process.on('SIGTERM', () => {
  debug('SIGTERM signal received: closing http server');
  server.close(() => {
    debug('Http server closed');
  });
});
