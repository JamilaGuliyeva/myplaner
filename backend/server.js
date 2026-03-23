const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

// Middleware (Qapıçı və Dilmanc)
app.use(cors());
app.use(express.json());

// 1. Günlük Tapşırıqlar (Səhifə açılan kimi bura müraciət edir)
app.get('/tasks', async (req, res) => {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    try {
        // Həmin tarix üçün tapşırıq varmı?
        const check = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [targetDate]);
        
        if (check.rows.length === 0) {
            // Əgər yoxdursa, şablon (routine) tapşırıqları götür və əlavə et
            const routines = await pool.query("SELECT title FROM routine_templates");
            
            for (let r of routines.rows) {
                await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2)", [r.title, targetDate]);
            }
            
            // Yeni əlavə olunanları geri qaytar
            const fresh = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [targetDate]);
            return res.json(fresh.rows);
        }
        
        res.json(check.rows);
    } catch (err) { 
        console.error("XƏTA (GET /tasks):", err.message);
        res.status(500).json({ error: "Server xətası baş verdi" }); 
    }
});

// 2. Status Yeniləmə (✅, ⏳, ❌)
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, id]);
        res.json("OK");
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// 3. Özəl İş Əlavə Etmə (Düyməyə basanda bura işləyir)
app.post('/tasks', async (req, res) => {
    const { title, date } = req.body;
    try {
        const result = await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2) RETURNING *", [title, date]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// 4. Analitika Hesabatı
app.get('/full-report', async (req, res) => {
    try {
        const weekly = await pool.query("SELECT title FROM tasks WHERE status = 'done' AND task_date > CURRENT_DATE - INTERVAL '7 days'");
        const monthly = await pool.query("SELECT title FROM tasks WHERE status = 'done' AND task_date > CURRENT_DATE - INTERVAL '30 days'");
        const yearly = await pool.query("SELECT title FROM tasks WHERE status = 'done' AND task_date > CURRENT_DATE - INTERVAL '365 days'");
        
        res.json({ 
            weekly: weekly.rows.map(t => t.title), 
            monthly: monthly.rows.map(t => t.title),
            yearly: yearly.rows.map(t => t.title)
        });
    } catch (err) { 
        console.error("XƏTA (GET /full-report):", err.message);
        res.status(500).json({ weekly: [], monthly: [], yearly: [] }); 
    }
});

// Portu Render-in verdiyi portdan götürür, yoxdursa 5000 istifadə edir
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda aktivdir`));