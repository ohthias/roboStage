'use client';
import Modal from '../../../components/Modal';
import { useRouter } from 'next/navigation';

export default function CriarEvento() {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()}>
      <h2>CRIE UM EVENTO DA FLL!</h2>
      {/* Seu conteúdo de formulário */}
      <p>Exemplo de conteúdo do modal de criação.</p>
    </Modal>
  );
}
