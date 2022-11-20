import Router from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import File from '../models/File.js';
import authMiddleware from '../middleware/authMiddleware.js';
import fileService from '../services/fileService.js';

const authRouter = new Router();

authRouter.post(
  '/registration',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Password must have the length from 8 to 256').isLength({ min: 8, max: 256 }),
  ],
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect request params', validationErrors });
      }

      const { email, password } = req.body;

      const newUser = await User.findOne({ email });

      if (newUser) {
        return res.status(400).json({ message: `User with email ${email} is already existed` });
      }

      // Hash the password to make it secure
      const safePassword = await bcrypt.hash(password, 5);
      const user = new User({ email, password: safePassword });
      await user.save();

      // Create an empty directory with the name equal user id
      await fileService.createDirectory(new File({ user: user.id, name: '' }));
      return res.json({ message: `User with email ${email} was successfully created` });
    } catch (error) {
      console.warn(error);
      res.send({ message: 'Server error' });
    }
  }
);

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id, email: userEmail, password: userPassword, name, fullDiskSpace, emptySpace } = user;

    const isPasswordValid = bcrypt.compareSync(password, userPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRED_TIME,
    });

    return res.json({
      token,
      userInfo: {
        id,
        email: userEmail,
        name,
        fullDiskSpace,
        emptySpace,
      },
    });
  } catch (error) {
    console.warn(error);
    res.send({ message: 'Server error' });
  }
});

authRouter.get('/auth', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const { id, email, name, fullDiskSpace, emptySpace } = user;

    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRED_TIME,
    });

    return res.json({
      token,
      userInfo: {
        id,
        email,
        name,
        fullDiskSpace,
        emptySpace,
      },
    });
  } catch (error) {
    console.warn(error);
    res.send({ message: 'Server error' });
  }
});

export default authRouter;
