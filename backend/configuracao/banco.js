import mysql from "mysql2";
import dotenv from "dotenv";
import process from "process"

dotenv.config(); // carregar as variáveis do arquivo .env (banco de dados)

const conexao = mysql.createConnection({
  
  host: process.env.DB_HOST || "localhost",

  
  user: process.env.DB_USER || "root",

  
  password: process.env.DB_PASSWORD || "senha",

  
  database: process.env.DB_NAME || "teste",
});
conexao.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados MySQL");
});

export default conexao;
