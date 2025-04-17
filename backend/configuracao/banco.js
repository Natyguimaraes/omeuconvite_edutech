import mysql from "mysql2";
import dotenv from "dotenv";
import process from "process"

dotenv.config(); // carregar as variáveis do arquivo .env (banco de dados)

const conexao = mysql.createConnection({
  
  host: process.env.DB_HOST,

  
  user: process.env.DB_USER,

  
  password: process.env.DB_PASSWORD,

  
  database: process.env.DB_NAME,
  dateStrings: true
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
