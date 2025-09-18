import express from 'express';
import { UsuarioService } from '../services/usuarioService.js';
import type { AuthRequest } from '../middlewares/auth.js';
import mongoose from 'mongoose';

export class UsuarioController {
  // Criar novo usuário
  static async criarUsuario(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { nome, email, senha, role } = req.body;
      
      // Validação básica
      if (!nome || !email || !senha) {
        res.status(400).json({ 
          erro: 'Nome, email e senha são obrigatórios' 
        });
        return;
      }

      // Validar role
      const rolesPermitidos = ['aluno', 'professor', 'admin'];
      if (role && !rolesPermitidos.includes(String(role).toLowerCase())) {
        res.status(400).json({
          erro: "Role inválido. Utilize 'aluno', 'professor' ou 'admin'"
        });
        return;
      }

      // Verificar se email já existe
      const emailExiste = await UsuarioService.emailExiste(email);
      if (emailExiste) {
        res.status(400).json({ 
          erro: 'Email já está em uso' 
        });
        return;
      }

      // Verificar se nome já existe
      const nomeJaExiste = await UsuarioService.nomeExiste(nome);
      if (nomeJaExiste) {
        res.status(400).json({
          erro: 'Nome de usuário já está em uso'
        });
        return;
      }

      const novoUsuario = await UsuarioService.criarUsuario({ nome, email, senha, role: role ? String(role).toLowerCase() as any : 'aluno' });

      res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        usuario: {
          id: (novoUsuario as any)._id,
          nome: (novoUsuario as any).nome,
          role: (novoUsuario as any).role
        }
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar todos os usuários
  static async buscarUsuarios(_req: express.Request, res: express.Response): Promise<void> {
    try {
      const usuarios = await UsuarioService.buscarTodosUsuarios();
      res.status(200).json({
        mensagem: 'Lista de usuários',
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar usuário por ID
  static async buscarUsuarioPorId(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      
      const usuario = await UsuarioService.buscarUsuarioPorId(id);
      
      if (!usuario) {
        res.status(404).json({
          erro: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        mensagem: 'Usuário encontrado',
        usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Atualizar usuário
  static async atualizarUsuario(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { nome, email, senha } = req.body;

      // Verificar se o usuário está tentando atualizar seus próprios dados
      if (req.user && req.user.sub !== id) {
        res.status(403).json({
          erro: 'Você só pode atualizar seus próprios dados'
        });
        return;
      }

      // Verificar se usuário existe
      const usuarioExistente = await UsuarioService.buscarUsuarioPorId(id);
      if (!usuarioExistente) {
        res.status(404).json({
          erro: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar se email já existe (se estiver sendo alterado)
      if (email && email !== usuarioExistente.email) {
        const emailExiste = await UsuarioService.emailExiste(email, id);
        if (emailExiste) {
          res.status(400).json({ 
            erro: 'Email já está em uso' 
          });
          return;
        }
      }

      // Verificar se nome já existe (se estiver sendo alterado)
      if (nome && nome !== usuarioExistente.nome) {
        const nomeJaExiste = await UsuarioService.nomeExiste(nome, id);
        if (nomeJaExiste) {
          res.status(400).json({
            erro: 'Nome de usuário já está em uso'
          });
          return;
        }
      }

      const usuarioAtualizado = await UsuarioService.atualizarUsuario(id, { nome, email, senha });

      res.status(200).json({
        mensagem: 'Usuário atualizado com sucesso',
        usuario: usuarioAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Deletar usuário (soft delete)
  static async deletarUsuario(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      console.log('Tentando deletar usuário com ID:', id);

      // Validar se o ID é um ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          erro: 'ID inválido'
        });
        return;
      }

      const usuarioExiste = await UsuarioService.buscarUsuarioPorId(id);
      console.log('Usuário encontrado:', !!usuarioExiste);
      
      if (!usuarioExiste) {
        res.status(404).json({
          erro: 'Usuário não encontrado'
        });
        return;
      }

      console.log('Executando soft delete...');
      const deletado = await UsuarioService.deletarUsuario(id);
      console.log('Resultado do delete:', deletado);
      
      if (deletado) {
        res.status(200).json({
          mensagem: 'Usuário deletado com sucesso (soft delete)'
        });
      } else {
        res.status(500).json({
          erro: 'Erro ao deletar usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Deletar usuário permanentemente (hard delete)
  static async deletarUsuarioPermanentemente(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      console.log('Tentando deletar permanentemente usuário com ID:', id);

      // Validar se o ID é um ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          erro: 'ID inválido'
        });
        return;
      }

      // Buscar usuário (incluindo deletados) para verificar se existe
      const usuarioExiste = await UsuarioService.buscarUsuarioPorIdIncluindoDeletados(id);
      console.log('Usuário encontrado:', !!usuarioExiste);
      
      if (!usuarioExiste) {
        res.status(404).json({
          erro: 'Usuário não encontrado'
        });
        return;
      }

      console.log('Executando hard delete...');
      const deletado = await UsuarioService.deletarUsuarioPermanentemente(id);
      console.log('Resultado do hard delete:', deletado);
      
      if (deletado) {
        res.status(200).json({
          mensagem: 'Usuário deletado permanentemente do banco de dados'
        });
      } else {
        res.status(500).json({
          erro: 'Erro ao deletar usuário permanentemente'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário permanentemente:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // ===== MÉTODOS ADMINISTRATIVOS =====

  // Listar todos os usuários (incluindo deletados) - apenas admin
  static async listarTodosUsuariosAdmin(_req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const usuarios = await UsuarioService.buscarTodosUsuariosIncluindoDeletados();
      res.status(200).json({
        mensagem: 'Lista completa de usuários (incluindo deletados)',
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error('Erro ao listar todos os usuários:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Reativar usuário deletado - apenas admin
  static async reativarUsuario(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          erro: 'ID inválido'
        });
        return;
      }

      const usuario = await UsuarioService.buscarUsuarioPorIdIncluindoDeletados(id);
      if (!usuario) {
        res.status(404).json({
          erro: 'Usuário não encontrado'
        });
        return;
      }

      if ((usuario as any).ativo) {
        res.status(400).json({
          erro: 'Usuário já está ativo'
        });
        return;
      }

      const usuarioReativado = await UsuarioService.reativarUsuario(id);
      
      if (usuarioReativado) {
        res.status(200).json({
          mensagem: 'Usuário reativado com sucesso',
          usuario: usuarioReativado
        });
      } else {
        res.status(500).json({
          erro: 'Erro ao reativar usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }

  // Obter estatísticas de usuários - apenas admin
  static async obterEstatisticasUsuarios(_req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const estatisticas = await UsuarioService.obterEstatisticasUsuarios();
      res.status(200).json({
        mensagem: 'Estatísticas de usuários',
        estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ 
        erro: 'Erro interno do servidor' 
      });
    }
  }
}
