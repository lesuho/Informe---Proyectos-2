import User from '../models/user.model.js'
import Task from '../models/task.model.js'

export const createTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "El título y la descripción son requeridos" });
    }

    // Determinar la prioridad basada en palabras clave
    const descLower = description.toLowerCase();
    let priority = 'medium';
    let suggestedDays = 3;

    // Palabras clave para cada nivel de prioridad
    const highPriorityKeywords = ['urgente', 'importante', 'crítico', 'inmediato', 'prioritario', 'emergencia'];
    const lowPriorityKeywords = ['opcional', 'secundario', 'complementario', 'adicional', 'menor'];

    // Determinar prioridad y días sugeridos
    if (highPriorityKeywords.some(keyword => descLower.includes(keyword))) {
      priority = 'high';
      suggestedDays = 1;
    } else if (lowPriorityKeywords.some(keyword => descLower.includes(keyword))) {
      priority = 'low';
      suggestedDays = 7;
    }

    // Calcular fecha sugerida
    const suggestedDeadline = new Date();
    suggestedDeadline.setDate(suggestedDeadline.getDate() + suggestedDays);

    // Create task with calculated data
    const newTask = new Task({
      title,
      description,
      deadline: suggestedDeadline,
      priority,
      user: req.user.id,
      suggestedPriority: priority,
      suggestedDeadline,
      suggestionExplanation: `Prioridad ${priority} asignada basada en el contenido. Fecha límite sugerida: ${suggestedDays} día(s).`
    });

    // Save task
    await newTask.save();

    // Return task with populated fields
    const populatedTask = await Task.findById(newTask._id)
      .populate("user", "username email")
      .populate("sharedWith.user", "username email");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Error en createTask:", error);
    res.status(500).json({ 
      message: "Error al crear la tarea",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export const deleteTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Check if user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta tarea" });
    }

    await Task.findByIdAndDelete(taskId);
    res.sendStatus(204);

  } catch (error) {
    console.error("Error en deleteTask:", error);
    res.status(500).json({ 
      message: "Error al eliminar la tarea",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export const getTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Buscar tareas donde el usuario es propietario o está en sharedWith
    const tasks = await Task.find({
      $or: [
        { user: req.user.id },
        { "sharedWith.user": req.user.id }
      ]
    })
    .populate("user", "username email")
    .populate("sharedWith.user", "username email")
    .sort({ createdAt: -1 }); // Ordenar por fecha de creación, más recientes primero

    // Agregar campo para identificar si la tarea es compartida
    const tasksWithSharedInfo = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.isShared = task.user._id.toString() !== req.user.id;
      return taskObj;
    });

    res.json(tasksWithSharedInfo);
  } catch (error) {
    console.error("Error en getTasks:", error);
    res.status(500).json({ message: "Error al obtener las tareas" });
  }
}

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("user", "username email")
      .populate("sharedWith.user", "username email");

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error en getTask:", error);
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
}

export const updateTask = async (req, res) => {
  try {
    // Verificar que el usuario está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Obtener la tarea actual
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Verificar si el usuario es propietario o editor
    const isOwner = task.user.toString() === req.user.id;
    const isEditor = task.sharedWith.some(share => 
      share.user.toString() === req.user.id && share.role === 'editor'
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "No tienes permiso para actualizar esta tarea" });
    }

    // Si solo se está actualizando el estado de completado
    if ('completed' in req.body) {
      const updateData = {
        completed: req.body.completed,
        completedAt: req.body.completed ? new Date() : null
      };

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("user", "username email")
       .populate("sharedWith.user", "username email");

      return res.json(updatedTask);
    }

    // Para otras actualizaciones, verificar que sea el propietario o editor
    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "No tienes permiso para editar esta tarea" });
    }

    // Si llegamos aquí, es una actualización completa de la tarea
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "El título y la descripción son requeridos" });
    }

    // Determinar la prioridad basada en palabras clave
    const descLower = description.toLowerCase();
    let priority = 'medium';
    let suggestedDays = 3;

    // Palabras clave para cada nivel de prioridad
    const highPriorityKeywords = ['urgente', 'importante', 'crítico', 'inmediato', 'prioritario', 'emergencia'];
    const lowPriorityKeywords = ['opcional', 'secundario', 'complementario', 'adicional', 'menor'];

    // Determinar prioridad y días sugeridos
    if (highPriorityKeywords.some(keyword => descLower.includes(keyword))) {
      priority = 'high';
      suggestedDays = 1;
    } else if (lowPriorityKeywords.some(keyword => descLower.includes(keyword))) {
      priority = 'low';
      suggestedDays = 7;
    }

    // Calcular fecha sugerida
    const suggestedDeadline = new Date();
    suggestedDeadline.setDate(suggestedDeadline.getDate() + suggestedDays);

    // Actualizar la tarea con los nuevos datos
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline: suggestedDeadline,
        priority,
        suggestedPriority: priority,
        suggestedDeadline,
        suggestionExplanation: `Prioridad ${priority} asignada basada en el contenido. Fecha límite sugerida: ${suggestedDays} día(s).`
      },
      { new: true }
    ).populate("user", "username email")
     .populate("sharedWith.user", "username email");

    if (!updatedTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error en updateTask:", error);
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
}

export const shareTask = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Verificar que el email fue proporcionado
    if (!email) {
      return res.status(400).json({ message: "El correo electrónico es requerido" });
    }

    // Buscar el usuario por email
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar la tarea
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Verificar si la tarea ya está compartida con este usuario
    const alreadyShared = task.sharedWith.some(share => 
      share.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: "La tarea ya está compartida con este usuario" });
    }

    // Agregar el usuario a la lista de compartidos
    task.sharedWith.push({ user: userToShare._id, role });
    await task.save();

    // Retornar la tarea actualizada con los campos populados
    const updatedTask = await Task.findById(task._id)
      .populate("user", "username email")
      .populate("sharedWith.user", "username email");

    res.json(updatedTask);
  } catch (error) {
    console.error("Error en shareTask:", error);
    res.status(500).json({ message: "Error al compartir la tarea" });
  }
};

export const removeShare = async (req, res) => {
  try {
    const { userId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    task.sharedWith = task.sharedWith.filter(share => share.user.toString() !== userId);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error en removeShare:", error);
    res.status(500).json({ message: "Error al remover compartir" });
  }
}

export const getWeeklyMetrics = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user.id,
      createdAt: { $gte: startOfWeek }
    });

    // Calcular el tiempo promedio para tareas completadas
    const completedTasks = tasks.filter(t => t.completed);
    let averageTimePerTask = 0;
    
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((acc, task) => {
        if (task.completedAt && task.createdAt) {
          return acc + (task.completedAt - task.createdAt);
        }
        return acc;
      }, 0);
      averageTimePerTask = totalTime / completedTasks.length;
    }

    // Organizar tareas por día de la semana
    const tasksByDay = Array(7).fill(0);
    tasks.forEach(task => {
      const dayOfWeek = new Date(task.createdAt).getDay();
      tasksByDay[dayOfWeek]++;
    });

    res.json({
      completedTasks: completedTasks.length,
      averageTimePerTask,
      tasksByDay
    });
  } catch (error) {
    console.error("Error en getWeeklyMetrics:", error);
    res.status(500).json({ message: "Error al obtener métricas" });
  }
}
