"use client";
import { Navbar } from '@/components/Navbar';
import TabelaEquipes from '@/components/TabelaEquipes';
import { Footer } from '@/components/ui/Footer';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function VisitPage() {
  const params = useParams();
  const code_event = params?.code_event as string;
  const router = useRouter();

  const [eventName, setEventName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<string>('');
  const [id_evento, setId_event] = useState<string>('');

  useEffect(() => {
    const fetchEventData = async () => {
      if (!code_event) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('name_event, id_evento')
          .eq('code_event', code_event)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEventName(data.name_event);
          setId_event(data.id_evento);

          // 2ª consulta -> usar diretamente o id_evento retornado
          const { data: dataEvent, error: errorEvent } = await supabase
            .from('typeEvent')
            .select('config')
            .eq('id_event', data.id_evento)
            .maybeSingle();

          if (errorEvent) throw errorEvent;

          setSeason(dataEvent?.config?.temporada ?? '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [code_event]);

  const handleInteraction = () => {
    sessionStorage.removeItem("event_access");
    document.cookie = "event_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/universe");
  };

  const background = (seasonTheme: string) => {
    switch (seasonTheme) {
      case "UNEARTHED":
        return "/images/background_uneartherd.png";
      case "SUBMERGED":
        return "/images/background_submerged.png";
      default:
        return "/images/background_default.png"; // melhor usar uma imagem default
    }
  };

  return (
    <div className='min-h-full flex flex-col justify-between'>
      <Navbar />
      <main
        className='flex-1 flex flex-col items-center justify-center w-full p-4 min-h-screen relative'
        style={{
          backgroundImage: `url(${background(season)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {loading ? (
          <p className="text-lg font-medium">Carregando evento...</p>
        ) : (
          <>
            <button
              className="absolute top-4 right-4 btn btn-error btn-sm rounded"
              onClick={handleInteraction}
            >
              Sair
            </button>
            <h1 className="text-4xl font-bold mb-4 text-secondary">{eventName}</h1>
            <TabelaEquipes idEvent={id_evento} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}