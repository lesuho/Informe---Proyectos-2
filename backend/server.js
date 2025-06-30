const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');

// Configuración de variables de entorno
dotenv.config();

// Inicialización de la aplicación Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.38:3000'  // Agrega aquí otras IPs si es necesario
];

// Configuración de CORS mejorada
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔹 Solicitud recibida desde el origen:', origin);
    
    // Lista de orígenes permitidos
    const allAllowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://192.168.1.38:3000',
      'http://192.168.1.38:5000',
      'http://localhost',
      'http://127.0.0.1',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      console.log('🔹 Modo desarrollo: Permitiendo cualquier origen');
      return callback(null, true);
    }
    
    // Permitir solicitudes sin 'origin' (como aplicaciones móviles o curl)
    if (!origin) {
      console.log('🔹 Solicitud sin origen, permitiendo...');
      return callback(null, true);
    }
    
    // Verificar si el origen está permitido
    if (allAllowedOrigins.includes(origin)) {
      console.log('✅ Origen permitido:', origin);
      return callback(null, true);
    }
    
    // Verificar si es un subdominio de localhost
    if (origin.includes('//localhost') || origin.includes('//127.0.0.1')) {
      console.log('🌐 Origen local detectado, permitiendo:', origin);
      return callback(null, true);
    }
    
    console.log('❌ Origen no permitido por CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Permitir credenciales
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials',
    'X-Access-Token',
    'x-access-token',
    'x-auth-token',
    'x-requested-with',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
    'X-File-Name',
    'Authorization',
    'x-auth-token',
    'x-access-token',
    'x-requested-with',
    'Set-Cookie',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'X-CSRF-Token'
  ],
  optionsSuccessStatus: 200, // Algunos clientes (ej: Android) pueden tener problemas con 204
  maxAge: 600, // Tiempo de caché para preflight (en segundos)
  preflightContinue: false
};

// Agregar middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));

// Parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Manejar solicitudes OPTIONS (preflight) para todas las rutas
app.options('*', cors(corsOptions));

// Middleware para agregar headers de CORS manualmente
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Solo conectar a la base de datos si no estamos en entorno de prueba
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Rutas
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const roleRoutes = require('./routes/roleRoutes');
const taskPermissionRoutes = require('./routes/taskPermissionRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/task-permissions', taskPermissionRoutes);
app.use('/api/chat', chatRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Tareas funcionando correctamente');
});

// Compartir io para usarlo en los controladores
app.set('io', io);

// Lógica de Socket.IO
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado:', socket.id);

  // Unirse a una sala basada en el ID de usuario
  const userId = socket.handshake.query.userId;
  if (userId) {
    console.log(`Usuario ${userId} se ha unido a su sala.`);
    socket.join(userId);
  }

  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado:', socket.id);
  });
});

// Middleware para manejo de errores
app.use(notFound);
app.use(errorHandler);

// Exportar la app para pruebas y iniciar el servidor si no está en modo de prueba
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
} else {
  module.exports = app;
}