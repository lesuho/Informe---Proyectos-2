const Notification = require('../models/Notification');
const User = require('../models/User');

// Obtener todas las notificaciones del usuario actual
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username email')
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
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
exports.markAllAsRead = async (req, res) => {
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
exports.createNotification = async (recipientId, senderId, taskId, type, message) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      task: taskId,
      type,
      message
    });
    
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return null;
  }
};