import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthRequest extends express.Request {
  user?: {
    sub: string;
    role: 'aluno' | 'professor' | 'admin';
    nome: string;
    iat?: number;
    exp?: number;
  };
}

export const authenticate = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    res.status(401).json({ erro: 'Token ausente' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

export const authorize = (...rolesPermitidos: Array<'aluno' | 'professor' | 'admin'>) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ erro: 'Não autenticado' });
      return;
    }
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(req.user.role)) {
      res.status(403).json({ erro: 'Não autorizado' });
      return;
    }
    next();
  };
};

// Middleware específico para admin
export const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    res.status(401).json({ erro: 'Não autenticado' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade' });
    return;
  }
  next();
};


