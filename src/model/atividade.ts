import mongoose, { Schema } from 'mongoose';

const AtividadeSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  descricao: {
    type: String,
    required: true,
    trim: true,
  },
  dificuldade: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    default: 'medio',
    lowercase: true,
    trim: true,
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  prazo: {
    type: Date,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Atividade = mongoose.model('Atividade', AtividadeSchema);


