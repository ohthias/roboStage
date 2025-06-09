import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";
import { NextResponse } from "next/server";

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

    const { data } = await supabase
      .from("rooms")
      .select("id")
      .eq("codigo_sala", codigo);

    if (!data) {
      return NextResponse.json(
        { error: "Sala não encontrada." },
        { status: 404 }
      );
    }

    const { error } = await supabase
    .from("teams")
    .delete()
    .eq("sala_id", data[0].id);
    console.log(error);
    if (error) {
      return NextResponse.json(
        { error: "Erro ao resetar equipes." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "RoboStage <onboarding@resend.dev>",
      to: emailAdmin,
      subject: "Equipes resetadas!",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center;">
          <img src="https://robo-stage.vercel.app/Icone.png" alt="Robostage" width="80" style="margin-bottom: 20px;" />
          <h1 style="font-size: 24px; margin-bottom: 5px;">
            <span style="font-weight: bold;">Robo</span><span style="color: #ed1e25; font-weight: bold;" translate="no">Stage</span>
          </h1>
        </div>

        <p>Olá,</p>
        <p>As equipes da sala com código <strong>${codigo}</strong> foram resetadas com sucesso.</p>
        <p>Agora você pode criar novas equipes ou reconfigurar as existentes.</p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />

        <footer style="font-size: 12px; text-align: center; color: #888;">
          <p>Este é um e-mail automático. Não responda.</p>
          <p>&copy; ${new Date().getFullYear()} Robostage. Todos os direitos reservados.</p>
        </footer>
      </div>
    `,
    });

    return NextResponse.json({ message: "Equipes resetadas com sucesso." });
  } catch (error) {
    console.error("Erro ao resetar equipes:", error);
    return NextResponse.json(
      { error: "Erro ao resetar equipes. Tente novamente." },
      { status: 500 }
    );
  }
};