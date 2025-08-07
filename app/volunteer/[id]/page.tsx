"use client";
import { useParams } from 'next/navigation';

export default function VolunteerPage() {
   const params = useParams();
  const codigoSala = params?.codigo_sala as string;

  return <div>Bem-vindo ao evento como voluntário! ID: {codigoSala}</div>;
}
