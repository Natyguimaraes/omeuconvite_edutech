import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // carregar as variáveis do arquivo .env (banco de dados)

const conexao = mysql.createConnection({
  // eslint-disable-next-line no-undef
  host: process.env.DB_HOST || "localhost",

  // eslint-disable-next-line no-undef
  user: process.env.DB_USER || "root",

  // eslint-disable-next-line no-undef
  password: process.env.DB_PASSWORD || "senha",

  // eslint-disable-next-line no-undef
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
