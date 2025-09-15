import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['aluno', 'professor', 'admin'],
        required: true,
        default: 'aluno',
        lowercase: true,
        trim: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.senha;
            return ret;
        }
    },
    toObject: {
        transform: (_doc, ret) => {
            delete ret.senha;
            return ret;
        }
    }
});

// Atualizar dataAtualizacao antes de salvar
UsuarioSchema.pre('save', function(next) {
    this.dataAtualizacao = new Date();
    // Hash da senha se modificada
    // @ts-ignore
    if (this.isModified && (this as any).isModified('senha')) {
        const doc = this as any;
        const salt = bcrypt.genSaltSync(10);
        doc.senha = bcrypt.hashSync(doc.senha, salt);
    }
    next();
});

// Hash ao atualizar via findOneAndUpdate
UsuarioSchema.pre('findOneAndUpdate', function(next) {
    // @ts-ignore
    const update: any = this.getUpdate();
    if (update && update.senha) {
        const salt = bcrypt.genSaltSync(10);
        update.senha = bcrypt.hashSync(update.senha, salt);
        this.setUpdate(update);
    }
    // Atualiza dataAtualizacao
    this.setUpdate({
        ...(this.getUpdate() as any),
        dataAtualizacao: new Date()
    });
    next();
});

export const Usuario = mongoose.model('Usuario', UsuarioSchema);