import Task from '../models/task.model.js';

export const createTask = async (req, res) => {
    try {
        const { title, description, deadline, priority } = req.body;
        const userId = req.user.id;

        const task = new Task({
            title,
            description,
            deadline,
            priority,
            user: userId
        });

        await task.save();
        
        res.status(201).json({
            message: 'Tarea creada exitosamente',
            task
        });
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ 
            message: 'Error al crear la tarea',
            error: error.message 
        });
    }
};

export const requestTaskSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Verificar permisos
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Obtener nuevas sugerencias
        const suggestions = await task.getAISuggestions();
        if (!suggestions) {
            return res.status(500).json({ message: 'No se pudieron generar sugerencias' });
        }

        // Actualizar la tarea con las nuevas sugerencias
        task.suggestedDeadline = new Date(suggestions.suggestedDeadline);
        task.suggestedPriority = suggestions.suggestedPriority;
        task.suggestionExplanation = suggestions.explanation;
        await task.save();

        // Obtener la tarea actualizada
        const updatedTask = await Task.findById(task._id);

        res.json({
            message: 'Sugerencias actualizadas exitosamente',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error al solicitar sugerencias:', error);
        res.status(500).json({ 
            message: 'Error al solicitar sugerencias',
            error: error.message 
        });
    }
};