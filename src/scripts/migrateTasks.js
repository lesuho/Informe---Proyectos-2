import mongoose from 'mongoose';
import Task from '../models/task.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateTasks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Encontrar todas las tareas que tienen date pero no deadline
        const tasks = await Task.find({
            $or: [
                { date: { $exists: true } },
                { deadline: null }
            ]
        });

        console.log(`Encontradas ${tasks.length} tareas para migrar`);

        for (const task of tasks) {
            if (task.date && !task.deadline) {
                task.deadline = task.date;
                task.date = undefined;
                await task.save();
                console.log(`Migrada tarea ${task._id}: date -> deadline`);
            }
        }

        console.log('Migración completada');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
};

migrateTasks(); 