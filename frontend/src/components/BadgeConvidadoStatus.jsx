
import { CheckCircle, XCircle } from "lucide-react";
import { FaSadCry } from "react-icons/fa";

export default function BadgeConvidadoStatus({ status }) {
  const statusConfig = {
    0: {
      text: "Pendente",
      icon: <XCircle className="h-3 w-3 mr-1" />,
      style: "bg-red-100 text-red-800",
    },
    1: {
      text: "Confirmado",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      style: "bg-green-100 text-green-800",
    },
    2: {
      text: "Não comparecerá",
      icon: <XCircle className="h-3 w-3 mr-1" />,
      style: "bg-yellow-100 text-yellow-800",
    },
  };

  const { text, icon, style } = statusConfig[status] || {};

  return (
    <button
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {icon}
      {text}
    </button>
  );
}
