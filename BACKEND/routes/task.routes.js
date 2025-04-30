import { Router } from 'express';
import { 
    getTasks, 
    createTask, 
    getTask, 
    updateTask, 
    deleteTask,
    requestTaskSuggestion 
} from '../controllers/task.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

router.get('/tasks', authRequired, getTasks);
router.post('/tasks', authRequired, createTask);
router.get('/tasks/:id', authRequired, getTask);
router.put('/tasks/:id', authRequired, updateTask);
router.delete('/tasks/:id', authRequired, deleteTask);
router.post('/tasks/:id/suggest', authRequired, requestTaskSuggestion);

export default router; 