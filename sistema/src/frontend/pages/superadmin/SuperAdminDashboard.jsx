import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CadastrarPlano from './CadastrarPlano'; // Importe o componente CadastrarPlano
import LiberarAdministrador from './LiberarAdministrador'; // Importe o componente LiberarAdministrador

const SuperAdminDashboard = () => {
    const [paginaAtiva, setPaginaAtiva] = useState(''); // Estado para controlar a página ativa

    return (
        <div style={styles.container}>
            <h1>Painel do Superadministrador</h1>
            <nav style={styles.navbar}>
                <Link
                    to="#"
                    onClick={() => setPaginaAtiva('cadastrar-plano')}
                    style={styles.link}
                >
                    Cadastrar Plano
                </Link>
                <Link
                    to="#"
                    onClick={() => setPaginaAtiva('liberar-administrador')}
                    style={styles.link}
                >
                    Liberar Administrador
                </Link>
            </nav>

            {/* Renderiza a página ativa com base no estado */}
            {paginaAtiva === 'cadastrar-plano' && <CadastrarPlano />}
            {paginaAtiva === 'liberar-administrador' && <LiberarAdministrador />}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
    },
    navbar: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontSize: '18px',
    },
};

export default SuperAdminDashboard;