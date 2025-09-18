import express from 'express';
import mongoose from 'mongoose';
import { AtividadeService } from '../services/atividadeService.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class AtividadeController {
  static async criar(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { titulo, descricao, dificuldade, tags, prazo } = req.body;
      if (!titulo || !descricao) {
        res.status(400).json({ erro: 'Título e descrição são obrigatórios' });
        return;
      }
      const autor = req.user?.sub as string;
      const atividade = await AtividadeService.criarAtividade({ titulo, descricao, dificuldade, autor, tags, prazo });
      res.status(201).json({ mensagem: 'Atividade criada', atividade });
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async listar(_req: express.Request, res: express.Response): Promise<void> {
    try {
      const atividades = await AtividadeService.listarAtividades(true);
      res.status(200).json({ total: atividades.length, atividades });
    } catch (error) {
      console.error('Erro ao listar atividades:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async buscarPorId(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }
      const atividade = await AtividadeService.buscarPorId(id);
      if (!atividade || (atividade as any).ativo === false) {
        res.status(404).json({ erro: 'Atividade não encontrada' });
        return;
      }
      res.status(200).json({ atividade });
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async atualizar(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { titulo, descricao, dificuldade, tags, prazo, ativo } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }
      const atividade = await AtividadeService.atualizarAtividade(id, { titulo, descricao, dificuldade, tags, prazo, ativo });
      if (!atividade) {
        res.status(404).json({ erro: 'Atividade não encontrada' });
        return;
      }
      res.status(200).json({ mensagem: 'Atividade atualizada', atividade });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async deletar(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }
      const ok = await AtividadeService.deletarAtividade(id);
      if (!ok) {
        res.status(404).json({ erro: 'Atividade não encontrada' });
        return;
      }
      res.status(200).json({ mensagem: 'Atividade deletada (soft delete)' });
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async deletarPermanentemente(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }
      const ok = await AtividadeService.deletarAtividadePermanentemente(id);
      if (!ok) {
        res.status(404).json({ erro: 'Atividade não encontrada' });
        return;
      }
      res.status(200).json({ mensagem: 'Atividade deletada permanentemente' });
    } catch (error) {
      console.error('Erro ao hard delete atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}


