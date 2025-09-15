import { Usuario } from '../model/usuario.js';

export class UsuarioService {
  // Criar novo usuário
  static async criarUsuario(dadosUsuario: { nome: string; email: string; senha: string; role: 'aluno' | 'professor' | 'admin' }) {
    const novoUsuario = new Usuario(dadosUsuario);
    return await novoUsuario.save();
  }

  // Buscar todos os usuários (apenas ativos)
  static async buscarTodosUsuarios() {
    return await Usuario.find({ ativo: true });
  }

  // Buscar usuário por ID (apenas ativos)
  static async buscarUsuarioPorId(id: string) {
    return await Usuario.findOne({ _id: id, ativo: true });
  }

  // Buscar usuário por ID (incluindo deletados)
  static async buscarUsuarioPorIdIncluindoDeletados(id: string) {
    return await Usuario.findById(id);
  }

  // Buscar usuário por email
  static async buscarUsuarioPorEmail(email: string) {
    return await Usuario.findOne({ email });
  }

  // Buscar usuário por email incluindo senha (para login)
  static async buscarUsuarioComSenhaPorEmail(email: string) {
    return await Usuario.findOne({ email }).select('+senha');
  }

  // Atualizar usuário
  static async atualizarUsuario(id: string, dadosAtualizacao: { nome?: string; email?: string; senha?: string; ativo?: boolean; role?: 'aluno' | 'professor' | 'admin' }) {
    return await Usuario.findByIdAndUpdate(
      id, 
      dadosAtualizacao, 
      { new: true, runValidators: true }
    );
  }

  // Deletar usuário (soft delete)
  static async deletarUsuario(id: string): Promise<boolean> {
    try {
      console.log('Serviço: Tentando deletar usuário com ID:', id);
      const resultado = await Usuario.findByIdAndUpdate(
        id, 
        { ativo: false }, 
        { new: true }
      );
      console.log('Serviço: Resultado da query:', resultado);
      return !!resultado;
    } catch (error) {
      console.error('Serviço: Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Deletar usuário permanentemente
  static async deletarUsuarioPermanentemente(id: string): Promise<boolean> {
    const resultado = await Usuario.findByIdAndDelete(id);
    return !!resultado;
  }

  // Validar se email já existe
  static async emailExiste(email: string, idExcluir?: string): Promise<boolean> {
    const query: any = { email };
    if (idExcluir) {
      query._id = { $ne: idExcluir };
    }
    const usuario = await Usuario.findOne(query);
    return !!usuario;
  }

  // Validar se nome já existe
  static async nomeExiste(nome: string, idExcluir?: string): Promise<boolean> {
    const query: any = { nome };
    if (idExcluir) {
      query._id = { $ne: idExcluir };
    }
    const usuario = await Usuario.findOne(query);
    return !!usuario;
  }

  // Contar total de usuários
  static async contarUsuarios(): Promise<number> {
    return await Usuario.countDocuments();
  }

  // Buscar usuários ativos
  static async buscarUsuariosAtivos() {
    return await Usuario.find({ ativo: true });
  }

  // Buscar todos os usuários (incluindo deletados) - para admin
  static async buscarTodosUsuariosIncluindoDeletados() {
    return await Usuario.find();
  }

  // Buscar usuários com paginação
  static async buscarUsuariosComPaginacao(pagina: number = 1, limite: number = 10) {
    const skip = (pagina - 1) * limite;
    
    const [usuarios, total] = await Promise.all([
      Usuario.find({ ativo: true }).skip(skip).limit(limite),
      Usuario.countDocuments({ ativo: true })
    ]);

    return {
      usuarios,
      total,
      paginas: Math.ceil(total / limite)
    };
  }

  // Reativar usuário (apenas admin)
  static async reativarUsuario(id: string) {
    return await Usuario.findByIdAndUpdate(
      id, 
      { ativo: true }, 
      { new: true, runValidators: true }
    );
  }

  // Obter estatísticas de usuários (apenas admin)
  static async obterEstatisticasUsuarios() {
    const [totalUsuarios, usuariosAtivos, usuariosInativos, porRole] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.countDocuments({ ativo: true }),
      Usuario.countDocuments({ ativo: false }),
      Usuario.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const distribuicaoPorRole = porRole.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      totalUsuarios,
      usuariosAtivos,
      usuariosInativos,
      distribuicaoPorRole
    };
  }
}
