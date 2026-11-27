import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  Check,
  Flag,
  FlaskConical,
  KanbanSquare,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Radio,
  Shield,
  Timer,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProductHero } from "@/features/institutional/components/product/ProductHero";
import { FaqBlock, ProductCta } from "@/features/institutional/components/product/ProductBlocks";
import {
  ActivityCard,
  AvatarStack,
  ButtonLink,
  Callout,
  Card,
  ChunkyProgress,
  CredentialCard,
  FactList,
  Flower,
  Gear,
  IconList,
  Kicker,
  Marquee,
  Mascot,
  MemberCard,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  StatBlock,
  StatusBadge,
  Steps,
  StickerTag,
  TeamAvatar,
  TeamCard,
  Timeline,
  cn,
  toneFill,
  type Tone,
} from "@/components/stage";

export const metadata: Metadata = {
  title: "Equipes",
  description:
    "Um espaço compartilhado para a equipe de robótica: membros e cargos, treinos com presença e escala de funções, marcos da temporada, Kanban, ThinkLab e LabTest.",
};

/* -------------------------------------------------------------- dados */

const team = ["Ana Lima", "Bruno Sato", "Carla Dias", "Davi Rocha", "Eva Martins", "Felipe Nunes"];

const tabs: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: LayoutDashboard, title: "Geral", text: "Próximo marco, sessão em andamento, agenda e o que mudou na equipe.", tone: "primary" },
  { icon: KanbanSquare, title: "Kanban", text: "Quadros da equipe com responsáveis, prazos e prioridades.", tone: "accent" },
  { icon: Lightbulb, title: "ThinkLab", text: "Ishikawa, 5W2H e outros quadros para pensar junto.", tone: "secondary" },
  { icon: FlaskConical, title: "LabTests", text: "Os testes do robô da equipe, com todas as execuções.", tone: "primary" },
  { icon: Timer, title: "Treinos", text: "Sessões com presença, execuções e escala num lugar só.", tone: "accent" },
  { icon: Flag, title: "Marcos", text: "Torneios e entregas da temporada com contagem regressiva.", tone: "secondary" },
];

const roles: { label: string; description: string; tone: Tone; who: string; skills: string[] }[] = [
  { label: "Técnico", description: "Administra a equipe, os membros e os marcos. Único que exclui a equipe.", tone: "primary", who: "Ana Lima", skills: ["Convites", "Permissões", "Marcos"] },
  { label: "Mentor", description: "Administra a equipe, os membros e os marcos.", tone: "secondary", who: "Bruno Sato", skills: ["Escala", "Marcos", "Membros"] },
  { label: "Competidor", description: "Acesso a todos os recursos da equipe.", tone: "accent", who: "Carla Dias", skills: ["Treinos", "LabTest", "Kanban"] },
  { label: "Colaborador", description: "Acesso a todos os recursos da equipe.", tone: "neutral", who: "Davi Rocha", skills: ["Documentos", "ThinkLab"] },
];

const duties = ["Piloto", "Co-piloto", "Estrategista de mesa", "Apresentação do projeto"];
const roster: (string | null)[][] = [
  ["Carla Dias", "Carla Dias", "Eva Martins"],
  ["Eva Martins", "Felipe Nunes", "Carla Dias"],
  ["Davi Rocha", "Davi Rocha", "Davi Rocha"],
  [null, "Ana Lima", null],
];

const milestones = [
  { time: "set", title: "Lançamento da temporada", text: "Missões estudadas e primeiras estratégias no Stagebook.", tone: "secondary" as Tone },
  { time: "out", title: "Robô v2 pronto", text: "Base nova testada no LabTest.", tone: "accent" as Tone },
  { time: "nov", title: "Simulado interno", text: "Três rodadas com escala de funções.", current: true },
  { time: "dez", title: "Torneio regional", text: "Faltam 18 dias." },
];

const steps = [
  { title: "Crie a equipe", text: "Nome, escola ou organização, liga e temporada. Você entra como Técnico." },
  { title: "Convide as pessoas", text: "Mande convites por e-mail já com o cargo de cada um: Mentor, Competidor ou Colaborador." },
  { title: "Organize a temporada", text: "Marcos no calendário, quadros no Kanban e documentos no Stagebook, tudo dentro da equipe." },
  { title: "Treine com dados", text: "Inicie uma sessão: presença, escala e execuções do LabTest ficam registradas juntas." },
];

const faqs = [
  { q: "Quanto custa criar uma equipe?", a: "Nada. Criar a equipe, convidar membros e usar os recursos compartilhados é gratuito." },
  { q: "Quem pode convidar e mudar cargos?", a: "Técnicos e mentores. O mentor não concede o cargo de Técnico, e a equipe precisa ter sempre pelo menos um técnico." },
  { q: "O que é uma sessão de treino?", a: "É o registro de um treino, simulado ou competição. Enquanto ela está em andamento, as execuções do LabTest feitas por testes da equipe entram nela sozinhas, junto com a presença e a escala de funções. Ao encerrar, a sessão gera um resumo." },
  { q: "Posso ter coisas só minhas?", a: "Sim. Você troca entre o espaço pessoal e o espaço da equipe com um clique. O que é da equipe fica com a equipe; o que é seu fica com você." },
  { q: "Serve para FLL e OBR?", a: "Sim. A equipe escolhe a liga, e o catálogo de funções da escala pode ser editado nas configurações para refletir como a sua equipe compete." },
];

/* --------------------------------------------------------------- partes */

function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-md">
      <TeamCard
        name="Robôs do Sertão"
        number="4521"
        city="Petrolina · PE"
        tags={["FLL", "Challenge", "2026/27"]}
        stats={[
          { label: "Membros", value: 8 },
          { label: "Treinos", value: 23 },
          { label: "Melhor", value: 385 },
        ]}
        tone="secondary"
        className="-rotate-2 stage-shadow-lg"
      />
      <CredentialCard
        name="Carla Dias"
        team="Robôs do Sertão"
        role="Piloto"
        event="Regional · dez"
        code="RS-4521-07"
        tone="primary"
        className="relative -mt-12 ml-auto w-64 rotate-6"
      />
      <Sparkle size={34} tone="accent" motion="float" className="absolute -left-4 bottom-12" />
    </div>
  );
}

/** Prévia da aba Geral: cabeçalho da equipe, próximo marco, sessão e atividade. */
function OverviewPreview() {
  return (
    <div className="relative">
      <Gear size={80} tone="accent" motion="spin" className="absolute -right-6 -top-8 z-10" />
      <Card featured padded={false} className="overflow-hidden border border-base-300 shadow-[8px_8px_0_0_var(--color-primary)]">
        <div className="flex items-center gap-4 border-b border-base-300 p-5">
          <TeamAvatar name="Robôs do Sertão" size={48} tone="secondary" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-black tracking-tight">Robôs do Sertão</p>
            <p className="truncate text-xs text-base-content/55">EE Prof. Maria Lúcia · FLL · 2026/27</p>
          </div>
          <AvatarStack names={team} max={3} size={28} />
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="stage-noise rounded-tl-2xl rounded-br-2xl bg-secondary p-4 text-secondary-content">
            <p className="stage-kicker opacity-70">PRÓXIMO MARCO</p>
            <p className="mt-1 font-bold">Torneio regional</p>
            <StatBlock value="18" label="dias" className="mt-2" valueClassName="text-4xl" />
          </div>
          <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 p-4">
            <StatusBadge status="live">Sessão em andamento</StatusBadge>
            <p className="mt-2 font-bold">Treino de sábado</p>
            <p className="text-xs text-base-content/55">5 presentes · 12 execuções</p>
            <ChunkyProgress value={12} max={20} label="Meta do treino" tone="primary" className="mt-3" />
          </div>
        </div>
        <ActivityCard
          title="Atividade recente"
          className="rounded-none border-x-0 border-b-0 shadow-none"
          items={[
            { who: "Carla", action: "bateu o recorde em", target: "Missão 04 · 385", time: "agora", icon: <FlaskConical size={14} />, tone: "success" },
            { who: "Bruno", action: "publicou a escala do", target: "Simulado interno", time: "há 1 h", icon: <Users size={14} />, tone: "secondary" },
            { who: "Eva", action: "entrou na equipe como", target: "Competidora", time: "ontem", icon: <UserPlus size={14} />, tone: "accent" },
          ]}
        />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- página */

export default function EquipePage() {
  return (
    <>
      <Navbar />

      <ProductHero
        kicker="EQUIPES · ESPAÇO COMPARTILHADO"
        title="Todo mundo"
        highlight="junto e misturado!"
        description="Reúna técnicos, mentores e competidores num só lugar: treinos com presença e escala de funções, marcos da temporada e todas as ferramentas do RoboStage dentro do espaço da equipe."
        image=""
        primary={{ label: "Criar minha equipe", href: "/dashboard/team" }}
        secondary={{ label: "Ver como funciona", href: "#espaco" }}
        badges={[
          { label: "Cargos", href: "#cargos" },
          { label: "Treinos", href: "#treinos" },
          { label: "Escala", href: "#escala" },
          { label: "Marcos", href: "#marcos" },
        ]}
        aside={<HeroPreview />}
      />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        <div className="relative z-10 -my-2 overflow-hidden py-2">
          <Marquee
            items={["Piloto", "Estrategista", "Apresentação", "Mecânica", "Programação", "Documentação", "Peças e pit"]}
            tone="primary"
            tilt={-1}
            speed={40}
          />
        </div>

        {/* ========================================================= ESPAÇO */}
        <Section id="espaco" tone="glow">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
            <Reveal>
              <SectionTitle
                kicker="/ O ESPAÇO DA EQUIPE"
                title="Um lugar para"
                highlight="a equipe toda."
                highlightTone="secondary"
                description="Cada equipe ganha um espaço compartilhado. O que alguém cria ali fica visível para todos, e a aba Geral mostra num relance o que está acontecendo."
              />
              <IconList
                columns={2}
                className="mt-10"
                items={tabs.map(({ icon: Icon, title, text, tone }) => ({ icon: <Icon />, title, text, tone }))}
              />
            </Reveal>
            <Reveal delay={100} effect="pop">
              <OverviewPreview />
            </Reveal>
          </div>
        </Section>

        {/* ========================================================= CARGOS */}
        <Section id="cargos" tone="muted" edgeTop="torn" edgeBottom="torn">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ QUEM FAZ PARTE"
                  title="Cada pessoa no"
                  highlight="seu papel."
                  highlightTone="accent"
                  description="Quatro cargos deixam claro quem administra e quem treina. As permissões seguem o cargo, sem configuração extra."
                />
                <Flower size={64} tone="primary" motion="spin" className="hidden md:inline-block" />
              </div>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {roles.map(({ label, description, tone, who, skills }, i) => (
                <Reveal key={label} delay={i * 80} className="flex h-full flex-col gap-3">
                  <MemberCard name={who} role={label} roleTone={tone} skills={skills} className="flex-1" />
                  <p className="px-1 text-sm leading-6 text-base-content/65">{description}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Reveal>
                <Callout type="rule" title="Sempre com um técnico">
                  A equipe precisa de pelo menos um técnico. O último técnico não
                  pode sair nem ser rebaixado.
                </Callout>
              </Reveal>
              <Reveal delay={80}>
                <Callout type="info" title="Convites com cargo">
                  O convite por e-mail já leva o cargo da pessoa. O mentor convida
                  e gerencia membros, mas não concede o cargo de Técnico.
                </Callout>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* ========================================================= TREINOS */}
        <Section id="treinos">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <Reveal delay={100} effect="pop" className="relative order-2 lg:order-1">
              <Mascot size={78} motion="wiggle" rotate={-8} className="absolute -left-6 -top-12 z-10 hidden sm:block" />
              <Card featured padded={false} className="overflow-hidden border border-base-300">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
                  <div>
                    <p className="stage-kicker text-base-content/45">TREINO · SÁBADO</p>
                    <p className="text-lg font-black tracking-tight">Treino de sábado</p>
                  </div>
                  <StatusBadge status="live">Em andamento · 1h12</StatusBadge>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2">
                  <div>
                    <Kicker>PRESENÇA</Kicker>
                    <ul className="mt-3 space-y-2">
                      {team.slice(0, 5).map((name, i) => (
                        <li key={name} className="flex items-center gap-2.5 text-sm">
                          <TeamAvatar name={name} size={26} />
                          <span className="flex-1 truncate">{name}</span>
                          {i < 4 ? (
                            <Check size={15} className="text-success" />
                          ) : (
                            <span className="font-mono text-[10px] text-base-content/40">a caminho</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Kicker>EXECUÇÕES VINCULADAS</Kicker>
                    <FactList
                      className="mt-3"
                      items={[
                        { label: "Missão 04", value: "12 runs · melhor 385" },
                        { label: "Giro 90°", value: "8 runs · 92%" },
                        { label: "Anatix", value: "1 sessão" },
                      ]}
                    />
                  </div>
                </div>
                <div className="stage-night flex items-center gap-2 px-5 py-3 font-mono text-[11px] sm:text-xs">
                  <Radio size={13} className="text-[#9be15d]" />
                  Registrando na sessão <span className="text-[#fabd32]">Treino de sábado</span>
                </div>
              </Card>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <SectionTitle
                kicker="/ SESSÕES DE TREINO"
                title="O treino inteiro"
                highlight="num lugar só."
                description="Inicie uma sessão quando o treino começar. Quem estava presente, as execuções do LabTest e as sessões do Anatix ficam juntas, e no fim a equipe recebe um resumo."
              />
              <ul className="mt-8 space-y-3">
                {[
                  "Execuções dos testes da equipe entram na sessão sozinhas",
                  "Cada membro marca a própria presença",
                  "Treino, simulado ou competição, com local e notas",
                  "Resumo com duração, presentes, melhor e média por teste",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm sm:text-base">
                    <span className="grid size-7 shrink-0 place-items-center rounded-tl-md rounded-br-md bg-success/15 text-success">
                      <Check size={15} />
                    </span>
                    <span className="text-base-content/75">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Section>

        {/* ========================================================= ESCALA */}
        <Section id="escala" tone="night" edgeTop="studs" edgeBottom="studs">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.25fr] [&>*]:min-w-0">
            <Reveal>
              <p className="stage-kicker text-white/50">/ ESCALA DE FUNÇÕES</p>
              <h2 className="stage-display mt-3 text-3xl text-white sm:text-5xl">
                Quem pilota{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">em cada rodada?</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Monte a escala da sessão por função e por rodada. Ao publicar, cada
                pessoa escalada recebe um aviso. O catálogo de funções é da equipe e
                pode ser editado nas configurações.
              </p>
              <div className="mt-8 rounded-tl-2xl rounded-br-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
                <p className="inline-flex items-center gap-2 font-mono text-[11px] text-[#fabd32]">
                  <Bell size={13} /> NOTIFICAÇÃO
                </p>
                <p className="mt-1.5">
                  Você é <strong className="text-white">Piloto</strong> nas rodadas 1 e 2 do{" "}
                  <em>Simulado interno</em>, sáb 14/11.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100} effect="pop">
              <div className="stage-paper overflow-x-auto rounded-tl-[2rem] rounded-br-[2rem] bg-base-100 p-5 text-base-content stage-shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-black tracking-tight">Simulado interno</p>
                  <StickerTag tone="success" size="sm" shadow={false}>Publicada</StickerTag>
                </div>
                <table className="w-full min-w-[460px] border-separate border-spacing-1.5 text-sm">
                  <thead>
                    <tr>
                      <th className="stage-kicker w-40 text-left font-normal text-base-content/45">FUNÇÃO</th>
                      {[1, 2, 3].map((r) => (
                        <th key={r} className="stage-kicker text-left font-normal text-base-content/45">R{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((duty, d) => (
                      <tr key={duty}>
                        <th scope="row" className="pr-2 text-left text-xs font-bold">{duty}</th>
                        {roster[d].map((name, r) => (
                          <td key={r}>
                            {name ? (
                              <span
                                className={cn(
                                  "flex items-center gap-1.5 rounded-tl-lg rounded-br-lg px-2 py-1.5 text-xs font-semibold",
                                  name === "Carla Dias" ? toneFill.primary : "bg-base-200",
                                )}
                              >
                                <TeamAvatar name={name} size={20} />
                                <span className="truncate">{name.split(" ")[0]}</span>
                              </span>
                            ) : (
                              <span className="block rounded-tl-lg rounded-br-lg border border-dashed border-base-300 px-2 py-1.5 text-center text-xs text-base-content/35">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-right font-mono text-[10px] text-base-content/40">exemplo · FLL</p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ========================================================= MARCOS */}
        <Section id="marcos">
          <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
            <Reveal>
              <SectionTitle
                kicker="/ MARCOS DA TEMPORADA"
                title="Todo mundo sabe"
                highlight="o que vem aí."
                highlightTone="secondary"
                description="Técnicos e mentores criam os marcos da temporada: torneios, entregas e simulados. A aba Geral mostra a contagem regressiva do próximo, e a linha do tempo conta a história da equipe."
              />
              <div className="mt-8 grid grid-cols-3 gap-4">
                <StatBlock value="18" label="dias para o regional" tone="primary" />
                <StatBlock value="4" label="marcos" tone="secondary" />
                <StatBlock value="23" label="treinos" tone="accent" />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Card corner className="border border-base-300 p-7">
                <Kicker className="mb-6">LINHA DO TEMPO</Kicker>
                <Timeline items={milestones} />
              </Card>
            </Reveal>
          </div>
        </Section>

        {/* ========================================================= COMEÇAR */}
        <Section className="border-t border-base-300">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle kicker="/ COMO COMEÇAR" title="Do cadastro ao" highlight="primeiro treino." />
                <ButtonLink href="/dashboard/team" iconLeft={<Shield size={18} />} iconRight={<ArrowRight size={16} />}>
                  Criar equipe
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Steps items={steps} className="mt-14" />
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-10 inline-flex items-center gap-2 text-sm text-base-content/60">
                <Mail size={16} className="text-secondary" />
                Já recebeu um convite? Entre com o mesmo e-mail e ele aparece no seu painel.
              </p>
            </Reveal>
          </div>
        </Section>

        <FaqBlock title="Perguntas sobre" highlight="equipes." items={faqs} />

        <ProductCta
          kicker="SUA EQUIPE"
          icon={Users}
          title="Chame a equipe e comece a temporada junto."
          text="Crie o espaço, convide quem treina com você e deixe treinos, escala e marcos no mesmo lugar."
          primary={{ label: "Criar minha equipe", href: "/dashboard/team" }}
          links={[
            { label: "Conhecer o Stagebook", href: "/stagebook" },
            { label: "Conhecer o LabTest", href: "/labtest" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
