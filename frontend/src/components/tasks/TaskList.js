import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import TaskKanban from './TaskKanban';
import { FaList, FaTh, FaColumns } from 'react-icons/fa';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  const navigate = useNavigate();

  // Cargar tareas
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!userInfo?.token) {
          setError('No se encontró información de autenticación. Por favor, inicia sesión.');
          setLoading(false);
          navigate('/login');
          return;
        }
        
        const params = {};
        if (activeTab === 'pending') params.status = 'pending';
        else if (activeTab === 'completed') params.status = 'completed';
        
        const response = await api.get('/tasks', { params });
        setTasks(response.data);
      } catch (error) {
        console.error('Error al cargar tareas:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Error al cargar las tareas. Intenta de nuevo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate, activeTab]);

  // Normalizar ID de tarea
  const normalizeTaskId = (id) => id ? String(id).trim() : null;

  // Manejador de actualización de tarea desde el Kanban
  const handleTaskUpdate = useCallback((updatedTask) => {
    setTasks(prev => prev.map(t => 
      normalizeTaskId(t._id) === normalizeTaskId(updatedTask._id) ? { ...t, ...updatedTask } : t
    ));
  }, []);

  // Manejador de clic en tarea
  const handleTaskClick = useCallback((taskId) => {
    navigate(`/tasks/${taskId}`);
  }, [navigate]);

  // Filtrar tareas según la pestaña activa
  const filteredTasks = tasks.filter(task => {
    if (!task) return false;

    switch (activeTab) {
      case 'all':
        return true;
      case 'pending':
        // Muestra todas las tareas que no están completadas
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
    return true;
    }
  });

  if (loading) return <div className="text-center py-8">Cargando tareas...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-content">Mis Tareas</h1>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-200 dark:bg-dark-bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-content-secondary'}`}
              title="Vista de cuadrícula"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-icon p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-content-secondary'}`}
              title="Vista de lista"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn-icon p-2 rounded ${viewMode === 'kanban' ? 'bg-primary-500 text-white' : 'text-content-secondary'}`}
              title="Vista Kanban"
            >
              <FaColumns />
            </button>
          </div>
          <Link
            to="/tasks/new"
            className="btn btn-primary"
          >
            Nueva Tarea
          </Link>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completadas
        </button>
      </div>

      <div>
        {viewMode === 'kanban' ? (
          <TaskKanban 
            tasks={filteredTasks} 
            onTaskClick={handleTaskClick} 
            onTaskUpdate={handleTaskUpdate}
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Link 
                key={task._id} 
                to={`/tasks/${task._id}`}
                className="card flex flex-col p-4"
              >
                <h3 className="text-lg font-semibold text-content">{task.title}</h3>
                <p className="text-content-secondary mt-1">{task.description || 'Sin descripción'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    task.priority === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' :
                    task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                  }`}>
                    {task.priority || 'Sin prioridad'}
                  </span>
                  <span className="text-sm text-content-secondary">
                    {task.estado || 'Sin estado'}
                  </span>
                </div>
              </Link>
            ))}
            {filteredTasks.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-content-secondary">No hay tareas para mostrar</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Link 
                key={task._id} 
                to={`/tasks/${task._id}`}
                className="card flex flex-col p-4"
              >
                <h3 className="text-lg font-semibold text-content">{task.title}</h3>
                <p className="text-content-secondary mt-1 text-sm line-clamp-2">
                  {task.description || 'Sin descripción'}
                </p>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      task.priority === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' :
                      task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                    }`}>
                      {task.priority || 'Sin prioridad'}
                    </span>
                    <span className="text-xs text-content-secondary">
                      {task.estado || 'Sin estado'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          task.completed ? 'bg-green-500' : 
                          task.progress > 0 ? 'bg-primary-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-content-secondary mt-1">
                      {task.progress || 0}% completado
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filteredTasks.length === 0 && (
              <div className="card col-span-3 text-center py-16">
                <p className="text-content-secondary">No hay tareas para mostrar</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
