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
import { supabase } from "@/utils/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface UserContextType {
  session: any;
  profile: Profile | null;
  avatarUrl?: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  session: null,
  profile: null,
  avatarUrl: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = async (data: Profile) => {
    setProfile(data);
    localStorage.setItem("userProfile", JSON.stringify(data));
  };

  /* ================= FETCH ================= */

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setProfile(null);
      localStorage.removeItem("userProfile");
      return;
    }

    await applyProfile(data as Profile);
  };

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const cached = localStorage.getItem("userProfile");
        if (cached) {
          const parsed: Profile = JSON.parse(cached);
          await applyProfile(parsed);
        } else {
          await fetchProfile(data.session.user.id);
        }
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setLoading(true);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          localStorage.removeItem("userProfile");
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        session,
        profile,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
