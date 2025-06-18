const Task = require('../models/Task');
const User = require('../models/User');
const { generateSuggestedDate, generatePriority } = require('../utils/aiSuggestions');
const { createNotification } = require('./notificationController');

// Exportar cada función individualmente
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Primero determinar la prioridad
    const priority = await generatePriority(title, description);
    
    // Luego generar fecha sugerida basada en la prioridad
    const suggestedDate = await generateSuggestedDate(priority);

    const task = await Task.create({
      title,
      description,
      suggestedDate,
      priority,
      user: req.user._id  // Asegurarse de que coincida con el campo en el modelo
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    // Buscar tareas propias y compartidas con el usuario
    const tasks = await Task.find({
      $or: [
        { user: req.user._id },
        { 'sharedWith.user': req.user._id } // Modificar esta línea para buscar correctamente en el array de sharedWith
      ]
    }).populate('user', 'name email');

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('user', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar si el usuario tiene acceso a la tarea
    const isOwner = task.user._id.toString() === req.user._id.toString();
    const isSharedWithUser = task.sharedWith.some(
      share => share.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta tarea' });
    }

    // Agregar información sobre los permisos del usuario actual
    const userRole = isOwner 
      ? 'propietario' 
      : task.sharedWith.find(share => share.user._id.toString() === req.user._id.toString()).role;

    const taskWithPermissions = {
      ...task.toObject(),
      userPermissions: {
        isOwner,
        role: userRole,
        canEdit: isOwner || userRole === 'editor',
        canDelete: isOwner || userRole === 'editor',
        canShare: isOwner
      }
    };

    res.json(taskWithPermissions);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    
    // Buscar si el usuario actual está en la lista de compartidos
    const sharedInfo = task.sharedWith.find(
      share => share.user.toString() === req.user._id.toString()
    );
    
    // Verificar si el usuario tiene permisos de edición
    const canEdit = isOwner || (sharedInfo && sharedInfo.role === 'editor');
    
    if (!canEdit) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta tarea' });
    }

    // Preparar datos de actualización
    const updateData = { ...req.body };
    
    // Si el título o la descripción han cambiado, recalcular la prioridad
    if (updateData.title !== task.title || updateData.description !== task.description) {
      const title = updateData.title || task.title;
      const description = updateData.description || task.description;
      
      // Generar nueva prioridad
      const newPriority = await generatePriority(title, description);
      updateData.priority = newPriority;
      
      // Generar nueva fecha sugerida basada en la nueva prioridad
      updateData.suggestedDate = await generateSuggestedDate(newPriority);
      
      console.log(`Tarea actualizada: Prioridad ${newPriority}, Fecha: ${updateData.suggestedDate}`);
    }

    // Verificar si la tarea se está marcando como completada
    const taskWasCompleted = !task.completed && updateData.completed === true;

    // Actualizar tarea
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Si la tarea fue completada por alguien que no es el propietario, notificar al propietario
    if (taskWasCompleted && !isOwner) {
      await createNotification(
        task.user, // ID del propietario de la tarea
        req.user._id, // ID del usuario que completó la tarea
        task._id,
        'task_complete',
        `${req.user.username || req.user.email} ha completado la tarea: ${task.title}`
      );
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    
    // Buscar si el usuario actual está en la lista de compartidos
    const sharedInfo = task.sharedWith && task.sharedWith.find(
      share => share.user && share.user.toString() === req.user._id.toString()
    );
    
    // Verificar si el usuario tiene permisos de edición
    const canEdit = isOwner || (sharedInfo && sharedInfo.role === 'editor');
    
    if (!canEdit) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea' });
    }

    // Eliminar tarea
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};

// Modificar la función shareTask para crear una notificación
exports.shareTask = async (req, res) => {
  try {
    console.log('Compartiendo tarea:', req.params.id);
    console.log('Datos recibidos:', req.body);
    
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Por favor proporciona un correo electrónico' });
    }

    // Verificar si el rol es válido
    if (role && !['editor', 'lector'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Debe ser "editor" o "lector"' });
    }

    // Buscar al usuario por correo electrónico
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar la tarea
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar si el usuario actual es el propietario de la tarea
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para compartir esta tarea' });
    }

    // Verificar si la tarea ya está compartida con este usuario
    const alreadyShared = task.sharedWith && task.sharedWith.some(
      share => share.user && share.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: 'La tarea ya está compartida con este usuario' });
    }

    // Inicializar sharedWith si no existe
    if (!task.sharedWith) {
      task.sharedWith = [];
    }

    // Agregar usuario a la lista de compartidos con el rol especificado
    task.sharedWith.push({
      user: userToShare._id,
      role: role || 'lector' // Por defecto es lector si no se especifica
    });

    await task.save();

    // Crear notificación para el usuario con quien se compartió la tarea
    await createNotification(
      userToShare._id,
      req.user._id,
      task._id,
      'share_task',
      `${req.user.username || req.user.email} ha compartido contigo la tarea: ${task.title}`
    );

    res.json(task);
  } catch (error) {
    console.error('Error al compartir tarea:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};

// Modificar la función updateTask para crear una notificación cuando se completa una tarea
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Verificar si la tarea existe
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    
    // Buscar si el usuario actual está en la lista de compartidos
    const sharedInfo = task.sharedWith.find(
      share => share.user.toString() === req.user._id.toString()
    );
    
    // Verificar si el usuario tiene permisos de edición
    const canEdit = isOwner || (sharedInfo && sharedInfo.role === 'editor');
    
    if (!canEdit) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta tarea' });
    }

    // Preparar datos de actualización
    const updateData = { ...req.body };
    
    // Si el título o la descripción han cambiado, recalcular la prioridad
    if (updateData.title !== task.title || updateData.description !== task.description) {
      const title = updateData.title || task.title;
      const description = updateData.description || task.description;
      
      // Generar nueva prioridad
      const newPriority = await generatePriority(title, description);
      updateData.priority = newPriority;
      
      // Generar nueva fecha sugerida basada en la nueva prioridad
      updateData.suggestedDate = await generateSuggestedDate(newPriority);
      
      console.log(`Tarea actualizada: Prioridad ${newPriority}, Fecha: ${updateData.suggestedDate}`);
    }

    // Verificar si la tarea se está marcando como completada
    const taskWasCompleted = !task.completed && updateData.completed === true;

    // Actualizar tarea
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Si la tarea fue completada por alguien que no es el propietario, notificar al propietario
    if (taskWasCompleted && !isOwner) {
      await createNotification(
        task.user, // ID del propietario de la tarea
        req.user._id, // ID del usuario que completó la tarea
        task._id,
        'task_complete',
        `${req.user.username || req.user.email} ha completado la tarea: ${task.title}`
      );
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};

exports.removeSharedUser = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const isOwner = task.user.toString() === req.user._id.toString();
    const sharedInfo = task.sharedWith.find(
      share => share.user.toString() === req.user._id.toString()
    );

    const canEdit = isOwner || (sharedInfo && sharedInfo.role === 'editor');

    if (!canEdit) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios compartidos de esta tarea' });
    }

    task.sharedWith = task.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );

    await task.save();

    res.json({ message: 'Usuario compartido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario compartido:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
}

// Función para obtener los permisos de un usuario para una tarea específica
exports.getTaskPermissions = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const isOwner = task.user.toString() === req.user._id.toString();
    const sharedInfo = task.sharedWith.find(
      share => share.user.toString() === req.user._id.toString()
    );

    const userRole = isOwner 
      ? 'propietario' 
      : sharedInfo ? sharedInfo.role : 'lector';

    const permissions = {
      isOwner,
      role: userRole,
      canEdit: isOwner || userRole === 'editor',
      canDelete: isOwner || userRole === 'editor',
      canShare: isOwner
    };

    res.json(permissions);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}