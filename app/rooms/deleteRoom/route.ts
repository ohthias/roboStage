// app/rooms/deleteRoom/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (request: Request) => {
  try {
    const { codigo, emailAdmin } = await request.json();

    if (!codigo || !emailAdmin) {
      return NextResponse.json(
        { error: "Código da sala e email do admin são obrigatórios." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("codigo_sala", codigo);
    if (error) throw error;

    await resend.emails.send({
      from: "RoboStage <onboarding@resend.dev>",
      to: emailAdmin,
      subject: "Evento deletado com sucesso",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; background-color: #f9f9f9;">
      <img src="https://robo-stage.vercel.app/bannerEmail.png" alt="Banner RoboStage" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
      
      <div style="padding: 20px;">
        <h2 style="color: #333;">Evento Deletado com Sucesso</h2>
        <p style="font-size: 16px; color: #555;">
          O evento com código <strong>${codigo}</strong> foi deletado do sistema.
        </p>
        
        <p style="font-size: 16px; color: #555; margin-top: 20px;">
          Obrigado por utilizar o <strong>RoboStage</strong>. Estamos sempre aqui para ajudar!
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <img src="https://robo-stage.vercel.app/Icone.png" alt="Logo RoboStage" style="width: 80px; opacity: 0.6;">
      </div>

      <footer style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
        Este e-mail foi gerado automaticamente pelo sistema RoboStage. Por favor, não responda.
      </footer>
    </div>
  `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao deletar a sala.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
