import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/backend-ii';

console.log('Tentando conectar com MongoDB...');
console.log('URI:', MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com o MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;