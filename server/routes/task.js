const express = require('express');
const router = express.Router();
const Software = require('../models/Software');
const Task = require('../models/Task');
const Allegato = require('../models/Allegato');

// GET /api - Recupera tutti i task
router.get('/', async (req, res) => {
  try {
    const task = await Task.getAll();
    res.json(task);
  } catch (error) {
    console.error('Errore nel recupero task:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/task/:id - Recupera un task specifico
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task non trovato' });
    }
    res.json(task);
  } catch (error) {
    console.error('Errore nel recupero task:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/task - Crea un nuovo task
router.post('/', async (req, res) => {
  try {
    const { codiceTask, descrizione, dataSegnalazione, dataScadenza, stato, software, utente, clienti, priorità, commenti, createdBy } = req.body;

    if (!codiceTask) {
      return res.status(400).json({ error: 'Codice Task è obbligatorio' });
    }

    const nuovoTask = await Task.create({
      codiceTask,
      descrizione: descrizione || null,
      dataSegnalazione: dataSegnalazione || null,
      dataScadenza: dataScadenza || null,
      stato: stato || null,
      software: software || null,
      utente: utente || null,
      clienti: clienti || null,
      priorità: priorità || null,
      commenti: commenti || null,
      createdBy: createdBy || null,
    });

    res.status(201).json(nuovoTask);
  } catch (error) {
    console.error('Errore nella creazione task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/task/:id - Aggiorna un task
router.put('/:id', async (req, res) => {
  try {
    const { codiceTask, descrizione, dataSegnalazione, dataScadenza, stato, software, utente, clienti, priorità, logo, commenti } = req.body;

    if (!codiceTask) {
      return res.status(400).json({ error: 'Codice Task è obbligatorio' });
    }

    const taskAggiornato = await Task.update(req.params.id, {
      codiceTask,
      descrizione: descrizione || null,
      dataSegnalazione: dataSegnalazione || null,
      dataScadenza: dataScadenza || null,
      stato: stato || null,
      software: software || null,
      utente: utente || null,
      clienti: clienti || null,
      priorità: priorità || null,
      logo: logo || null,
      commenti: commenti || null,
    });

    if (!taskAggiornato) {
      return res.status(404).json({ error: 'Task non trovato' });
    }

    res.json(taskAggiornato);
  } catch (error) {
    console.error('Errore nell\'aggiornamento task:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/task/:id - Elimina un task  
router.delete('/:id', async (req, res) => {
  try {
    await Task.delete(req.params.id);
    res.json({ message: 'Task eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione task:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/task/:id/allegati - Recupera allegati per un task
router.get('/:id/allegati', async (req, res) => {
  try {
    const allegati = await Allegato.getByTaskId(req.params.id);
    res.json(allegati);
  } catch (error) {
    console.error('Errore nel recupero allegati:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;