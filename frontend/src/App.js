import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fullReport, setFullReport] = useState({ weekly: [], monthly: [], yearly: [] });

  // 1. Məlumatları Baza-dan Gətirmək (GET)
  const loadData = async () => {
    try {
      const res = await fetch(`https://myplaner-hy5e.onrender.com/tasks?date=${selectedDate}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);

      const repRes = await fetch('https://myplaner-hy5e.onrender.com/full-report');
      const repData = await repRes.json();
      setFullReport(repData);
    } catch (err) {
      console.error("Məlumat yüklənərkən xəta:", err);
    }
  };

  useEffect(() => { loadData(); }, [selectedDate]);

  // 2. Yeni Tapşırıq Əlavə Etmək (POST) - Əsas Düzəliş Buradadır!
  const addTask = async (e) => {
    if (e) e.preventDefault(); // Səhifənin refresh olmasını dayandırır
    
    if (!title.trim()) return;

    try {
      const response = await fetch('https://myplaner-hy5e.onrender.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title, 
          task_date: selectedDate // Backend-dəki sütun adı ilə eyni olmalıdır
        })
      });

      if (response.ok) {
        setTitle(''); // Xanayı təmizlə
        loadData();    // Siyahını dərhal yenilə
      }
    } catch (err) {
      console.error("Yazarkən xəta baş verdi:", err);
    }
  };

  // 3. Statusu Yeniləmək (PUT)
  const updateStatus = async (id, status) => {
    await fetch(`https://myplaner-hy5e.onrender.com/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadData();
  };

  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="container">
      <header>
        <h1>Smart Focus</h1>
        <input 
          type="date" 
          className="date-picker" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
        />
      </header>

      {/* addTask funksiyası burada onSubmit-ə bağlıdır */}
      <form className="task-form" onSubmit={addTask}>
        <input 
          placeholder="Özəl tapşırıq..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
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

      <div className="detailed-report">
        <h3>📊 ANALİTİKA</h3>
        <div className="rep-item"><b>Bu Günün Uğurları:</b> <span>{done.map(t=>t.title).join(", ") || "---"}</span></div>
        <div className="rep-item"><b>Həftəlik Arxiv:</b> <span>{fullReport.weekly.join(", ") || "---"}</span></div>
        <div className="rep-item"><b>Aylıq Arxiv:</b> <span>{fullReport.monthly.join(", ") || "---"}</span></div>
      </div>
    </div>
  );
}

export default App;