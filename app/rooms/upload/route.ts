import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });

  const ext = file.name.split('.').pop();
  const filename = `wallpapers/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage.from('wallpapers').upload(filename, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = supabase.storage.from('wallpapers').getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
