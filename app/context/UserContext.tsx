/**
 * =========================================================
 * UserContext — Gerenciamento Global de Usuário e Sessão
 * =========================================================
 *
 * Este arquivo implementa um Context Provider do React
 * responsável por centralizar o estado de autenticação
 * e perfil do usuário em uma aplicação Next.js (Client Side),
 * utilizando Supabase como backend de autenticação e dados.
 *
 * ---------------------------------------------------------
 * RESPONSABILIDADES PRINCIPAIS
 * ---------------------------------------------------------
 * - Gerenciar a sessão do usuário autenticado (Supabase Auth)
 * - Buscar e armazenar o perfil do usuário na tabela `profiles`
 * - Persistir o perfil em cache local (localStorage)
 * - Sincronizar automaticamente mudanças de autenticação
 *   (login, logout e refresh de sessão)
 * - Expor estado global de carregamento (`loading`)
 *
 * ---------------------------------------------------------
 * ESTRUTURA DE DADOS
 * ---------------------------------------------------------
 *
 * Interface Profile:
 * Representa os dados do perfil do usuário armazenados no banco.
 *
 *  - id: UUID do usuário (mesmo do Supabase Auth)
 *  - username: Nome público do usuário
 *  - avatar_url: URL do avatar
 *  - banner_url: URL do banner de perfil
 *
 * Interface UserContextType:
 * Define os dados disponibilizados globalmente:
 *
 *  - session: Sessão atual do Supabase
 *  - profile: Perfil do usuário autenticado
 *  - loading: Indica se o contexto está inicializando ou atualizando
 *
 * ---------------------------------------------------------
 * FUNCIONAMENTO GERAL
 * ---------------------------------------------------------
 *
 * 1) Ao montar o Provider:
 *    - Obtém a sessão atual do Supabase
 *    - Caso exista usuário autenticado:
 *        • Tenta carregar o perfil do localStorage
 *        • Caso não exista cache, busca no banco
 *
 * 2) Cache Local:
 *    - O perfil do usuário é salvo no localStorage
 *    - Evita requisições repetidas ao Supabase ao recarregar a página
 *
 * 3) Listener de Autenticação:
 *    - Escuta mudanças de estado via onAuthStateChange
 *    - Em login:
 *        • Atualiza sessão
 *        • Busca novamente o perfil
 *    - Em logout:
 *        • Limpa sessão
 *        • Remove perfil do estado e do localStorage
 *
 * 4) Cleanup:
 *    - Remove o listener ao desmontar o Provider
 *    - Evita vazamento de memória
 *
 * ---------------------------------------------------------
 * USO NA APLICAÇÃO
 * ---------------------------------------------------------
 *
 * O UserProvider deve envolver a aplicação ou layouts
 * protegidos para que os dados fiquem disponíveis.
 *
 * Exemplo:
 *
 *  <UserProvider>
 *    <App />
 *  </UserProvider>
 *
 * Para acessar os dados:
 *
 *  const { session, profile, loading } = useUser();
 *
 * ---------------------------------------------------------
 * OBSERVAÇÕES IMPORTANTES
 * ---------------------------------------------------------
 * - Este contexto é Client Component ("use client")
 * - Não realiza atualização automática do perfil fora
 *   de eventos de autenticação
 * - Pode ser facilmente estendido para:
 *     • Roles e permissões
 *     • Atualização de perfil
 *     • Upload de avatar e banner
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at?: string;

  tags: string[];
  followersCount: number;
  followingCount: number;
}

interface UserContextType {
  session: any;
  profile: Profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  session: null,
  profile: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (data: Profile) => {
    setProfile(data);
    localStorage.setItem("userProfile", JSON.stringify(data));
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, created_at")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) throw profileError;

      const { data: tagsData } = await supabase
        .from("user_tags")
        .select("tag")
        .eq("user_id", userId);

      const tags = tagsData?.map((t) => t.tag) ?? [];

      const { count: followersCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: followingCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      const aggregatedProfile: Profile = {
        ...profileData,
        tags,
        followersCount: followersCount ?? 0,
        followingCount: followingCount ?? 0,
      };

      applyProfile(aggregatedProfile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfile(null);
      localStorage.removeItem("userProfile");
    }
  };

  /* ================= BOOTSTRAP ================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);

      if (session?.user) {
        const cached = localStorage.getItem("userProfile");
        if (cached) {
          applyProfile(JSON.parse(cached));
        } else {
          await fetchProfile(session.user.id);
        }
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        // 🔒 NÃO mexe em loading
        setSession(newSession);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          localStorage.removeItem("userProfile");
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ session, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
