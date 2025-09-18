import mongoose, { Schema } from 'mongoose';

const RespostaAtividadeSchema = new Schema({
  atividade: {
    type: Schema.Types.ObjectId,
    ref: 'Atividade',
    required: true,
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  codigo: {
    type: String,
    required: true,
  },
  linguagem: {
    type: String,
    default: 'javascript',
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pendente', 'correto', 'incorreto'],
    default: 'pendente',
    lowercase: true,
    trim: true,
  },
  feedback: {
    type: String,
  },
}, {
  timestamps: true,
});

export const RespostaAtividade = mongoose.model('RespostaAtividade', RespostaAtividadeSchema);


