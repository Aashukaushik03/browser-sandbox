import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: { type: String, enum: ['file', 'folder'] },
  content: { type: String, default: '' },
  parentId: { type: String, default: null },
  language: { type: String, default: 'javascript' },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [fileSchema],
  packages: [{ name: String, version: String }],
  activeFileId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
