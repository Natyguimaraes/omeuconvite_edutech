import { useState, useEffect } from "react";

const LiberarAdministrador = () => {
    const [nome, setNome] = useState("");
    //const [cpf, setCpf] = useState("");
    const [planoId, setPlanoId] = useState("");
    const [planos, setPlanos] = useState([]);

   
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const API_PLANOS = `${API_URL}/api/superadmin/planos`;
    const API_LIBERAR_ADMIN = `${API_URL}/api/superadmin/liberar-administrador`;

    
    useEffect(() => {
        const fetchPlanos = async () => {
            try {
                const response = await fetch(API_PLANOS);
                if (!response.ok) {
                    throw new Error("Erro ao carregar planos");
                }
                const data = await response.json();
                setPlanos(data);
            } catch (error) {
                console.error("Erro ao carregar planos:", error);
            }
        };
        fetchPlanos();
    }, [API_PLANOS]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_LIBERAR_ADMIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nome, planoId }),
            });

            if (!response.ok) {
                throw new Error("Erro ao liberar administrador");
            }

            alert("Administrador liberado com sucesso!");
            setNome("");
            setPlanoId("");
        } catch (error) {
            console.error("Erro ao liberar administrador:", error);
            alert("Erro ao liberar administrador.");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Liberar Administrador</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Nome do Administrador:</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Plano:</label>
                    <select
                        value={planoId}
                        onChange={(e) => setPlanoId(e.target.value)}
                        required
                    >
                        <option value="">Selecione um plano</option>
                        {planos.map((plano) => (
                            <option key={plano.id} value={plano.id}>
                                {plano.nome} (Máx. {plano.max_convidados} convidados)
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" style={styles.button}>
                    Liberar
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

export default LiberarAdministrador;