// CORRETO (usando a sintaxe moderna)
import { v2 as cloudinary } from 'cloudinary'; // ← Note o 'as cloudinary'

import dotenv from 'dotenv';

// Carrega variáveis do .env
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary; // ← Export padrão