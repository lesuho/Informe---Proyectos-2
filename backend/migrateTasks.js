const mongoose = require('mongoose');
const Task = require('./models/Task');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smarth-task';

async function migrateTasks() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🔍 Buscando tareas sin campo estado...');
    const tasksWithoutEstado = await Task.find({ estado: { $exists: false } });
    console.log(`📊 Encontradas ${tasksWithoutEstado.length} tareas sin campo estado`);

    if (tasksWithoutEstado.length === 0) {
      console.log('✅ Todas las tareas ya tienen el campo estado');
      return;
    }

    console.log('🔄 Iniciando migración...');
    let updatedCount = 0;

    for (const task of tasksWithoutEstado) {
      let newEstado = 'Pendiente';
      
      // Determinar el estado basado en completed y progress
      if (task.completed || task.progress === 100) {
        newEstado = 'Completada';
      } else if (task.progress > 0) {
        newEstado = 'En progreso';
      }

      // Actualizar la tarea
      await Task.findByIdAndUpdate(task._id, {
        estado: newEstado
      });

      updatedCount++;
      console.log(`✅ Tarea ${task._id} actualizada con estado: ${newEstado}`);
    }

    console.log(`🎉 Migración completada. ${updatedCount} tareas actualizadas.`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateTasks();
}

module.exports = migrateTasks; 