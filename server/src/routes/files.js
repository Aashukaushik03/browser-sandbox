import express from 'express';
import { protect } from '../middleware/auth.js';
import Project from '../models/Project.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
router.use(protect);

router.post('/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { name, type = 'file', parentId = null, language = 'javascript' } = req.body;
    const file = { id: uuidv4(), name, type, content: '', parentId, language };
    project.files.push(file);
    await project.save();
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:projectId/:fileId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const file = project.files.find(f => f.id === req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    const { content, name, activeFileId } = req.body;
    if (content !== undefined) file.content = content;
    if (name !== undefined) file.name = name;
    if (activeFileId !== undefined) project.activeFileId = activeFileId;
    await project.save();
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:projectId/:fileId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.files = project.files.filter(f => f.id !== req.params.fileId && f.parentId !== req.params.fileId);
    await project.save();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
