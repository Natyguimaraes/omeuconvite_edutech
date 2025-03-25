import PropTypes from 'prop-types'; // Importe o PropTypes

const Button = ({ onClick, children, className = '', size, variant }) => {
  const sizeClass = size === "lg" ? "px-6 py-3" : "px-4 py-2";
  const variantClass = variant === "outline" ? "border-2 border-gray-300" : "bg-indigo-600 hover:bg-indigo-700 text-white";
  
  return (
    <button
      onClick={onClick}
      className={`rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

// Adicione a validação para 'children' e outras props
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,  // Valida 'children' como qualquer tipo de nó renderizável (texto, JSX, etc.)
  className: PropTypes.string,
  size: PropTypes.oneOf(['lg', 'sm']),  // Validação de 'size' como 'lg' ou 'sm'
  variant: PropTypes.oneOf(['outline', 'filled'])  // Validação de 'variant' como 'outline' ou 'filled'
};

export default Button;
