import { Router } from 'express';
import { RespostaAtividadeController } from '../controller/respostaAtividadeController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Criar resposta (qualquer usuário autenticado)
router.post('/', authenticate, RespostaAtividadeController.criar);

// Buscar resposta por ID
router.get('/:id', authenticate, RespostaAtividadeController.buscarPorId);

// Listar respostas de uma atividade (professor/admin)
router.get('/atividade/:atividadeId', authenticate, authorize('professor', 'admin'), RespostaAtividadeController.listarPorAtividade);

// Listar respostas do usuário autenticado
router.get('/minhas', authenticate, RespostaAtividadeController.listarMinhas);

// Atualizar resposta
router.put('/:id', authenticate, RespostaAtividadeController.atualizar);

// Deletar resposta
router.delete('/:id', authenticate, RespostaAtividadeController.deletar);

export default router;


