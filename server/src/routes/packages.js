import express from 'express';
import { protect } from '../middleware/auth.js';
import Project from '../models/Project.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);
const router = express.Router();
router.use(protect);

router.post('/:projectId/install', async (req, res) => {
  const { packageName } = req.body;
  if (!packageName || !/^[@a-z0-9/_.-]+$/i.test(packageName))
    return res.status(400).json({ message: 'Invalid package name' });

  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tmpDir = path.join(os.tmpdir(), `sandbox-${project._id}`);
    await fs.mkdir(tmpDir, { recursive: true });

    const pkgJsonPath = path.join(tmpDir, 'package.json');
    try { await fs.access(pkgJsonPath); } catch {
      await fs.writeFile(pkgJsonPath, JSON.stringify({ name: 'sandbox', version: '1.0.0' }));
    }

    await execAsync(`npm install ${packageName} --prefix ${tmpDir} --save`, { timeout: 60000 });

    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
    const version = pkgJson.dependencies?.[packageName] || 'latest';

    const existing = project.packages.find(p => p.name === packageName);
    if (existing) existing.version = version;
    else project.packages.push({ name: packageName, version });
    await project.save();

    res.json({ name: packageName, version, packages: project.packages });
  } catch (err) {
    res.status(500).json({ message: `Install failed: ${err.message}` });
  }
});

router.delete('/:projectId/:packageName', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.packages = project.packages.filter(p => p.name !== req.params.packageName);
    await project.save();
    res.json({ packages: project.packages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
