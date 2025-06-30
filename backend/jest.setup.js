const mongoose = require('mongoose');

// Aumentar el tiempo de espera por defecto de Jest a 30 segundos
jest.setTimeout(30000);

beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/smarth-task-test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
}); 