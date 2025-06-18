import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ShareTask from './ShareTask';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('lector');
  const [showShareModal, setShowShareModal] = useState(false);

  // Función para verificar el rol del usuario en esta tarea
  const checkUserRole = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`/api/tasks/${id}/permissions`, config);
      setUserRole(response.data.role);
      // También puedes guardar otros permisos si los necesitas
      // setUserPermissions(response.data);
    } catch (error) {
      console.error('Error checking user role:', error);
      // Si hay un error, mantenemos el rol por defecto (lector)
      // No mostrar el error en la consola para mejorar la experiencia del usuario
    }
  };

  // Primer useEffect para cargar la tarea
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('user')).token;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`/api/tasks/${id}`, config);
        setTask(response.data);
        setLoading(false);
        
        // Verificar el rol del usuario después de cargar la tarea
        checkUserRole();
      } catch (error) {
        console.error('Error fetching task:', error);
        setError('Error al cargar la tarea');
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);

  // Segundo useEffect para actualizar permisos cuando cambia el estado de completado
  // Este hook DEBE estar fuera de cualquier condición
  useEffect(() => {
    if (task) {
      checkUserRole();
    }
  }, [task?.completed, id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }
    
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/tasks/${id}`, config);
      toast.success('Tarea eliminada correctamente');
      navigate('/tasks');
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error('Error al eliminar la tarea: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleComplete = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Guardar los permisos actuales antes de la actualización
      const currentPermissions = task.userPermissions;
      
      // Actualizar el estado de completado y el progreso
      const updatedData = {
        ...task,
        completed: !task.completed,
        progress: !task.completed ? 100 : task.progress
      };
      
      const response = await axios.put(`/api/tasks/${id}`, updatedData, config);
      
      // Actualizar la tarea manteniendo los permisos del usuario
      setTask({
        ...response.data,
        userPermissions: currentPermissions // Mantener los permisos existentes
      });
      
      toast.success(task.completed ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada');
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      toast.error('Error al actualizar la tarea: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveSharedUser = async (userId) => {
    // Verificar si el usuario actual es el propietario
    if (!task.userPermissions?.isOwner) {
      toast.error('Solo el propietario puede eliminar usuarios compartidos');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas quitar este usuario?')) {
      return;
    }
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`/api/tasks/${id}/share/${userId}`, config);
      
      // Obtener la tarea actualizada después de eliminar el usuario compartido
      const response = await axios.get(`/api/tasks/${id}`, config);
      setTask(response.data);
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario compartido:', error);
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  // Estos condicionales son para el renderizado, no para definir hooks
  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="spinner"></div></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><div className="bg-red-100 bg-opacity-20 text-red-500 p-4 rounded-md">{error}</div></div>;
  if (!task) return <div className="min-h-screen flex justify-center items-center"><div className="text-center text-gray-400 p-8">Tarea no encontrada</div></div>;

  // Verificar permisos del usuario
  const canEdit = task?.userPermissions?.isOwner || task?.userPermissions?.role === 'editor';
  const canComplete = task?.userPermissions?.isOwner || task?.userPermissions?.role === 'editor';
  const canShare = task?.userPermissions?.isOwner;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
            Detalle de Tarea
          </h2>
        </div>
        
        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Link 
              to="/tasks" 
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition duration-300 shadow-md hover:shadow-lg"
            >
              <span>←</span> Volver
            </Link>
            
            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/tasks/${id}/edit`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition duration-300"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition duration-300"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 shadow-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{task.title}</h3>
              <div className={`px-3 py-1 rounded-full font-medium 
                ${task.priority === 'Alta' ? 'bg-red-900 text-red-300' : 
                task.priority === 'Media' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                {task.priority}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Descripción
              </h4>
              <div className="bg-gray-700/50 p-3 rounded-lg text-gray-300">
                {task.description || "Sin descripción"}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Estado</h4>
                <div className={`inline-block px-3 py-1 rounded font-medium ${
                  task.completed ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {task.completed ? 'Completada' : 'Pendiente'}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Fecha</h4>
                <div className="inline-block px-3 py-1 rounded font-medium bg-indigo-900/50 text-indigo-300">
                  {new Date(task.suggestedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Progreso
              </h4>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner relative mr-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${task.progress}%` }}
                  >
                  </div>
                </div>
                <span className="font-medium text-gray-300 whitespace-nowrap">{task.progress}%</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Compartida con
              </h4>
              {task.sharedWith && task.sharedWith.length > 0 ? (
                <div className="bg-gray-700/50 p-2 rounded-lg">
                  {task.sharedWith.map((share, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 rounded mb-1">
                      <span className="text-gray-300">
                        {share.user && (share.user.name || share.user.email) || "Usuario compartido"}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full ${
                        share.role === 'editor' ? 'bg-purple-900/70 text-purple-300' : 'bg-blue-900/70 text-blue-300'
                      }`}>
                        {share.role === 'editor' ? 'Editor' : 'Lector'}
                      </span>
                      {task.userPermissions?.isOwner && (
                        <button
                          onClick={() => handleRemoveSharedUser(share.user._id)}
                          className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-md transition duration-300"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-500 italic">No compartida</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            {canShare && (
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Compartir
              </button>
            )}
            
            {canComplete && (
              <button
                onClick={handleToggleComplete}
                className={`px-4 py-2 rounded-md transition duration-300 flex items-center ${task.completed ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                {task.completed ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            </button>
            )}
          </div>
        </div>
        
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <ShareTask 
              taskId={id} 
              onClose={() => setShowShareModal(false)} 
              onShare={async (updatedTask) => {
                // Obtener la tarea actualizada con todos los permisos
                const token = JSON.parse(localStorage.getItem('user')).token;
                const config = {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                };
                const response = await axios.get(`/api/tasks/${id}`, config);
                setTask(response.data);
                setShowShareModal(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;