import express from 'express';
import mongoose from 'mongoose';

// This import is required to use env variables
import {} from 'dotenv/config';
import fileUpload from 'express-fileupload';

import corsMiddleware from './middleware/corsMiddleware.js';
import authRouter from './routes/authRouter.js';
import fileRouter from './routes/fileRouter.js';

const app = express();
const PORT = process.env.PORT;

app.use(corsMiddleware);

// It's requred to read json format
app.use(express.json());
app.use(fileUpload({}));
app.use('/auth', authRouter);
app.use('/file', fileRouter);

const start = async () => {
  try {
    // Connection to local mondoDB server.
    // Use process.env.MONGO_DB_CONNECT_URL_CLOUD to connect
    // to cloud mongoDB server
    mongoose.connect(process.env.MONGO_DB_CONNECT_URL_LOCAL).then(() => {
      console.log('MongoDB is connected');
    });

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.warn(error);
  }
};

start();
