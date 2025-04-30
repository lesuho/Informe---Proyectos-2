import { useState, useEffect } from 'react';
import { useTasks } from '../context/TasksContext';
import { useNavigate } from 'react-router-dom';
import { getPrioritySuggestion } from '../api/ai';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
dayjs.extend(utc);

function TaskForm({ onClose, task: initialTask }) {
    const { createTask, updateTask, getTask } = useTasks();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: null,
        priority: 'medium'
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return '';
        }
    };

    useEffect(() => {
        if (initialTask) {
            console.log('Initial Task:', initialTask);
            console.log('Deadline from initialTask:', initialTask.deadline);
            console.log('Date from initialTask:', initialTask.date);
            
            // Usar date si deadline es null
            const dateToUse = initialTask.deadline || initialTask.date;
            const formattedDeadline = formatDate(dateToUse);
            console.log('Formatted Deadline:', formattedDeadline);
            
            setFormData({
                title: initialTask.title || '',
                description: initialTask.description || '',
                deadline: formattedDeadline,
                priority: initialTask.priority || 'medium'
            });
        }
    }, [initialTask]);

    const loadTask = async (id) => {
        try {
            setLoading(true);
            const taskData = await getTask(id);
            console.log('Task Data from API:', taskData);
            console.log('Deadline from API:', taskData.deadline);
            console.log('Date from API:', taskData.date);
            
            if (taskData) {
                // Usar date si deadline es null
                const dateToUse = taskData.deadline || taskData.date;
                const formattedDeadline = formatDate(dateToUse);
                console.log('Formatted Deadline from API:', formattedDeadline);
                
                setFormData({
                    title: taskData.title || '',
                    description: taskData.description || '',
                    deadline: formattedDeadline,
                    priority: taskData.priority || 'medium'
                });
            }
        } catch (error) {
            console.error('Error al cargar la tarea:', error);
            toast.error('Error al cargar la tarea');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Validar que los campos requeridos no estén vacíos
            if (!formData.title.trim() || !formData.description.trim()) {
                toast.error('El título y la descripción son campos requeridos');
                return;
            }

            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim()
            };

            let result;
            if (window.location.pathname.includes('/tasks/new')) {
                // Crear la tarea
                result = await createTask(taskData);
            } else {
                // Actualizar la tarea
                const taskId = window.location.pathname.split('/').pop();
                result = await updateTask(taskId, taskData);
            }

            if (!result) {
                throw new Error('No se pudo procesar la tarea');
            }

            toast.success(window.location.pathname.includes('/tasks/new') ? 
                'Tarea creada exitosamente' : 
                'Tarea actualizada exitosamente'
            );
            
            navigate('/tasks');
            
            if (onClose) onClose();
        } catch (error) {
            console.error('Error al guardar la tarea:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Error al guardar la tarea');
            } else if (error.request) {
                toast.error('Error de conexión. Por favor, verifica tu conexión a internet');
            } else {
                toast.error(error.message || 'Error al guardar la tarea');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestPriority = async () => {
        if (!formData.description) {
            toast.error('Por favor, ingresa una descripción primero');
            return;
        }

        try {
            setSuggesting(true);
            const result = await getPrioritySuggestion(formData.description);
            
            if (result && result.priority) {
                setFormData(prev => ({ 
                    ...prev, 
                    priority: result.priority,
                    suggestedPriority: result.priority
                }));
                toast.success(`Sugerencia de prioridad: ${getPriorityText(result.priority)}`);
            }
        } catch (error) {
            console.error('Error al obtener sugerencia:', error);
            toast.error('Error al obtener sugerencia de prioridad');
        } finally {
            setSuggesting(false);
        }
    };

    // Función auxiliar para obtener el texto de la prioridad
    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return priority;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-zinc-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
                {window.location.pathname.includes('/tasks/new') ? 'Crear Nueva Tarea' : 'Editar Tarea'}
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Título
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        required
                        placeholder="Ingresa el título de la tarea"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        rows="4"
                        required
                        placeholder="Describe la tarea en detalle"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha límite
                    </label>
                    <div className="bg-zinc-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">
                            La fecha será sugerida automáticamente por la IA basada en el contenido de la tarea
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Prioridad
                        </label>
                        <button
                            type="button"
                            onClick={handleSuggestPriority}
                            disabled={suggesting || !formData.description}
                            className={`text-sm px-3 py-1 rounded-lg transition-all duration-300 ${
                                suggesting || !formData.description
                                    ? 'bg-zinc-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {suggesting ? 'Analizando...' : 'Sugerir prioridad'}
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`flex-1 p-3 rounded-lg ${
                            formData.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            formData.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                            {formData.priority === 'high' ? 'Alta' :
                             formData.priority === 'medium' ? 'Media' : 'Baja'}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        La prioridad se calcula automáticamente según la fecha límite y el contenido de la descripción
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={onClose || (() => navigate('/tasks'))}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}

export default TaskForm;