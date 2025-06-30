const Notification = require('../models/Notification');
const User = require('../models/User');

// Obtener todas las notificaciones del usuario actual
const getNotifications = async (req, res) => {
  try {
    console.log(`Buscando notificaciones para el usuario: ${req.user._id}`);
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username email')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
      
    console.log(`Se encontraron ${notifications.length} notificaciones`);

    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Marcar una notificación como leída
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar que la notificación pertenezca al usuario actual
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta notificación' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear una nueva notificación (función interna para usar en otros controladores)
const createNotification = async (recipientId, senderId, taskId, type, message) => {
  try {
    console.log(`Creando notificación: Recipient=${recipientId}, Sender=${senderId}, Task=${taskId}, Type=${type}`);
    
    // Verificar que los IDs sean válidos
    if (!recipientId || !senderId) {
      console.error('Faltan IDs necesarios para crear notificación (receptor o emisor)');
      throw new Error('Faltan IDs necesarios para crear notificación');
    }
    
    // Crear la notificación
    const notificationData = {
      recipient: recipientId,
      sender: senderId,
      type,
      message
    };

    if (taskId) {
      notificationData.task = taskId;
    }

    const notification = await Notification.create(notificationData);
    
    console.log(`Notificación creada con ID: ${notification._id}`);
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    // No relanzar el error para no detener operaciones principales como compartir tarea
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};