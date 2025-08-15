"use client";
import { Navbar } from '@/components/Navbar';
import TabelaEquipes from '@/components/TabelaEquipes';
import { Footer } from '@/components/ui/Footer';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function VisitPage() {
  const params = useParams();
  const id_evento = params?.id as string;

  const [eventName, setEventName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<string>('');

  useEffect(() => {
    const fetchEventName = async () => {
      if (!id_evento) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('name_event')
          .eq('id_evento', id_evento)
          .maybeSingle();

        const { data: dataEvent, error: errorEvent } = await supabase
          .from('typeEvent')
          .select('config')
          .eq('id_event', id_evento)
          .maybeSingle();

          setSeason(dataEvent?.config?.temporada)
        if (error) throw error;
        if (data) setEventName(data.name_event);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventName();
  }, [id_evento]);

  const background = (seasonTheme:string) => {
    switch (seasonTheme) {
      case "UNEARTHED":
        return "/images/background_uneartherd.png";
      case "SUBMERGED":
        return "/images/background_submerged.png";
      default:
        return "bg-default";
    }
  }

  return (
    <div className='min-h-full flex flex-col justify-between'>
      <Navbar />
      <main className='flex-1 flex flex-col items-center justify-center w-full p-4 min-h-screen' style={ {backgroundImage: `url(${background(season)})`, backgroundSize: 'cover', backgroundPosition: 'center' } }>
        {loading ? (
          <p className="text-lg font-medium">Carregando evento...</p>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4 text-secondary">{eventName}</h1>
            <TabelaEquipes idEvent={id_evento} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
