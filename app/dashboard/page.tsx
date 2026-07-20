import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  Bell,
  CreditCard,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();

  const displayName =
    user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress || "Usuário";

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "Sem e-mail";

  const stats = [
    {
      label: "Conta",
      value: "Ativa",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      label: "Sessões",
      value: "Seguras",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Notificações",
      value: "Habilitadas",
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  const shortcuts = [
    {
      title: "Dados da conta",
      description: "Veja nome, e-mail e identificadores do usuário.",
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      title: "Segurança",
      description: "Gerencie sessões, dispositivos e autenticação.",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      title: "Assinatura",
      description: "Acompanhe plano, limites e status da conta.",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  return (
    <main className="min-h-screen bg-base-200">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-3xl bg-base-100 p-6 shadow-sm">
          <div>
            <p className="text-sm opacity-70">Área da conta</p>
            <h1 className="mt-1 text-3xl font-bold">Bem-vindo, {displayName}</h1>
            <p className="mt-2 text-sm opacity-70">{email}</p>
          </div>

          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverCard: "shadow-xl",
                },
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-base-100 p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm opacity-70">{item.label}</p>
                  <h2 className="text-xl font-semibold">{item.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-base-100 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm opacity-70">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}