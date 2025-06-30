import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, colorClass }) => (
  <div className="card text-center p-6">
    <div className={`text-5xl font-extrabold ${colorClass} mb-2`}>{value}</div>
    <div className="text-lg text-content-secondary">{title}</div>
  </div>
);

const ProgressCircle = ({ percentage, colorClass }) => (
    <div className="relative w-48 h-48">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200 dark:text-dark-bg-tertiary"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        <circle
          className={colorClass}
          strokeWidth="10"
          strokeDasharray={326.73} // 2 * PI * 52
          strokeDashoffset={326.73 - (326.73 * percentage) / 100}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colorClass}`}>{percentage}%</span>
        <span className="text-content-secondary text-sm">Completado</span>
      </div>
    </div>
);

const Progress = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    averageProgress: 0
  });

  const fetchTasks = useCallback(async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/tasks', config);
      const tasksData = response.data;
      setTasks(tasksData);
      
      // Calcular estadísticas
      calculateStats(tasksData);
    } catch (error) {
      setError('Error al cargar las tareas');
      toast.error('Error al cargar las estadísticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const calculateStats = (tasksData) => {
    const total = tasksData.length;
    const completed = tasksData.filter(task => task.completed).length;
    const pending = total - completed;
    
    const highPriority = tasksData.filter(task => task.priority === 'Alta').length;
    const mediumPriority = tasksData.filter(task => task.priority === 'Media').length;
    const lowPriority = tasksData.filter(task => task.priority === 'Baja').length;
    
    // Calcular progreso promedio
    const totalProgress = tasksData.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;
    
    setStats({
      total,
      completed,
      pending,
      highPriority,
      mediumPriority,
      lowPriority,
      averageProgress
    });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div className="card text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-4xl font-bold text-center text-content mb-10">
        Progreso General
      </h2>
      
      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-content-secondary text-lg">No hay tareas para mostrar estadísticas.</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-content mb-6">Resumen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Total de Tareas" value={stats.total} colorClass="text-primary-500 dark:text-primary-400" />
              <StatCard title="Completadas" value={stats.completed} colorClass="text-green-500" />
              <StatCard title="Pendientes" value={stats.pending} colorClass="text-yellow-500" />
            </div>
          </div>
        
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-content mb-6">Prioridades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Alta Prioridad" value={stats.highPriority} colorClass="text-red-500" />
              <StatCard title="Media Prioridad" value={stats.mediumPriority} colorClass="text-yellow-500" />
              <StatCard title="Baja Prioridad" value={stats.lowPriority} colorClass="text-green-500" />
            </div>
          </div>

          <div className="card p-8 flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-content mb-6">Progreso Promedio</h3>
            <ProgressCircle percentage={stats.averageProgress} colorClass="text-primary-500 dark:text-primary-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;