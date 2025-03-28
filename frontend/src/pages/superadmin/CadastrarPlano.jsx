import { useState } from "react";

const CadastrarPlano = () => {
  const [nome, setNome] = useState("");
  const [maxConvidados, setMaxConvidados] = useState("");
  const [erro, setErro] = useState("");

  // Configuração da URL da API
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_PLANOS = `${API_URL}/api/superadmin/planos`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação dos campos
    if (!nome || !maxConvidados) {
      setErro("Nome e máximo de acompanhantes são obrigatórios.");
      return;
    }

    try {
      const response = await fetch(API_PLANOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          maxConvidados: parseInt(maxConvidados),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar plano");
      }

      const data = await response.json();
      alert(data.message || "Plano cadastrado com sucesso!"); 
      setNome("");
      setMaxConvidados("");
      setErro("");
    } catch (error) {
      console.error("Erro ao cadastrar plano:", error);
      setErro("Erro ao cadastrar plano. Tente novamente.");
    }
  };
  
  return (
    <div style={styles.container}>
      <h2>Cadastrar Plano</h2>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Nome do Plano:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label>Máximo de convidados:</label>
          <input
            type="number"
            value={maxConvidados}
            onChange={(e) => setMaxConvidados(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={styles.button}>
          Cadastrar
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "15px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default CadastrarPlano;