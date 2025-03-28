import { Link } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { Menu as MenuIcon, X, Calendar, List } from "lucide-react";

function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  // Configuração da URL da API
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_ADMIN_INFO = `${API_URL}/api/administradores/me`;

  // Busca as informações do administrador logado
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(API_ADMIN_INFO, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setAdminInfo(data);
        } else {
          console.error("Erro ao buscar informações do administrador:", data.message);
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchAdminInfo(); 
  }, [API_ADMIN_INFO]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const menuItems = [
    { to: "/cadastroEvento", label: "Cadastrar evento", icon: <Calendar className="mr-3 h-5 w-5 text-indigo-500" /> },
    { to: "/confirmacao", label: "Lista de convidados", icon: <List className="mr-3 h-5 w-5 text-gray-600" /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-md flex items-center justify-between">
        <button className="text-gray-700 hover:scale-105" onClick={toggleMenu} aria-label="Abrir menu">
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
        <h1 className="text-lg font-semibold text-indigo-600">Menu</h1>
      </header>

      {isMenuOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMenu}></div>}

      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500">Bem-vindo(a),</p>
          <p className="text-2xl font-semibold text-indigo-600">Administrador(a)</p>
        </div>

        {adminInfo && (
          <div className="p-5 border-t border-gray-200 bg-indigo-50 mt-4">
            <p className="text-sm font-medium text-gray-500">Plano atual:</p>
            <p className="text-xl font-semibold text-indigo-600">
              {adminInfo.plano_nome || "Nenhum plano selecionado"}
            </p>
          </div>
        )}
        
        <ul className="py-4 px-3">
          {menuItems.map((item, index) => (
            <li key={index} className="mb-4">
              <Link 
                to={item.to} 
                className="flex items-center p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
                onClick={closeMenu} // Fecha o menu ao clicar em um item
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pt-16" />
    </>
  );
}

export default Menu;
