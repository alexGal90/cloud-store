import { check } from 'express-validator';

export const authValidation = [
  check('email', 'Invalid email').isEmail(),
  check('password', 'Password must have the length from 8 to 256').isLength({ min: 8, max: 256 }),
];
