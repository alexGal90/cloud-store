import { Schema, model, Types } from 'mongoose';

const User = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  fullDiskSpace: { type: Number, default: 1024 ** 3 * 10 },
  emptySpace: { type: Number, default: 1024 ** 3 * 10 },
  files: [{ type: Types.ObjectId, ref: 'File' }],
});

export default model('User', User);
