// Mock de notificación para evitar errores en la creación de tareas
jest.mock('../controllers/notificationController', () => ({
  createNotification: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const taskRoutes = require('../routes/tasks');
const User = require('../models/User');
const Task = require('../models/Task');

// Mock del middleware de autenticación
let mockUserId;
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: mockUserId };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task API', () => {
  let user;

  beforeAll(async () => {
    // Creamos un usuario de prueba
    user = new User({
      username: 'taskuser',
      email: 'taskuser@example.com',
      password: 'password123'
    });
    await user.save();
    mockUserId = user._id.toString();
  });

  afterEach(async () => {
    // Limpiar las tareas después de cada prueba
    await Task.deleteMany({});
  });
  
  afterAll(async () => {
    // Limpiar el usuario de prueba
    await User.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title', 'Test Task');
      expect(res.body.data.user._id).toBe(mockUserId);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'Test Description' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      await Task.create({
        title: 'User Task 1',
        description: 'Description 1',
        user: mockUserId,
      });
      await Task.create({
        title: 'User Task 2',
        description: 'Description 2',
        user: mockUserId,
      });

      const res = await request(app).get('/api/tasks');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });
}); 