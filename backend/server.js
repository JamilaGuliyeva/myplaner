const cors = require('cors');
app.use(cors()); // Bütün müraciətlərə icazə veririk
e('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Günlük Tapşırıqlar və Avtomatik Rutinlər
app.get('/tasks', async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  try {
    const check = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [targetDate]);
    if (check.rows.length === 0) {
      const routines = await pool.query("SELECT title FROM routine_templates");
      for (let r of routines.rows) {
        await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2)", [r.title, targetDate]);
      }
      const fresh = await pool.query("SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC", [targetDate]);
      return res.json(fresh.rows);
    }
    res.json(check.rows);
  } catch (err) { res.status(500).json([]); }
});

// 2. Status Yeniləmə (✅, ⏳, ❌)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, id]);
  res.json("OK");
});

// 3. Özəl İş Əlavə Etmə
app.post('/tasks', async (req, res) => {
  const { title, date } = req.body;
  const result = await pool.query("INSERT INTO tasks (title, status, task_date) VALUES ($1, 'pending', $2) RETURNING *", [title, date]);
  res.json(result.rows[0]);
});

// 4. Həftəlik, Aylıq və İllik Hesabat (ADLARLA)
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
  } catch (err) { res.status(500).json(err.message); }
});

app.listen(5000, () => console.log("🚀 Server 5000-də aktivdir"));