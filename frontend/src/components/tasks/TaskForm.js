import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isGeneratingPriority, setIsGeneratingPriority] = useState(false);
  const [isGeneratingDate, setIsGeneratingDate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Media',
    suggestedDate: ''
  });

  const fetchTask = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${id}`);
      const { title, description, priority, suggestedDate } = response.data;
      setFormData({
        title: title || '',
        description: description || '',
        priority: priority || 'Media',
        suggestedDate: suggestedDate ? new Date(suggestedDate).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      toast.error('Error al cargar la tarea para editar.');
      console.error('Error fetching task:', error);
      setError('Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchTask();
    }
  }, [id, fetchTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generar prioridad automáticamente
  const handleGeneratePriority = async () => {
    if (!formData.title && !formData.description) {
      toast.warning('Por favor, ingresa un título o descripción para generar la prioridad automáticamente');
      return;
    }
    setIsGeneratingPriority(true);
    try {
      const response = await api.post('/tasks/generate-priority', {
        title: formData.title,
        description: formData.description
      });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, priority: response.data.data.priority }));
        toast.success(`Prioridad generada automáticamente: ${response.data.data.priority}`);
      }
    } catch (error) {
      toast.error('Error al generar la prioridad automáticamente');
    } finally {
      setIsGeneratingPriority(false);
    }
  };

  // Generar fecha sugerida automáticamente
  const handleGenerateDate = async () => {
    setIsGeneratingDate(true);
    try {
      const response = await api.post('/tasks/generate-date', {
        priority: formData.priority
      });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, suggestedDate: response.data.data.suggestedDate }));
        toast.success('Fecha sugerida generada automáticamente');
      }
    } catch (error) {
      toast.error('Error al generar la fecha sugerida automáticamente');
    } finally {
      setIsGeneratingDate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      suggestedDate: formData.suggestedDate
    };
    try {
      const promise = id ? api.put(`/tasks/${id}`, dataToSend) : api.post('/tasks', dataToSend);
      await toast.promise(promise, {
        pending: id ? 'Actualizando tarea...' : 'Creando tarea...',
        success: `Tarea ${id ? 'actualizada' : 'creada'} correctamente.`,
        error: `Error al ${id ? 'actualizar' : 'crear'} la tarea.`
      });
      navigate(id ? `/tasks/${id}` : '/tasks');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="text-center p-8">Cargando formulario...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="card p-8">
        <h2 className="text-3xl font-bold text-content text-center mb-6">
          {id ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-content-secondary mb-1">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Finalizar el reporte mensual"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-content-secondary mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[120px]"
              rows="4"
              placeholder="Añade más detalles sobre la tarea..."
            ></textarea>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="priority" className="block text-sm font-medium text-content-secondary">Prioridad</label>
              <button
                type="button"
                onClick={handleGeneratePriority}
                disabled={isGeneratingPriority || (!formData.title && !formData.description)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded"
              >
                {isGeneratingPriority ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
            <input
              id="priority"
              name="priority"
              value={formData.priority}
              readOnly
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="suggestedDate" className="block text-sm font-medium text-content-secondary">Fecha sugerida</label>
              <button
                type="button"
                onClick={handleGenerateDate}
                disabled={isGeneratingDate}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded"
              >
                {isGeneratingDate ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
            <input
              id="suggestedDate"
              name="suggestedDate"
              type="date"
              value={formData.suggestedDate}
              readOnly
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link to={isEdit ? `/tasks/${id}` : '/tasks'} className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (id ? 'Actualizar Tarea' : 'Crear Tarea')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;