import MessageCard from "./ui/MessageCard";

interface MessageProps {
  tipo: "sucesso" | "erro" | "aviso" | "";
  mensagem: string;
  onClose: () => void;
}

export default function Message({ tipo, mensagem, onClose }: MessageProps) {
  if (!tipo || !mensagem) return null;

  return <MessageCard tipo={tipo} mensagem={mensagem} onClose={onClose} />;
}
