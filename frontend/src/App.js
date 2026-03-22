import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fullReport, setFullReport] = useState({ weekly: [], monthly: [], yearly: [] });

  const loadData = async () => {
    const res = await fetch(`http://localhost:5000/tasks?date=${selectedDate}`);
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);

    const repRes = await fetch('http://localhost:5000/full-report');
    const repData = await repRes.json();
    setFullReport(repData);
  };

  useEffect(() => { loadData(); }, [selectedDate]);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date: selectedDate })
    });
    setTitle('');
    loadData();
  };

  // Günlük filtr
  const done = tasks.filter(t => t.status === 'done');
  const delayed = tasks.filter(t => t.status === 'delayed');
  const missed = tasks.filter(t => t.status === 'missed');

  return (
    <div className="container">
      <header>
        <h1>Smart Focus</h1>
        <input type="date" className="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </header>

      <form className="task-form" onSubmit={addTask}>
        <input placeholder="Özəl tapşırıq..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit" className="add-btn">Yaz</button>
      </form>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item status-${task.status}`}>
            <span className="task-text">{task.title}</span>
            <div className="btn-group">
              <button onClick={() => updateStatus(task.id, 'done')}>✅</button>
              <button onClick={() => updateStatus(task.id, 'delayed')}>⏳</button>
              <button onClick={() => updateStatus(task.id, 'missed')}>❌</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- HƏR GÜNLÜK, HƏFTƏLİK, AYLIQ HESABAT --- */}
      <div className="detailed-report">
        <h3>📊 ANALİTİKA</h3>
        <div className="rep-item"><b>Bu Günün Uğurları:</b> <span>{done.map(t=>t.title).join(", ") || "---"}</span></div>
        <div className="rep-item"><b>Həftəlik Arxiv (Son 7 gün):</b> <span>{fullReport.weekly.join(", ") || "---"}</span></div>
        <div className="rep-item"><b>Aylıq Arxiv (Son 30 gün):</b> <span>{fullReport.monthly.join(", ") || "---"}</span></div>
        <div className="rep-item"><b>İllik Arxiv (Son 365 gün):</b> <span>{fullReport.yearly.join(", ") || "---"}</span></div>
      </div>
    </div>
  );
}
export default App;