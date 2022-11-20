import { model, Schema, Types } from 'mongoose';

// This model is used both for files and folders
const File = new Schema({
  name: { type: String, required: true },
  extension: { type: String, required: true },
  size: { type: Number, default: 0 },
  path: { type: String, default: '' },
  user: { type: Types.ObjectId, ref: 'User' },
  parentFoldery: { type: Types.ObjectId, ref: 'File' },
  children: [{ type: Types.ObjectId, ref: 'File' }],
});

export default model('File', File);
