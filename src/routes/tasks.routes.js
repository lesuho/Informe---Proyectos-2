import {Router} from 'express'
import {authRequired} from '../middlewares/validateToken.js'
import {getTasks, getTask, createTask, updateTask, deleteTask, getWeeklyMetrics, shareTask, removeShare} from '../controllers/tasks.controller.js'
import {auth} from '../middlewares/auth.middleware.js'

const router = Router()

// Task management routes
router.get('/', auth, getTasks)
router.get('/metrics/weekly', auth, getWeeklyMetrics)
router.get('/:id', auth, getTask)
router.post('/', auth, createTask)
router.delete('/:id', auth, deleteTask)
router.put('/:id', auth, updateTask)

// Task sharing routes
router.post('/:taskId/share', auth, shareTask)
router.delete('/:taskId/share/:userId', auth, removeShare)

export default router