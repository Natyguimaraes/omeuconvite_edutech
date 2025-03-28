import "../../index.css";

function Rodape() {

    return (
        <div className="rodape">
        <p>
          &copy; {new Date().getFullYear()} Sistema de Eventos. Todos os
          direitos reservados.
        </p>
      </div>
    );
} export default Rodape;