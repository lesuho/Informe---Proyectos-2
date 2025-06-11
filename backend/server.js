const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Configuración de variables de entorno
dotenv.config();

// Inicialización de la aplicación Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);  // Detener la aplicación si no se puede conectar a MongoDB
});

// Rutas
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Tareas funcionando correctamente');
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});