import MessageCard from "./ui/MessageCard";

interface MensageProps {
  tipo: "sucesso" | "erro" | "aviso" | "";
  mensagem: string;
  onClose: () => void;
}

export default function Mensage({ tipo, mensagem, onClose }: MensageProps) {
  if (!tipo || !mensagem) return null;

  return <MessageCard tipo={tipo} mensagem={mensagem} onClose={onClose} />;
}
