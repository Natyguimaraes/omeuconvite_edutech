import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <Link to="/superadmin/cadastrar-plano" style={styles.link}>
        Cadastrar Plano
      </Link>
      <Link to="/superadmin/liberar-administrador" style={styles.link}>
        Liberar Administrador
      </Link>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#333",
    padding: "10px",
    display: "flex",
    justifyContent: "space-around",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
};

export default Navbar;