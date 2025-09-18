import { RespostaAtividade } from '../model/respostaAtividade.js';

export class RespostaAtividadeService {
  static async criar(dados: { atividade: string; autor: string; codigo: string; linguagem?: string; }) {
    const doc = new RespostaAtividade(dados);
    return await doc.save();
  }

  static async listarPorAtividade(atividadeId: string) {
    return await RespostaAtividade.find({ atividade: atividadeId }).populate('autor', 'nome role');
  }

  static async listarPorAutor(autorId: string) {
    return await RespostaAtividade.find({ autor: autorId }).populate('atividade', 'titulo dificuldade');
  }

  static async buscarPorId(id: string) {
    return await RespostaAtividade.findById(id).populate('autor', 'nome role').populate('atividade', 'titulo');
  }

  static async atualizar(id: string, dados: { codigo?: string; linguagem?: string; status?: 'pendente' | 'correto' | 'incorreto'; feedback?: string; }) {
    return await RespostaAtividade.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
  }

  static async deletar(id: string) {
    const res = await RespostaAtividade.findByIdAndDelete(id);
    return !!res;
  }
}


