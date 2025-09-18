import { Router } from 'express';
import { AtividadeController } from '../controller/atividadeController.js';
import { authenticate, authorize, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Públicas
router.get('/', AtividadeController.listar);
router.get('/:id', AtividadeController.buscarPorId);

// Professores/Admin
router.post('/', authenticate, authorize('professor', 'admin'), AtividadeController.criar);
router.put('/:id', authenticate, authorize('professor', 'admin'), AtividadeController.atualizar);
router.delete('/:id', authenticate, authorize('professor', 'admin'), AtividadeController.deletar);
router.delete('/:id/permanentemente', authenticate, requireAdmin, AtividadeController.deletarPermanentemente);

export default router;


