import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTasks } from 'react-icons/fa';

const SubtaskList = ({ taskId, canEdit }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({ title: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubtasks = async () => {
      if (!taskId) return;
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user')).token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/tasks/${taskId}`, config);
        setSubtasks(response.data.subtasks || []);
    } catch (error) {
        toast.error('No se pudieron cargar las subtareas.');
    } finally {
      setLoading(false);
    }
  };
    fetchSubtasks();
  }, [taskId]);

  const handleApiCall = async (apiCall, successMessage) => {
    if (!canEdit) {
      toast.error("No tienes permiso para realizar esta acción.");
      return;
    }
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user')).token;
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const response = await apiCall(config);
      setSubtasks(response.data.subtasks || []);
      toast.success(successMessage);
      setIsAdding(false);
      setNewSubtask({ title: '' });
      setEditingSubtask(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtask.title.trim()) return;
    handleApiCall(
      (config) => axios.post(`/api/tasks/${taskId}/subtasks`, newSubtask, config),
      'Subtarea añadida.'
    );
  };
      
  const handleUpdateSubtask = (e, subtaskId) => {
    e.preventDefault();
    if (!editingSubtask.title.trim()) return;
    handleApiCall(
      (config) => axios.put(`/api/tasks/${taskId}/subtasks/${subtaskId}`, editingSubtask, config),
      'Subtarea actualizada.'
    );
  };

  const handleDeleteSubtask = (subtaskId) => {
    if (!window.confirm('¿Eliminar esta subtarea?')) return;
    handleApiCall(
      (config) => axios.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`, config),
      'Subtarea eliminada.'
    );
  };

  const handleToggleSubtask = (subtask) => {
    handleApiCall(
      (config) => axios.put(`/api/tasks/${taskId}/subtasks/${subtask._id}`, { completed: !subtask.completed }, config),
      'Estado de subtarea actualizado.'
    );
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex mb-4">
          <button onClick={() => setIsAdding(!isAdding)} className="btn btn-secondary w-full">
            {isAdding ? 'Cancelar' : 'Añadir'}
          </button>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddSubtask} className="flex gap-2 p-3 rounded-lg bg-base-300">
          <input
            type="text"
            value={newSubtask.title}
            onChange={(e) => setNewSubtask({ title: e.target.value })}
            className="input flex-grow"
            placeholder="Nueva subtarea..."
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Añadiendo...' : 'Añadir'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {loading && !subtasks.length && <p className="text-content-secondary text-center py-4">Cargando subtareas...</p>}
        
        {!loading && !subtasks.length && !isAdding && (
            <div className="text-center text-content-secondary py-6">
                <FaTasks className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="font-semibold">No hay subtareas</p>
                <p className="text-sm">Añade una para organizar mejor tu trabajo.</p>
            </div>
        )}
        
        {subtasks.map((subtask) => (
          <div key={subtask._id} className="p-3 rounded-lg bg-base-300">
            {editingSubtask?._id === subtask._id ? (
              <form onSubmit={(e) => handleUpdateSubtask(e, subtask._id)} className="flex gap-2">
                  <input
                    type="text"
                    value={editingSubtask.title}
                  onChange={(e) => setEditingSubtask({ ...editingSubtask, title: e.target.value })}
                  className="input flex-grow"
                  disabled={loading}
                  />
                <button type="submit" className="btn btn-primary" disabled={loading}>Guardar</button>
                <button type="button" onClick={() => setEditingSubtask(null)} className="btn btn-secondary" disabled={loading}>Cancelar</button>
                </form>
              ) : (
                  <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask)}
                    className="checkbox"
                    disabled={!canEdit || loading}
                  />
                  <span className={`text-content ${subtask.completed ? 'line-through text-content-secondary' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>

                    {canEdit && (
                  <div className="flex gap-2">
                        <button onClick={() => setEditingSubtask(subtask)} className="btn btn-icon text-blue-500 hover:text-blue-600" disabled={loading}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => handleDeleteSubtask(subtask._id)} className="btn btn-icon text-red-500 hover:text-red-600" disabled={loading}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                  </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

export default SubtaskList;
