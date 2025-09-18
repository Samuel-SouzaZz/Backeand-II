import mongoose, { Schema } from 'mongoose';
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
        transform: (_doc, ret: any) => {
            if (ret && typeof ret === 'object' && 'senha' in ret) {
                delete ret.senha;
            }
            return ret;
        }
    },
    toObject: {
        transform: (_doc, ret: any) => {
            if (ret && typeof ret === 'object' && 'senha' in ret) {
                delete ret.senha;
            }
            return ret;
        }
    }
});

// Atualizar dataAtualizacao antes de salvar
UsuarioSchema.pre('save', function(this: any, next) {
    this.dataAtualizacao = new Date();
    // Hash da senha se modificada
    if (typeof this.isModified === 'function' && this.isModified('senha')) {
        const salt = bcrypt.genSaltSync(10);
        this.senha = bcrypt.hashSync(this.senha, salt);
    }
    next();
});

// Hash ao atualizar via findOneAndUpdate
UsuarioSchema.pre('findOneAndUpdate', function(this: any, next) {
    const update = this.getUpdate() as any;
    if (update && update.senha) {
        const salt = bcrypt.genSaltSync(10);
        update.senha = bcrypt.hashSync(update.senha, salt);
    }
    // Atualiza dataAtualizacao
    this.setUpdate({
        ...update,
        dataAtualizacao: new Date()
    });
    next();
});

export const Usuario = mongoose.model('Usuario', UsuarioSchema);