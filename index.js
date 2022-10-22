import express from 'express';
import mongoose from 'mongoose';
import {} from 'dotenv/config';

import corsMiddleware from './middleware/cors.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT;

app.use(corsMiddleware);
app.use(express.json());
app.use('/auth', authRouter);

const start = async () => {
  try {
    mongoose.connect(process.env.MONGO_DB_CONNECT_URL);

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {}
};

start();
