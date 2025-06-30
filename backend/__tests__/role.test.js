const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Role = require('../models/Role');
const roleRoutes = require('../routes/roleRoutes');

// Mock más explícito del middleware de autenticación
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => next(),
  admin: (req, res, next) => next(),
  checkRolePermission: (permission) => (req, res, next) => next(),
}));

// Crear una app de Express solo para esta prueba
const app = express();
app.use(express.json());
app.use('/api/roles', roleRoutes);

describe('Role API', () => {

  afterEach(async () => {
    await Role.deleteMany();
  });

  describe('GET /api/roles', () => {
    it('should return an empty array when no roles exist', async () => {
      const res = await request(app).get('/api/roles');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(0);
    });

    it('should return all roles', async () => {
      const rolesData = [
        { name: 'admin', description: 'Administrator', permissions: { create: true, read: true, update: true, delete: true } },
        { name: 'user', description: 'User', permissions: { read: true } }
      ];
      await Role.insertMany(rolesData);

      const res = await request(app).get('/api/roles');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name', 'admin');
    });
  });
}); 