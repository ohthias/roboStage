import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "userId é obrigatório",
        },
        {
          status: 400,
        },
      );
    }

    /* ================= DELETE TAGS ================= */

    const { error: tagsError } = await supabaseAdmin
      .from("user_tags")
      .delete()
      .eq("user_id", userId);

    if (tagsError) {
      return NextResponse.json(
        {
          error: "Erro ao deletar tags",
        },
        {
          status: 500,
        },
      );
    }

    /* ================= DELETE FOLLOWERS ================= */

    const { error: followersError } = await supabaseAdmin
      .from("user_followers")
      .delete()
      .or(`user_id.eq.${userId},follower_id.eq.${userId}`);

    if (followersError) {
      return NextResponse.json(
        {
          error: "Erro ao deletar seguidores",
        },
        {
          status: 500,
        },
      );
    }

    /* ================= DELETE STORAGE ================= */

    const { data: files } = await supabaseAdmin.storage
      .from("photos")
      .list(`avatars/${userId}`);

    if (files && files.length > 0) {
      const paths = files.map((file) => `avatars/${userId}/${file.name}`);

      await supabaseAdmin.storage.from("photos").remove(paths);
    }

    /* ================= DELETE PROFILE ================= */

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        {
          error: "Erro ao deletar perfil",
        },
        {
          status: 500,
        },
      );
    }

    /* ================= DELETE AUTH USER ================= */

    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      return NextResponse.json(
        {
          error: "Erro ao deletar usuário auth",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conta deletada com sucesso",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro interno",
      },
      {
        status: 500,
      },
    );
  }
}
