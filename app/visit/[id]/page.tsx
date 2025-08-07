import { useParams } from 'next/navigation';

export default function VisitPage() {
   const params = useParams();
  const codigoSala = params?.codigo_sala as string;

  return <div>Bem-vindo ao evento como visitante! ID: {codigoSala}</div>;
}
