const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { isAdmin } = require('../middleware/auth');

// GET /api/task-logs - Ottieni tutti i log (solo admin)
router.get('/', isAdmin, async (req, res) => {
  try {
    const logs = await Task.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/task-logs/:codiceTask - Ottieni log per task specifico
router.get('/:codiceTask', async (req, res) => {
  try {
    const { codiceTask } = req.params;
    const logs = await Task.getLogs(codiceTask);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/task-logs/user/:utente - Ottieni log per utente
router.get('/user/:utente', async (req, res) => {
  try {
    const { utente } = req.params;
    const logs = await Task.getLogsByUser(utente);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;