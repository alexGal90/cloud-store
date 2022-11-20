import { Schema, model, Types } from 'mongoose';

// Alow user to store 20Gb of files
const User = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullDiskSpace: { type: Number, default: 1024 ** 3 * 20 },
  emptySpace: { type: Number, default: 1024 ** 3 * 20 },
  files: [{ type: Types.ObjectId, ref: 'File' }],
});

export default model('User', User);
