import express from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../middlewares/auth.js';
import { RespostaAtividadeService } from '../services/respostaAtividadeService.js';

export class RespostaAtividadeController {
  static async criar(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { atividade, codigo, linguagem } = req.body;
      if (!atividade || !codigo) {
        res.status(400).json({ erro: 'Atividade e código são obrigatórios' });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(atividade)) {
        res.status(400).json({ erro: 'ID de atividade inválido' });
        return;
      }
      const autor = req.user?.sub as string;
      const resposta = await RespostaAtividadeService.criar({ atividade, autor, codigo, linguagem });
      res.status(201).json({ mensagem: 'Resposta criada', resposta });
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
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
      const resposta = await RespostaAtividadeService.buscarPorId(id);
      if (!resposta) {
        res.status(404).json({ erro: 'Resposta não encontrada' });
        return;
      }
      res.status(200).json({ resposta });
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async listarPorAtividade(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { atividadeId } = req.params as { atividadeId: string };
      if (!mongoose.Types.ObjectId.isValid(atividadeId)) {
        res.status(400).json({ erro: 'ID de atividade inválido' });
        return;
      }
      const itens = await RespostaAtividadeService.listarPorAtividade(atividadeId);
      res.status(200).json({ total: itens.length, respostas: itens });
    } catch (error) {
      console.error('Erro ao listar respostas por atividade:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async listarMinhas(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const autorId = req.user?.sub as string;
      const itens = await RespostaAtividadeService.listarPorAutor(autorId);
      res.status(200).json({ total: itens.length, respostas: itens });
    } catch (error) {
      console.error('Erro ao listar minhas respostas:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  static async atualizar(req: AuthRequest, res: express.Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { codigo, linguagem, status, feedback } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ erro: 'ID inválido' });
        return;
      }
      const atualizada = await RespostaAtividadeService.atualizar(id, { codigo, linguagem, status, feedback });
      if (!atualizada) {
        res.status(404).json({ erro: 'Resposta não encontrada' });
        return;
      }
      res.status(200).json({ mensagem: 'Resposta atualizada', resposta: atualizada });
    } catch (error) {
      console.error('Erro ao atualizar resposta:', error);
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
      const ok = await RespostaAtividadeService.deletar(id);
      if (!ok) {
        res.status(404).json({ erro: 'Resposta não encontrada' });
        return;
      }
      res.status(200).json({ mensagem: 'Resposta deletada' });
    } catch (error) {
      console.error('Erro ao deletar resposta:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}


