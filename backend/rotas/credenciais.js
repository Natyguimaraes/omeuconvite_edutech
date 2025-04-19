import { Router } from 'express';
import { gerarCredencial } from '../controller/credencialController.js'; 

const router = Router();

router.post('/', gerarCredencial);

export { router as credenciaisRouter };