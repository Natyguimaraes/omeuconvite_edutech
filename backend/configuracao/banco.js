import mysql from "mysql2";
import dotenv from "dotenv";
import process from "process"

dotenv.config(); // carregar as variáveis do arquivo .env (banco de dados)

const conexao = mysql.createConnection({
  
  host: process.env.DB_HOST || "162.240.45.134",

  
  user: process.env.DB_USER || "edutecconsult_omeuconvite",

  
  password: process.env.DB_PASSWORD || "ArdkeLhQ5FPv",

  
  database: process.env.DB_NAME || "edutecconsult_omeuconvite",
});

setInterval(() => {
  conexao.ping((err) => {
    if (err) {
      console.error("Erro ao manter conexão com o banco de dados:", err);
    } else {
      console.log("Conexão com o banco de dados mantida.");
    }
  });
}, 60000); // 1 minuto

export default conexao;
