import express from "express";
import 'dotenv/config';
import connectDB from './config/database.js';
import usuarioRoutes from './routers/usuarioRoutes.js';
import authRoutes from './routers/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Rota principal
app.get("/", (req, res) => {
    res.json({ 
        mensagem: "API Backend funcionando!",
        versao: "1.0.0",
        rotas: {
            usuarios: "/api/usuarios"
        }
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ 
        erro: 'Rota não encontrada',
        caminho: req.originalUrl 
    });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erro:', err);
    res.status(500).json({ 
        erro: 'Erro interno do servidor' 
    });
});

// Conectar ao banco e iniciar servidor
const iniciarServidor = async () => {
    try {
        console.log('Iniciando servidor...');
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}!`);
            console.log(`API disponível em: http://localhost:${PORT}`);
            console.log(`Rotas disponíveis:`);
            console.log(`  GET  / - Informações da API`);
            console.log(`  POST /api/auth/login - Login`);
            console.log(`  POST /api/usuarios - Criar usuário`);
            console.log(`  GET  /api/usuarios - Listar usuários`);
            console.log(`  GET  /api/usuarios/:id - Buscar usuário por ID`);
            console.log(`  PUT  /api/usuarios/:id - Atualizar usuário`);
            console.log(`  DELETE /api/usuarios/:id - Deletar usuário`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        console.error('Verifique se o MongoDB está rodando!');
        process.exit(1);
    }
};

iniciarServidor();

