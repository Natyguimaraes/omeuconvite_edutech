import { useState } from 'react';
import { Link } from 'react-router-dom';
import CadastrarPlano from './CadastrarPlano'; 
import LiberarAdministrador from './LiberarAdministrador'; 

const SuperAdminDashboard = () => {
    const [paginaAtiva, setPaginaAtiva] = useState(''); 

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