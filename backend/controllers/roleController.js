const Role = require('../models/Role');

// Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener un rol por ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear un nuevo rol
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }
    
    const role = await Role.create({
      name,
      description,
      permissions
    });
    
    res.status(201).json(role);
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un rol
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Verificar si el rol existe
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
      }
    }
    
    // Actualizar rol
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true }
    );
    
    res.json(updatedRole);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un rol
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
