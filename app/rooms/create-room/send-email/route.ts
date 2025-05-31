import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import Icone from "@/public/Icone.png";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { email, nome, codigo_sala, codigo_admin, codigo_visitante, codigo_voluntario } = data;

  if (!email || !codigo_sala) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  try {
    await resend.emails.send({
    from: "RoboStage <onboarding@resend.dev>",
    to: email,
    subject: `Seja bem-vindo ao seu evento!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center;">
          <img src="${Icone}" alt="Robostage" width="80" style="margin-bottom: 20px;" />
          <h1 style="font-size: 24px; margin-bottom: 5px;">
            <span style="font-weight: bold;">Robo</span><span style="color: #ed1e25; font-weight: bold;">Stage</span>
          </h1>
          <p style="margin-top: 0; font-size: 14px;">Bem-vindo à sua central de eventos!</p>
        </div>

        <p>Olá,</p>
        <p>Você criou uma nova sala com o nome: <strong>${nome}</strong></p>

        <p><strong>Códigos de acesso:</strong></p>
        <ul>
          <li><strong>Sala:</strong> ${codigo_sala}</li>
          <li><strong>Admin:</strong> ${codigo_admin}</li>
          <li><strong>Voluntário:</strong> ${codigo_voluntario}</li>
          <li><strong>Visitante:</strong> ${codigo_visitante}</li>
        </ul>

        <p>
          Gerencie sua sala clicando no botão abaixo:
        </p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="https://robo-stage.vercel.app/"
             style="background-color: #ed1e25; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Acesse o RoboStage
          </a>
        </p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />

        <footer style="font-size: 12px; text-align: center; color: #888;">
          <p>Este é um e-mail automático. Não responda.</p>
          <p>&copy; ${new Date().getFullYear()} Robostage. Todos os direitos reservados.</p>
        </footer>
      </div>
    `,
  });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao enviar o e-mail" }, { status: 500 });
  }
}
