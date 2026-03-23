const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/tasks', async (req, res) => {
    const { date } = req.query;
    try {
        const check = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [date]);
        if (check.rows.length === 0) {
            const routines = await pool.query("SELECT title FROM routine_templates");
            for (let r of routines.rows) {
                await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2)", [r.title, date]);
            }
            const fresh = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [date]);
            return res.json(fresh.rows);
        }
        res.json(check.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks', async (req, res) => {
    const { title, date } = req.body;
    try {
        const result = await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2) RETURNING *", [title, date]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, id]);
        res.json("OK");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-da qaçır`));