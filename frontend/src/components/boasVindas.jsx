import { useEffect, useState } from "react";

function BemVindo() {
  const [nome, setNome] = useState("");
  const adminId = localStorage.getItem("adminId") || sessionStorage.getItem("adminId");

  useEffect(() => {
    if (adminId) {
      fetch(`http://localhost:5000/api/administradores/${adminId}`)
        .then((res) => res.json())
        .then((data) => {
          setNome(data.nome); 
        })
        .catch((error) => {
          console.error("Erro ao buscar nome do admin:", error);
          setNome("Administrador");
        });
    }
  }, [adminId]);

  return (
    <h1 className="text-3xl font-semibold text-center text-gray-800 -mt-8 mb-8">
  Bem-vindo (a) {" "}
  <span className="text-purple-700 font-bold">
    {nome || "..."}
  </span>
</h1>

  );
}

export default BemVindo;
