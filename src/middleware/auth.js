import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No autorizado - Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'No autorizado - Usuario no encontrado' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        res.status(401).json({ message: 'No autorizado - Token inválido' });
    }
}; 