'use client';
import AdminRoomPageClient from "./AdminRoomPageClient";
import { useParams } from 'next/navigation';

export default async function AdminPage() {
    const params = useParams();
  const codigoSala = params?.codigo_sala as string;

  return <AdminRoomPageClient codigoSala={codigoSala} />;
}
