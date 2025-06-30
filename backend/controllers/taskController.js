const Task = require('../models/Task');
const User = require('../models/User');
const Subtask = require('../models/Subtask');
const { generateSuggestedDate, generatePriority } = require('../utils/aiSuggestions');
const { createNotification } = require('./notificationController');

const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority = 'Media', 
      suggestedDate: userDate,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        message: 'Por favor, proporcione un título y descripción para la tarea',
      });
    }

    const taskData = {
      title,
      description,
      priority,
      user: req.user.id,
      suggestedDate: userDate ? new Date(userDate) : new Date(),
    };
    
    const task = await Task.create(taskData);
    const createdTask = await Task.findById(task._id).populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      data: createdTask
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al crear la tarea',
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const query = {
      $or: [
        { user: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    };

    const tasks = await Task.find(query).populate('user', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('user', 'name email username')
      .populate({
        path: 'sharedWith.user',
        select: 'name email username'
      })
      .populate('subtasks');

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const isOwner = task.user._id.toString() === req.user.id.toString();
    const isSharedWithUser = task.sharedWith.some(
      share => share.user && share.user._id && share.user._id.toString() === req.user.id.toString()
    );
    
    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta tarea' });
    }

    // Calcular el rol del usuario para esta tarea
    let userRole = 'lector'; // Rol por defecto
    if (isOwner) {
      userRole = 'propietario';
    } else if (isSharedWithUser) {
      const shareInfo = task.sharedWith.find(share => 
        share.user && share.user._id && share.user._id.toString() === req.user.id.toString()
      );
      if (shareInfo) {
        userRole = shareInfo.role;
      }
    }
    
    // Crear el objeto de respuesta con los permisos incluidos
    const taskWithPermissions = {
      ...task.toObject(),
      userPermissions: {
        isOwner,
        role: userRole,
        canEdit: isOwner || userRole === 'editor',
        canDelete: isOwner, // Solo el propietario puede eliminar
        canShare: isOwner   // Solo el propietario puede compartir
      }
    };

    res.json(taskWithPermissions);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        
        const isOwner = task.user.toString() === req.user.id;
        const shareInfo = task.sharedWith.find(s => s.user.toString() === req.user.id);
        const canEdit = isOwner || (shareInfo && shareInfo.role === 'editor');

        if (!canEdit) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta tarea' });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    await task.deleteOne();
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const shareTask = async (req, res) => {
    const { userId, role } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Solo el propietario puede compartir la tarea' });
        }

        const userToShare = await User.findById(userId);
        if (!userToShare) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (task.sharedWith.some(share => share.user.toString() === userId)) {
            return res.status(400).json({ message: 'La tarea ya está compartida con este usuario' });
        }
        
        task.sharedWith.push({ user: userId, role });
        await task.save();

        await createNotification(userId, req.user.id, task._id, 'share', `${req.user.username} ha compartido una tarea contigo: ${task.title}`);

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const removeUserFromTask = async (req, res) => {
    const { userId } = req.params;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Solo el propietario puede remover usuarios' });
        }

        task.sharedWith = task.sharedWith.filter(share => share.user.toString() !== userId);
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const getSubtasks = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('subtasks');
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        res.json(task.subtasks);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const addSubtask = async (req, res) => {
    const { title } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

        const newSubtask = { title, completed: false };
        task.subtasks.push(newSubtask);
        await task.save();
        
        const updatedTask = await Task.findById(req.params.id).populate('subtasks');
        res.status(201).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const updateSubtask = async (req, res) => {
    const { subtaskId } = req.params;
    const { title, completed } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) return res.status(404).json({ message: 'Subtarea no encontrada' });

        if (title !== undefined) subtask.title = title;
        if (completed !== undefined) subtask.completed = completed;
        
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate('subtasks');
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const deleteSubtask = async (req, res) => {
    const { subtaskId } = req.params;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) return res.status(404).json({ message: 'Subtarea no encontrada' });
        
        subtask.deleteOne();
        
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate('subtasks');
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Nuevo endpoint para generar prioridad automáticamente
const generateTaskPriority = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un título o descripción para generar la prioridad'
      });
    }
    
    const priority = await generatePriority(title, description);
    
    res.json({
      success: true,
      data: { priority }
    });
  } catch (error) {
    console.error('Error al generar prioridad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la prioridad automáticamente'
    });
  }
};

// Nuevo endpoint para generar fecha sugerida automáticamente
const generateTaskDate = async (req, res) => {
  try {
    const { priority = 'Media' } = req.body;
    
    const suggestedDate = await generateSuggestedDate(priority);
    
    res.json({
      success: true,
      data: { 
        suggestedDate: suggestedDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
      }
    });
  } catch (error) {
    console.error('Error al generar fecha sugerida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la fecha sugerida automáticamente'
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  removeUserFromTask,
  getSubtasks,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  generateTaskPriority,
  generateTaskDate,
};