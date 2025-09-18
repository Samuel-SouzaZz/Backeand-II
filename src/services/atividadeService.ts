import { Atividade } from '../model/atividade.js';

export class AtividadeService {
  static async criarAtividade(dados: { titulo: string; descricao: string; dificuldade?: 'facil' | 'medio' | 'dificil'; autor: string; tags?: string[]; prazo?: Date; ativo?: boolean; }) {
    const atividade = new Atividade(dados);
    return await atividade.save();
  }

  static async listarAtividades(soAtivas: boolean = true) {
    const filtro = soAtivas ? { ativo: true } : {};
    return await Atividade.find(filtro).populate('autor', 'nome role');
  }

  static async buscarPorId(id: string) {
    return await Atividade.findById(id).populate('autor', 'nome role');
  }

  static async atualizarAtividade(id: string, dados: { titulo?: string; descricao?: string; dificuldade?: 'facil' | 'medio' | 'dificil'; tags?: string[]; prazo?: Date; ativo?: boolean; }) {
    return await Atividade.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
  }

  static async deletarAtividade(id: string) {
    const res = await Atividade.findByIdAndUpdate(id, { ativo: false }, { new: true });
    return !!res;
  }

  static async deletarAtividadePermanentemente(id: string) {
    const res = await Atividade.findByIdAndDelete(id);
    return !!res;
  }
}


