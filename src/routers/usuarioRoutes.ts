import { Router } from 'express';
import { UsuarioController } from '../controller/usuarioController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Rota para criar usuário
router.post('/', UsuarioController.criarUsuario);

// Rota para buscar todos os usuários
router.get('/', UsuarioController.buscarUsuarios);

// Rota para buscar usuário por ID
router.get('/:id', UsuarioController.buscarUsuarioPorId);

// Rota para atualizar usuário (requer autenticação)
router.put('/:id', authenticate, UsuarioController.atualizarUsuario);

// Rota para deletar usuário (soft delete)
router.delete('/:id', UsuarioController.deletarUsuario);

// Rota para deletar usuário permanentemente (hard delete)
router.delete('/:id/permanentemente', UsuarioController.deletarUsuarioPermanentemente);

// ===== ROTAS ADMINISTRATIVAS =====
// Listar todos os usuários (incluindo deletados) - apenas admin
router.get('/admin/todos', authenticate, requireAdmin, UsuarioController.listarTodosUsuariosAdmin);

// Reativar usuário deletado - apenas admin
router.patch('/:id/reativar', authenticate, requireAdmin, UsuarioController.reativarUsuario);

// Estatísticas de usuários - apenas admin
router.get('/admin/estatisticas', authenticate, requireAdmin, UsuarioController.obterEstatisticasUsuarios);

export default router;
