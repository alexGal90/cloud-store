import express from 'express';
import mongoose from 'mongoose';
import {} from 'dotenv/config';
import fileUpload from 'express-fileupload';

import corsMiddleware from './middleware/corsMiddleware.js';
import authRouter from './routes/authRouter.js';
import fileRouter from './routes/fileRouter.js';

const app = express();
const PORT = process.env.PORT;

app.use(corsMiddleware);
app.use(express.json());
app.use(fileUpload({}));
app.use('/auth', authRouter);
app.use('/file', fileRouter);

const start = async () => {
  try {
    mongoose.connect(process.env.MONGO_DB_CONNECT_URL);

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {}
};

start();
