import Router from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

const router = new Router();

router.post(
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

      const safePassword = await bcrypt.hash(password, 5);
      const user = new User({ email, password: safePassword });
      await user.save();
      return res.json({ message: `User with email ${email} was successfully created` });
    } catch (error) {
      console.log(error);
      res.send({ message: 'Server error' });
    }
  }
);

router.post('/login', async (req, res) => {
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

    const token = jwt.sign({ id }, 'jwt-cloud-app-secret', { expiresIn: '24h' });
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
    console.log(error);
    res.send({ message: 'Server error' });
  }
});

export default router;
