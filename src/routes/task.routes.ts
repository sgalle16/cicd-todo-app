import { Router } from 'express';
import * as TaskController from '../controllers/task.controller';

const router = Router();

router.get('/', TaskController.getTasks);
router.post('/', TaskController.postTask);
router.put('/:id', TaskController.putTask);
router.delete('/:id', TaskController.deleteTaskById);

export default router;
