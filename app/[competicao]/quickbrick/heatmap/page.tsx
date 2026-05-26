import type { Metadata } from 'next';
import HeatmapPage from '@/components/heatmap/HeatmapPage';
import ToastProvider from '@/components/heatmap/Toast';
import { Footer } from '@/components/UI/Footer';

export const metadata: Metadata = {
  title: 'Heatmap da Mesa – QuickBrick',
  description: 'Visualize regiões problemáticas da mesa de missões com heatmap interativo.',
};

export default function Page() {
  return (
    <>
      <HeatmapPage />
      <ToastProvider />
      <Footer />
    </>
  );
}
