import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UsuarioService } from '../services/usuarioService.js';

const JWT_SECRET: string = process.env['JWT_SECRET'] ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN: string | number = process.env['JWT_EXPIRES_IN'] ?? '1d';

export class AuthController {
  static async login(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        return;
      }

      const usuario = await UsuarioService.buscarUsuarioComSenhaPorEmail(email);
      if (!usuario) {
        res.status(401).json({ erro: 'Credenciais inválidas' });
        return;
      }

      const senhaConfere = bcrypt.compareSync(senha, (usuario as any).senha);
      if (!senhaConfere) {
        res.status(401).json({ erro: 'Credenciais inválidas' });
        return;
      }

      const payload = {
        sub: String((usuario as any)._id),
        role: (usuario as any).role,
        nome: (usuario as any).nome
      };

      const signOptions: jwt.SignOptions = {};
      // eslint off: set only when provided (avoids exactOptionalPropertyTypes issue)
      (signOptions as any).expiresIn = JWT_EXPIRES_IN as any;
      const token = jwt.sign(payload, JWT_SECRET, signOptions);

      res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: {
          id: (usuario as any)._id,
          nome: (usuario as any).nome,
          role: (usuario as any).role
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}


