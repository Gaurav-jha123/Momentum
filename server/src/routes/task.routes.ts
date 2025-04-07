import { Router } from 'express';
import TaskController from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware'; 

const router = Router();

router.use(protect);

router.get('/', TaskController.getUserTasks);

router.post('/', TaskController.createTask);

router.put('/:taskId', TaskController.updateTask);

router.delete('/:taskId', TaskController.deleteTask);


export default router;