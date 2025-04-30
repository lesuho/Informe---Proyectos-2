import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

function ProgressPanel() {
  const [metrics, setMetrics] = useState({
    completedTasks: 0,
    averageTimePerTask: 0,
    tasksByDay: {}
  });

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/tasks/metrics/weekly');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Progreso Semanal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tareas Completadas</h3>
          <p className="text-3xl font-bold">{metrics.completedTasks}</p>
        </div>
        
        <div className="bg-zinc-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tiempo Promedio por Tarea</h3>
          <p className="text-3xl font-bold">{formatTime(metrics.averageTimePerTask)}</p>
        </div>
      </div>

      <div className="bg-zinc-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Tareas por Día</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div key={day} className="text-center">
              <p className="text-sm text-gray-400">{day.slice(0, 3)}</p>
              <p className="text-xl font-bold">{metrics.tasksByDay[index] || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgressPanel; 