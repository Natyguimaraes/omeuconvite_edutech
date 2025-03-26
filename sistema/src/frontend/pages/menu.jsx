import { Link } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { Menu as MenuIcon, X, Calendar, UserPlus, List } from "lucide-react";

function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null); // Estado para armazenar as informações do administrador

  // Busca as informações do administrador logado
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const token = localStorage.getItem("token"); // Recupera o token do localStorage

      try {
        const response = await fetch("http://localhost:5000/api/administradores/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Envia o token no header
          },
        });

        const data = await response.json();
        if (response.ok) {
          setAdminInfo(data); // Atualiza o estado com as informações do administrador
        } else {
          console.error("Erro ao buscar informações do administrador:", data.message);
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchAdminInfo(); // Chama a função ao carregar o componente
  }, []);

  // Fecha o menu ao pressionar a tecla "Escape"
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
        {/* Saudações do Administrador */}
        <div className="p-5 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500">Bem-vindo(a),</p>
          <p className="text-2xl font-semibold text-indigo-600">Administrador(a)</p>
        </div>

        {/* Exibe o plano do administrador de forma destacada */}
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
              <Link to={item.to} className="flex items-center p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition">
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
