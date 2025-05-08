'use client';
import Modal from '../../../components/Modal';
import { useRouter } from 'next/navigation';

export default function EmbarcarEvento() {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()}>
      <h2>EMBARQUE EM UM EVENTO EXISTENTE</h2>
      {/* Seu conteúdo de acesso */}
      <p>Digite o código do evento para entrar.</p>
    </Modal>
  );
}
