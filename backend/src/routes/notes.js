const express = require('express');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/notes/:animalId
router.get('/:animalId', authenticateToken, async (req, res) => {
  const { animalId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, animal_id, note, created_at, updated_at
       FROM animal_notes
       WHERE animal_id = $1
       ORDER BY created_at DESC`,
      [animalId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes/:animalId
router.post('/:animalId', authenticateToken, async (req, res) => {
  const { animalId } = req.params;
  const { note } = req.body;

  if (!note || note.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  try {
    const animalCheck = await pool.query('SELECT id FROM animals WHERE id = $1', [animalId]);
    if (animalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const result = await pool.query(
      `INSERT INTO animal_notes (animal_id, note)
       VALUES ($1, $2)
       RETURNING id, animal_id, note, created_at, updated_at`,
      [animalId, note.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PATCH /api/notes/entry/:id
router.patch('/entry/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || note.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE animal_notes
       SET note = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, animal_id, note, created_at, updated_at`,
      [note.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/entry/:id
router.delete('/entry/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM animal_notes WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
