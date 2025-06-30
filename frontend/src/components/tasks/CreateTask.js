import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Media',
    suggestedDate: '',
    progress: 0
  });
  const [isGeneratingPriority, setIsGeneratingPriority] = useState(false);
  const [isGeneratingDate, setIsGeneratingDate] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para generar prioridad automáticamente
  const handleGeneratePriority = async () => {
    if (!formData.title && !formData.description) {
      toast.warning('Por favor, ingresa un título o descripción para generar la prioridad automáticamente');
      return;
    }

    setIsGeneratingPriority(true);
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post('/api/tasks/generate-priority', {
        title: formData.title,
        description: formData.description
      }, config);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          priority: response.data.data.priority
        }));
        toast.success(`Prioridad generada automáticamente: ${response.data.data.priority}`);
      }
    } catch (error) {
      console.error('Error al generar prioridad:', error);
      toast.error('Error al generar la prioridad automáticamente');
    } finally {
      setIsGeneratingPriority(false);
    }
  };

  // Función para generar fecha sugerida automáticamente
  const handleGenerateDate = async () => {
    setIsGeneratingDate(true);
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post('/api/tasks/generate-date', {
        priority: formData.priority
      }, config);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          suggestedDate: response.data.data.suggestedDate
        }));
        toast.success('Fecha sugerida generada automáticamente');
      }
    } catch (error) {
      console.error('Error al generar fecha sugerida:', error);
      toast.error('Error al generar la fecha sugerida automáticamente');
    } finally {
      setIsGeneratingDate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.post('/api/tasks', formData, config);
      toast.success('Tarea creada correctamente');
      navigate('/tasks');
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      toast.error('Error al crear la tarea: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> 
      <div className="max-w-3xl w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700"> 
        <div> 
          <h2 className="mt-2 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4"> 
            Crear Nueva Tarea 
          </h2> 
        </div> 
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6"> 
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">Título</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              ></textarea>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Prioridad</label>
                <button
                  type="button"
                  onClick={handleGeneratePriority}
                  disabled={isGeneratingPriority || (!formData.title && !formData.description)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded"
                >
                  {isGeneratingPriority ? 'Generando...' : 'Generar con IA'}
                </button>
              </div>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="suggestedDate" className="block text-sm font-medium text-gray-300">Fecha sugerida</label>
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
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>
            
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-gray-300">Progreso: {formData.progress}%</label>
              <input
                id="progress"
                name="progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Crear Tarea
            </button>
          </div>
        </form> 
      </div> 
    </div> 
  );
};

export default CreateTask;

