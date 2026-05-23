import express from 'express';
import { protect } from '../middleware/auth.js';
import Project from '../models/Project.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
router.use(protect);

const defaultFiles = () => [
  { id: uuidv4(), name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html>\n<head><title>My App</title></head>\n<body>\n  <h1>Hello World</h1>\n  <script src="index.js"></script>\n</body>\n</html>', parentId: null, language: 'html' },
  { id: uuidv4(), name: 'index.js',  type: 'file', content: 'console.log("Hello from sandbox!");', parentId: null, language: 'javascript' },
  { id: uuidv4(), name: 'style.css', type: 'file', content: 'body { font-family: sans-serif; padding: 2rem; }', parentId: null, language: 'css' },
];

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.user.id }).sort('-updatedAt');
  res.json(projects);
});

router.post('/', async (req, res) => {
  try {
    const files = defaultFiles();
    const project = await Project.create({
      name: req.body.name || 'Untitled Project',
      owner: req.user.id,
      files,
      activeFileId: files[0].id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json(project);
});

router.delete('/:id', async (req, res) => {
  await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  res.json({ message: 'Deleted' });
});

export default router;
