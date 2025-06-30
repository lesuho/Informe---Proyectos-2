import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SubtaskList from './SubtaskList';
import TaskPermissionManager from '../roles/TaskPermissionManager';
import TaskPermissionDetails from '../roles/TaskPermissionDetails';
import { taskPermissionService } from '../../services/roleService';
import { AuthContext } from '../../context/AuthContext';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('lector');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const permissionsRef = useRef(null);

  // Función para verificar el rol del usuario en esta tarea
  const checkUserRole = async () => {
    try {
      const data = await taskPermissionService.getTaskPermissions(id);
      setUserRole(data.role);
      // También puedes guardar otros permisos si los necesitas
      // setUserPermissions(data);
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
      // Usar el servicio para eliminar el permiso del usuario
      await taskPermissionService.removeUserPermission(id, userId);
      
      toast.success('Usuario eliminado correctamente');

      // Refrescar la lista de permisos en el componente hijo
      if (permissionsRef.current) {
        permissionsRef.current.refetch();
      }
    } catch (error) {
      console.error('Error al eliminar usuario compartido:', error);
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShareOrPermissionUpdate = () => {
    // Refrescar la lista y cerrar el modal. No es necesario recargar toda la tarea.
    if (permissionsRef.current) {
      permissionsRef.current.refetch();
    }
    setShowPermissionModal(false);
    toast.success('Lista de permisos actualizada.');
  };

  // Estos condicionales son para el renderizado, no para definir hooks
  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="spinner"></div></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><div className="bg-red-100 bg-opacity-20 text-red-500 p-4 rounded-md">{error}</div></div>;
  if (!task) return <div className="min-h-screen flex justify-center items-center"><div className="text-center text-gray-400 p-8">Tarea no encontrada</div></div>;

  // Verificar permisos del usuario
  const canEdit = task?.userPermissions?.isOwner || task?.userPermissions?.role === 'editor';
  const canShare = task?.userPermissions?.isOwner;

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="card space-y-6">
        {/* --- Header --- */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-4">
          <div className="w-full sm:w-auto">
            <Link to="/tasks" className="btn btn-secondary w-full sm:w-auto justify-center">
              Volver a Tareas
            </Link>
          </div>

          <div className="w-full sm:w-auto order-first sm:order-none flex-grow text-center">
            <h2 className="text-2xl font-bold text-content">Detalle de Tarea</h2>
          </div>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            {canEdit && (
                <button
                  onClick={() => navigate(`/tasks/${id}/edit`)}
                  className="btn btn-primary w-full sm:w-auto flex-1"
                >
                  Editar
                </button>
            )}
            {canShare && (
                <button
                  onClick={handleDelete}
                  className="btn bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 w-full sm:w-auto flex-1"
                >
                  Eliminar
                </button>
            )}
          </div>
        </div>
          
        {/* --- Main Content --- */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Columna Izquierda: Detalles de la Tarea --- */}
          <div className="lg:col-span-2">
            <div className="card p-6 space-y-6">
              {/* --- Título --- */}
              <h3 className="text-3xl font-bold text-content">{task.title}</h3>

              {/* --- Descripción --- */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-content-secondary">Descripción</h4>
                <div className="text-content prose prose-sm max-w-none dark:prose-invert">
                  {task.description ? (
                    <p>{task.description}</p>
                  ) : (
                    <p className="text-content-secondary italic">No se proporcionó una descripción.</p>
                  )}
                </div>
              </div>

              {/* --- Etiquetas de Estado --- */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`px-3 py-1 text-sm rounded-full font-semibold whitespace-nowrap ${
                    task.priority === 'Alta'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      : task.priority === 'Media'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  }`}
                >
                  Prioridad: {task.priority}
                </div>
                <div className={`px-3 py-1 text-sm rounded-full font-semibold whitespace-nowrap ${
                    task.estado === 'Completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                    task.estado === 'En progreso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                }`}>
                  Estado: {task.estado || (task.completed ? 'Completada' : 'Pendiente')}
                </div>
                <div className="px-3 py-1 text-sm rounded-full font-semibold whitespace-nowrap bg-gray-200 dark:bg-indigo-900/50 text-gray-800 dark:text-indigo-300">
                  Fecha: {task.suggestedDate ? new Date(task.suggestedDate).toLocaleDateString('es-ES') : 'No definida'}
                </div>
              </div>

              {/* --- Propietario de la Tarea --- */}
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-content-secondary mb-2">Propietario</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary to-primary-focus rounded-full flex items-center justify-center shadow">
                    <span className="text-white font-bold text-lg">
                      {task.user?.name?.charAt(0).toUpperCase() || task.user?.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-content">{task.user?.name || task.user?.email}</p>
                    <p className="text-xs text-content-secondary">{task.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* --- Columna Derecha: Acciones, Subtareas y Permisos --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-bold text-content mb-4">Subtareas</h3>
              <SubtaskList taskId={id} canEdit={canEdit} />
            </div>
            
            <div className="card p-6">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-content">Usuarios con acceso</h3>
                {canShare && (
                  <button onClick={() => setShowPermissionModal(true)} className="btn btn-secondary">
                    Gestionar Permisos
                  </button>
                )}
              </div>
              
              {!canShare && !task.userPermissions?.role ? (
                <p className="text-content-secondary">No tienes permisos para ver quién tiene acceso.</p>
              ) : (
                 <TaskPermissionDetails 
                   ref={permissionsRef}
                   taskId={id} 
                   onRemoveUser={handleRemoveSharedUser}
                   isOwner={canShare}
                   currentUserId={user?._id}
                 />
              )}
            </div>
          </div>
        </div>
      </div>

      {showPermissionModal && (
        <TaskPermissionManager
          taskId={id}
          onClose={() => setShowPermissionModal(false)}
          onPermissionsUpdated={handleShareOrPermissionUpdate}
        />
      )}
    </div>
  );
};

export default TaskDetail;
