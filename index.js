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
    // // Connection to cloud mondoDB server
    // mongoose.connect(process.env.MONGO_DB_CONNECT_URL_CLOUD).then(() => {
    //   console.log('Cloud mongodb connected');
    // });

    // Connection to locak mondoDB server
    mongoose.connect(process.env.MONGO_DB_CONNECT_URL_LOCAL).then(() => {
      console.log('Local mongodb connected');
    });

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {}
};

start();
