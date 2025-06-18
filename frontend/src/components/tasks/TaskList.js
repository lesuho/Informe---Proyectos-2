import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'completed'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Obtener el token del localStorage
        let userInfo;
        try {
          userInfo = JSON.parse(localStorage.getItem('user'));
        } catch (e) {
          console.error('Error al parsear la información del usuario:', e);
          setError('Error en la información de autenticación. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        if (!userInfo || !userInfo.token) {
          console.log('No se encontró token de autenticación');
          setError('No se encontró información de autenticación. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          // Redirigir al login
          navigate('/login');
          return;
        }
        
        // Configurar los headers con el token JWT
        const config = {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        };
        
        // Realizar la solicitud con el token en los headers
        const response = await axios.get('/api/tasks', config);
        setTasks(response.data);
      } catch (error) {
        console.error('Error al cargar las tareas:', error);
        
        // Manejar errores específicos
        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          if (error.response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('user'); // Limpiar el token inválido
            setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            navigate('/login');
          } else if (error.response.status === 500) {
            setError('Error en el servidor. Por favor, intenta más tarde o contacta al administrador.');
          } else {
            setError('Error al cargar las tareas: ' + (error.response.data?.message || error.message));
          }
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          // Algo ocurrió al configurar la solicitud
          setError('Error al preparar la solicitud: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Tareas</h1>
        <Link to="/tasks/new">
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200">
            Nueva Tarea
          </button>
        </Link>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md ${activeTab === 'pending' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-md ${activeTab === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Completadas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Cargando tareas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay tareas disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks
            .filter(task => {
              if (activeTab === 'all') return true;
              if (activeTab === 'pending') return task.progress < 100;
              if (activeTab === 'completed') return task.progress === 100;
              return true;
            })
            .map(task => (
              <Link 
                to={`/tasks/${task._id}`} 
                key={task._id}
                className="bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'Alta' ? 'bg-red-900 text-red-300' :
                    task.priority === 'Media' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-300 line-clamp-2 mt-2">{task.description}</p>
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">Progreso: {task.progress}%</span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.suggestedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;