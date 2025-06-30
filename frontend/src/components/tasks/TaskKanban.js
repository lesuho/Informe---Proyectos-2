import React, { memo, useCallback, useEffect } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaSpinner } from 'react-icons/fa';
import api from '../../config/axios';
import { toast } from 'react-toastify';

const Column = ({ column, tasks = [], isDropDisabled = false, onTaskClick }) => {
  // Filtrar tareas nulas o indefinidas
  const validTasks = Array.isArray(tasks) ? tasks.filter(task => task && task._id) : [];
  
  return (
    <div className="flex-1 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg p-4 flex flex-col min-h-[400px] max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-content">{column.title}</h3>
        <span className="bg-gray-200 dark:bg-dark-bg-secondary text-content-secondary text-xs font-medium px-2.5 py-0.5 rounded-full">
          {validTasks.length}
        </span>
      </div>
      <Droppable droppableId={column.id} isDropDisabled={isDropDisabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded transition-colors p-2 ${
              snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-dark-bg-secondary' : 'bg-transparent'
            }`}
          >
            {validTasks.length === 0 ? (
              <div className="text-center py-6 text-content-secondary text-sm">
                No hay tareas en esta columna
              </div>
            ) : (
              <div className="space-y-3">
                {validTasks.map((task, index) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    index={index} 
                    onClick={onTaskClick}
                  />
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

// Función para normalizar el ID de la tarea
const normalizeTaskId = (id) => {
  if (!id) return null;
  // Asegurarse de que el ID sea una cadena y eliminar espacios en blanco
  return String(id).trim();
};

const TaskCard = memo(({ task, index, onClick }) => {
  // Si no hay tarea, no renderizar nada
  if (!task) {
    console.warn('Tarea indefinida en TaskCard');
    return null;
  }

  // Verificar que el ID sea válido
  const taskId = normalizeTaskId(task._id);
  if (!taskId) {
    console.error('Tarea sin ID o con ID inválido:', task);
    return null;
  }
  
  // Valores por defecto para evitar errores
  const safeTask = {
    _id: taskId,
    title: String(task.title || 'Sin título'),
    description: String(task.description || ''),
    priority: String(task.priority || 'Baja'),
    progress: typeof task.progress === 'number' ? task.progress : 0,
    estado: String(task.estado || 'Pendiente'),
    suggestedDate: task.suggestedDate || new Date().toISOString(),
    // Asegurarse de que el ID esté en el objeto de la tarea
    id: taskId
  };
  
  // Debug: Verificar la tarea que se está renderizando
  console.log(`Renderizando tarea ID: ${taskId}`, safeTask);

  return (
    <Draggable 
      draggableId={taskId} 
      index={index}
    >
      {(provided, snapshot) => {
        // Aplicar estilos de arrastre
        const style = {
          ...provided.draggableProps.style,
          // Asegurarse de que la tarea arrastrada mantenga su posición
          transform: snapshot.isDragging
            ? `${provided.draggableProps.style?.transform || ''} rotate(1deg)`
            : provided.draggableProps.style?.transform,
          // Asegurarse de que la tarea arrastrada esté por encima de las demás
          zIndex: snapshot.isDragging ? 1000 : 'auto',
          // Limitar el ancho de la tarjeta arrastrada
          width: 'auto',
          maxWidth: '100%',
          minWidth: '220px', // puedes ajustar este valor si lo deseas
          // Deshabilitar la selección de texto durante el arrastre
          userSelect: 'none',
          // Asegurar que el puntero sea consistente
          cursor: snapshot.isDragging ? 'grabbing' : 'grab'
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={style}
            className={`card p-4 mb-3 transition-all duration-200 ${
              snapshot.isDragging ? 'opacity-90 shadow-2xl scale-105' : 'hover:shadow-lg'
            }`}
            data-draggable-id={taskId}
          >
          <Link 
            to={`/tasks/${safeTask._id}`} 
            className="block"
            onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                onClick(safeTask._id);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-content pr-2">{safeTask.title}</h4>
              <span 
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  safeTask.priority === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' :
                  safeTask.priority === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                  'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                }`}
              >
                {safeTask.priority}
              </span>
            </div>
            {safeTask.description && (
              <p className="text-content-secondary text-sm mt-2 line-clamp-2">
                {safeTask.description}
              </p>
            )}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, safeTask.progress))}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-content-secondary">
                <span>Progreso: {safeTask.progress}%</span>
                <span>
                  {new Date(safeTask.suggestedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  safeTask.estado === 'Completada' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' :
                  safeTask.estado === 'En progreso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' :
                  'bg-gray-200 text-gray-800 dark:bg-dark-bg-tertiary dark:text-gray-300'
                }`}>
                  {safeTask.estado}
                </span>
              </div>
            </div>
          </Link>
          </div>
        );
      }}
    </Draggable>
  );
});

TaskCard.displayName = 'TaskCard';

const TaskKanban = ({ tasks = [], onTaskUpdate, onTaskClick, loading = false }) => {
  // Función para determinar la columna de una tarea basada en su estado
  const getTaskColumn = (task) => {
    if (!task) return 'pending';
    
    // Si la tarea tiene la propiedad 'estado', usamos ese valor
    if (task.estado) {
      const estado = String(task.estado).toLowerCase();
      if (estado.includes('complet')) return 'completed';
      if (estado.includes('progreso') || estado.includes('proceso')) return 'in-progress';
      return 'pending';
    }
    
    // Para compatibilidad hacia atrás, si no existe 'estado'
    if (task.completed || task.progress === 100) return 'completed';
    if (task.progress > 0) return 'in-progress';
    return 'pending';
  };

  // Función para manejar el final del drag and drop
  const handleDragEnd = useCallback(async (result) => {
    if (!result.destination || !result.source) return;
    
    const { source, destination, draggableId } = result;
    
    // Si no se movió a una columna diferente, no hacer nada
    if (source.droppableId === destination.droppableId) return;
    
    const taskId = normalizeTaskId(draggableId);
    if (!taskId) return;
    
    // Encontrar la tarea
    const task = tasks.find(t => normalizeTaskId(t._id) === taskId);
    if (!task) {
      toast.error('No se pudo encontrar la tarea para actualizar');
      return;
    }
    
    // Mapeo de columnas a estados
    const columnMappings = {
      'pending': { estado: 'Pendiente', completed: false, progress: 0 },
      'in-progress': { estado: 'En progreso', completed: false, progress: 50 },
      'completed': { estado: 'Completada', completed: true, progress: 100 }
    };
    
    const columnConfig = columnMappings[destination.droppableId];
    if (!columnConfig) {
      console.error('Columna de destino desconocida:', destination.droppableId);
      return;
    }
    
    const { estado: newEstado, completed, progress } = columnConfig;
    
    try {
      // Actualizar en el servidor
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userInfo?.token) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const taskData = {
        ...task,
        estado: newEstado,
        completed,
        progress,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Media',
        suggestedDate: task.suggestedDate || new Date().toISOString()
      };
      
      // Limpiar campos innecesarios
      delete taskData.__v;
      delete taskData.createdAt;
      delete taskData.updatedAt;
      
      await api.put(`/tasks/${taskId}`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      // Llamar a la función de actualización del componente padre
      if (onTaskUpdate) {
        const updatedTask = {
          ...task,
          estado: newEstado,
          completed,
          progress
        };
        onTaskUpdate(updatedTask);
      }
      
      toast.success(`Tarea movida a "${newEstado}"`);
      
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  }, [tasks, onTaskUpdate]);

  // Efecto para manejar el scroll horizontal con la rueda del ratón
  useEffect(() => {
    const kanbanContainer = document.querySelector('.kanban-container');
    if (!kanbanContainer) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      kanbanContainer.scrollLeft += e.deltaY + e.deltaX;
    };

    kanbanContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => kanbanContainer.removeEventListener('wheel', handleWheel);
  }, []);

  const columns = React.useMemo(() => {
    const columnsData = {
      pending: { id: 'pending', title: 'Pendientes', tasks: [] },
      'in-progress': { id: 'in-progress', title: 'En Progreso', tasks: [] },
      completed: { id: 'completed', title: 'Completadas', tasks: [] },
    };

    const validTasks = (Array.isArray(tasks) ? tasks : []).filter(task => task && task._id);

    validTasks.forEach(task => {
      const columnId = getTaskColumn(task);
      if (columnsData[columnId]) {
        columnsData[columnId].tasks.push({
          ...task,
          _id: String(task._id),
          id: String(task._id),
        });
      }
    });

    return Object.values(columnsData);
  }, [tasks]);

  const renderColumn = useCallback((column) => {
    // Filtrar tareas nulas o sin ID
    const validTasks = (column.tasks || []).filter(task => {
      const isValid = task && task._id;
      if (!isValid) {
        console.warn('Tarea inválida encontrada en renderColumn:', task);
      }
      return isValid;
    });
    
    // Verificar si hay tareas inválidas
    if (validTasks.length !== (column.tasks?.length || 0)) {
      console.warn(`Se encontraron tareas inválidas en la columna ${column.id}`);
    }
    
    // Asegurarse de que cada tarea tenga un ID de cadena
    const tasksWithStringIds = validTasks.map(task => ({
      ...task,
      _id: String(task._id),
      id: String(task._id || '')
    }));
    
    return (
      <Column 
        key={`column-${column.id}`}
        column={{
          ...column,
          id: String(column.id),
          tasks: tasksWithStringIds
        }}
        tasks={tasksWithStringIds}
        isDropDisabled={loading}
        onTaskClick={onTaskClick}
      />
    );
  }, [loading, onTaskClick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-purple-500" />
        <span className="ml-2">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-container flex">
      <style jsx>{`
          .kanban-container {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        .kanban-container::-webkit-scrollbar {
            display: none;  /* Safari and Chrome */
        }
      `}</style>
        <div className="flex w-full space-x-4">
        {columns.map(column => (
            <div key={column.id} className="flex-1">
            <Column 
              column={column} 
              tasks={column.tasks}
              isDropDisabled={loading}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
      </div>
    </div>
    </DragDropContext>
  );
};

TaskKanban.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    progress: PropTypes.number,
    estado: PropTypes.string,
    completed: PropTypes.bool,
    suggestedDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
  })),
  onTaskUpdate: PropTypes.func,
  onTaskClick: PropTypes.func,
  loading: PropTypes.bool,
};

TaskKanban.defaultProps = {
  tasks: [],
  onTaskUpdate: () => {},
  onTaskClick: null,
  loading: false,
};

export default memo(TaskKanban);
