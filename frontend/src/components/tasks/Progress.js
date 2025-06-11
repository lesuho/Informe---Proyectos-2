import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-8">
          Progreso General
        </h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <p className="text-gray-400">No hay tareas para mostrar estadísticas</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Resumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{stats.total}</div>
                  <div className="text-gray-300">Total de Tareas</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{stats.completed}</div>
                  <div className="text-gray-300">Completadas</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{stats.pending}</div>
                  <div className="text-gray-300">Pendientes</div>
                </div>
              </div>
            </div>
          
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Prioridades</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-red-400 mb-2">{stats.highPriority}</div>
                  <div className="text-gray-300">Alta Prioridad</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{stats.mediumPriority}</div>
                  <div className="text-gray-300">Media Prioridad</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{stats.lowPriority}</div>
                  <div className="text-gray-300">Baja Prioridad</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Progreso Promedio</h3>
              <div className="flex justify-center items-center">
                <div className="relative w-48 h-48">
                  <svg className="-rotate-90 w-48 h-48">
                    <circle
                      className="text-gray-700"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="90"
                      cx="96"
                      cy="96"
                    />
                    <circle
                      className="text-purple-400"
                      strokeWidth="8"
                      strokeDasharray={565.48}
                      strokeDashoffset={565.48 * ((100 - stats.averageProgress) / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="90"
                      cx="96"
                      cy="96"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-4xl font-bold text-purple-400">{stats.averageProgress}%</span>
                    <span className="text-gray-400 text-sm block mt-1">Completado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;