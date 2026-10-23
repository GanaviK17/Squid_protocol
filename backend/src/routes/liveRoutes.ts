import { Router } from 'express';
import { sseService } from '../services/sseService.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/stream', (req, res) => {
  const clientId = uuidv4();
  sseService.addClient(clientId, res);
});

export default router;
