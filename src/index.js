import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import aiRoutes from './routes/ai.routes.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') });

// Verificar variables de entorno requeridas
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'HF_API_TOKEN'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: La variable de entorno ${envVar} no está definida`);
        process.exit(1);
    }
}

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Puerto de desarrollo de Vite
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});