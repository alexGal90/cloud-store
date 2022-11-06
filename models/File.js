import { model, Schema, Types } from 'mongoose';

const File = new Schema({
  name: { type: String, required: true },
  extension: { type: String, required: true },
  size: { type: Number, default: 0 },
  path: { type: String, default: '' },
  accessLink: { type: String },
  user: { type: Types.ObjectId, ref: 'User' },
  parentFoldery: { type: Types.ObjectId, ref: 'File' },
  children: [{ type: Types.ObjectId, ref: 'File' }],
});

export default model('File', File);
