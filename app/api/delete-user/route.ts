import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }


    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
      
    // Deleta usuário do Auth (já remove sessões)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );
    if (authError) {
      return NextResponse.json(
        { error: "Erro ao deletar usuário do Auth" },
        { status: 500 }
      );
    }

    // Deleta profile

    if (profileError) {
      return NextResponse.json(
        { error: "Erro ao deletar perfil do usuário" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Conta deletada com sucesso!" });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
