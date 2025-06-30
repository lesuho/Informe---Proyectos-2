const TaskPermission = require('../models/TaskPermission');
const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Obtener todos los permisos de una tarea
exports.getTaskPermissions = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    // Verificar que la tarea existe
    const task = await Task.findById(taskId).populate('sharedWith.user');
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario tiene acceso a la tarea (propietario o compartido)
    const isOwner = task.user.toString() === req.user._id.toString();
    const isSharedWith = task.sharedWith.some(p => p.user && p.user._id.toString() === req.user._id.toString());

    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'No tienes permiso para ver los permisos de esta tarea' });
    }
    
    // Obtener permisos
    console.log(`Obteniendo permisos para la tarea ${taskId}`);
    const permissions = await TaskPermission.find({ taskId })
      .populate('userId', 'name email username');
    
    // Transformar los datos para que el campo userId poblado se asigne a user
    const transformedPermissions = permissions.map(permission => {
      const permissionObj = permission.toObject();
      permissionObj.user = permissionObj.userId;
      return permissionObj;
    });
    
    console.log(`Se encontraron ${transformedPermissions.length} permisos`);
    res.json(transformedPermissions);
  } catch (error) {
    console.error('Error al obtener permisos de tarea:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Añadir un permiso a una tarea
exports.addTaskPermission = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, email, role } = req.body;
    
    console.log(`Intentando añadir permiso - TaskId: ${taskId}, Email: ${email}, UserId: ${userId}, Role: ${role}`);
    
    // Verificar que la tarea existe
    const task = await Task.findById(taskId);
    if (!task) {
      console.log('Tarea no encontrada');
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario tiene permiso para compartir la tarea
    const isOwner = task.user.toString() === req.user._id.toString();
    if (!isOwner) {
      console.log('Usuario no tiene permisos para compartir');
      return res.status(403).json({ message: 'No tienes permiso para compartir esta tarea' });
    }
    
    // Determinar el userId (puede venir directamente o hay que buscarlo por email)
    let userIdToShare = userId;
    
    if (!userIdToShare && email) {
      console.log(`Buscando usuario por email: ${email}`);
      const userByEmail = await User.findOne({ email });
      if (!userByEmail) {
        console.log('Usuario no encontrado por email');
        return res.status(404).json({ message: 'Usuario no encontrado con ese email' });
      }
      userIdToShare = userByEmail._id;
      console.log(`Usuario encontrado por email, ID: ${userIdToShare}`);
    }
    
    if (!userIdToShare) {
      console.log('No se proporcionó userId ni email válido');
      return res.status(400).json({ message: 'Debes proporcionar un userId o email válido' });
    }
    
    // Verificar que el usuario a compartir existe
    const userToShare = await User.findById(userIdToShare);
    if (!userToShare) {
      console.log(`Usuario con ID ${userIdToShare} no encontrado`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que no se está compartiendo con el propietario
    if (userIdToShare === task.user.toString()) {
      console.log('Intentando compartir con el propietario');
      return res.status(400).json({ message: 'No puedes compartir la tarea con su propietario' });
    }
    
    // Verificar si ya existe un permiso para este usuario en esta tarea
    console.log(`Verificando si ya existe un permiso para el usuario ${userIdToShare} en la tarea ${taskId}`);
    const existingPermission = await TaskPermission.findOne({ taskId, userId: userIdToShare });
    if (existingPermission) {
      console.log('Permiso existente encontrado, actualizando rol');
      // Actualizar el rol si ya existe
      existingPermission.role = role;
      await existingPermission.save();
      
      // Actualizar también en el array sharedWith de la tarea para mantener compatibilidad
      const sharedIndex = task.sharedWith.findIndex(share => share.user.toString() === userIdToShare);
      if (sharedIndex >= 0) {
        task.sharedWith[sharedIndex].role = role;
      } else {
        task.sharedWith.push({ user: userIdToShare, role });
      }
      await task.save();
      
      console.log('Permiso actualizado correctamente');
      res.json(existingPermission);
    } else {
      console.log('Creando nuevo permiso');
      // Crear nuevo permiso
      const newPermission = await TaskPermission.create({
        taskId,
        userId: userIdToShare,
        role
      });
      
      // Añadir también al array sharedWith de la tarea para mantener compatibilidad
      task.sharedWith.push({ user: userIdToShare, role });
      await task.save();
      
      // Crear notificación para el usuario
      console.log(`Creando notificación para el usuario ${userIdToShare}`);
      try {
        const notification = await createNotification(
          userIdToShare,
          req.user._id,
          taskId,
          'share_task', // Usamos 'share_task' que está en el enum del modelo
          `${req.user.name || req.user.email} ha compartido contigo la tarea: ${task.title}`
        );
        console.log('Notificación creada:', notification);
      } catch (notifError) {
        console.error('Error al crear notificación:', notifError);
        // No devolvemos error para no interrumpir el flujo principal
      }
      
      console.log('Permiso creado correctamente');
      res.status(201).json(newPermission);
    }
  } catch (error) {
    console.error('Error al añadir permiso de tarea:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un permiso de tarea
exports.updateTaskPermission = async (req, res) => {
  try {
    const { taskId, permissionId } = req.params;
    const { role } = req.body;
    
    // Verificar que la tarea existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario tiene permiso para modificar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para modificar los permisos de esta tarea' });
    }
    
    // Buscar y actualizar el permiso
    const permission = await TaskPermission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }
    
    // Verificar que el permiso corresponde a la tarea
    if (permission.taskId.toString() !== taskId) {
      return res.status(400).json({ message: 'El permiso no corresponde a esta tarea' });
    }
    
    // Actualizar el rol
    permission.role = role;
    await permission.save();
    
    // Actualizar también en el array sharedWith de la tarea para mantener compatibilidad
    const sharedIndex = task.sharedWith.findIndex(share => share.user.toString() === permission.userId.toString());
    if (sharedIndex >= 0) {
      task.sharedWith[sharedIndex].role = role;
      await task.save();
    }
    
    res.json(permission);
  } catch (error) {
    console.error('Error al actualizar permiso de tarea:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un permiso de tarea
exports.deleteTaskPermission = async (req, res) => {
  try {
    const { taskId, permissionId } = req.params;
    
    // Verificar que la tarea existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario tiene permiso para eliminar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar los permisos de esta tarea' });
    }
    
    // Buscar el permiso
    const permission = await TaskPermission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }
    
    // Verificar que el permiso corresponde a la tarea
    if (permission.taskId.toString() !== taskId) {
      return res.status(400).json({ message: 'El permiso no corresponde a esta tarea' });
    }
    
    // Guardar el userId antes de eliminar el permiso
    const userId = permission.userId;
    
    // Eliminar el permiso
    await TaskPermission.findByIdAndDelete(permissionId);
    
    // Eliminar también del array sharedWith de la tarea para mantener compatibilidad
    task.sharedWith = task.sharedWith.filter(share => share.user.toString() !== userId.toString());
    await task.save();
    
    res.json({ message: 'Permiso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar permiso de tarea:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un permiso de tarea por userId
exports.deleteTaskPermissionByUserId = async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    
    console.log(`Intentando eliminar permiso - TaskId: ${taskId}, UserId: ${userId}`);
    
    // Verificar que la tarea existe
    const task = await Task.findById(taskId);
    if (!task) {
      console.log('Tarea no encontrada');
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    // Verificar que el usuario tiene permiso para eliminar permisos
    const isOwner = task.user.toString() === req.user._id.toString();
    if (!isOwner) {
      console.log('Usuario no tiene permisos para eliminar');
      return res.status(403).json({ message: 'No tienes permiso para eliminar los permisos de esta tarea' });
    }
    
    // Buscar el permiso por userId y taskId
    console.log('Buscando permiso en la base de datos...');
    const permission = await TaskPermission.findOne({ 
      taskId: taskId,
      userId: userId 
    });
    
    if (!permission) {
      console.log('Permiso no encontrado, buscando en sharedWith...');
      
      // Verificar si el usuario está en sharedWith aunque no tenga un registro en TaskPermission
      const userInSharedWith = task.sharedWith.find(share => share.user.toString() === userId);
      
      if (userInSharedWith) {
        console.log('Usuario encontrado en sharedWith, eliminando...');
        // Eliminar del array sharedWith
        task.sharedWith = task.sharedWith.filter(share => share.user.toString() !== userId);
        await task.save();
        return res.json({ message: 'Usuario eliminado correctamente de la tarea compartida' });
      } else {
        console.log('Usuario no encontrado en ninguna parte');
        return res.status(404).json({ message: 'Permiso no encontrado para este usuario' });
      }
    }
    
    console.log(`Permiso encontrado con ID: ${permission._id}, eliminando...`);
    
    // Eliminar el permiso
    await TaskPermission.findByIdAndDelete(permission._id);
    
    // Eliminar también del array sharedWith de la tarea para mantener compatibilidad
    task.sharedWith = task.sharedWith.filter(share => share.user.toString() !== userId);
    await task.save();
    
    console.log('Permiso eliminado correctamente');
    res.json({ message: 'Permiso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar permiso de tarea por userId:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
