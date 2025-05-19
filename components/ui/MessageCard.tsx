"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface MessageCardProps {
  mensagem: string;
  tipo: "sucesso" | "erro" | "aviso";
  onClose?: () => void;
}

const tipoConfig = {
  sucesso: {
    bg: "bg-green-100 dark:bg-green-900",
    border: "border-green-500 dark:border-green-700",
    text: "text-green-900 dark:text-green-100",
    icon: <CheckCircle className="h-5 w-5 text-green-600 mr-2" />,
  },
  erro: {
    bg: "bg-red-100 dark:bg-red-900",
    border: "border-red-500 dark:border-red-700",
    text: "text-red-900 dark:text-red-100",
    icon: <AlertCircle className="h-5 w-5 text-red-600 mr-2" />,
  },
  aviso: {
    bg: "bg-yellow-100 dark:bg-yellow-900",
    border: "border-yellow-500 dark:border-yellow-700",
    text: "text-yellow-900 dark:text-yellow-100",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />,
  },
};

export default function MessageCard({ mensagem, tipo, onClose }: MessageCardProps) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisivel(false);
      if (onClose) onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visivel) return null;

  const config = tipoConfig[tipo];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        role="alert"
        className={`${config.bg} ${config.border} ${config.text} p-2 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out`}
      >
        {config.icon}
        <p className="text-xs font-semibold">{mensagem}</p>
      </div>
    </div>
  );
}
