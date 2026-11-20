# Stage UI — biblioteca de componentes do RoboStage

Next.js 16 · React 19 · Tailwind 4 · daisyUI 5 · lucide-react · framer-motion · tailwind-merge.

## O que ela é

A identidade visual do robostage.com.br, organizada em componentes:

- **Mesmos tokens do site.** `stage.css` traz os temas `lightScheme` / `darkScheme` com os valores
  exatos do `app/globals.css`. Nada muda de cor ao importar.
- **Padrões da home viram regra:** Roboto black com `tracking-tight`, kicker mono `/ SEÇÃO`,
  destaque inclinado em -1° (`bg-primary` itálico), canto recortado (`rounded-tl` + `rounded-br`),
  sombra dura de 4px (CTAs) e de 8px (cards de destaque), borda `base-300` no resto.
- **Tempero da referência:** stickers SVG (flor, engrenagem, explosão, nuvem…), o mascote **Bit**,
  bordas de seção recortadas (festonada, onda, papel rasgado), faixas em marquee e o wordmark
  gigante no rodapé. Use de 1 a 3 por seção, como acento.

## Instalação no RoboStage

1. Copie a pasta `components/stage/` para o projeto.
2. Em `app/globals.css`, troque os dois blocos `@plugin "daisyui/theme"` por:
   ```css
   @import "tailwindcss";
   @import "../components/stage/stage.css";
   ```
3. Ainda no `globals.css`, coloque a regra `.btn { border-radius: … }` dentro de
   `@layer components { … }`. Fora de camada, ela vence os utilitários `rounded-*`, e o
   `cornerBtn` da home (canto recortado dos CTAs) hoje não aparece por causa disso.
4. Em `app/layout.tsx`, mova `roboto.variable` do `<body>` para o `<html>`, para que
   `--font-sans` encontre a Roboto do `next/font`.

O arquivo `stage-ui-integracao.patch` aplica os quatro passos (`git apply stage-ui-integracao.patch`).

```tsx
import { Button, SectionTitle, MissionScorer } from "@/components/stage";
```

## Componentes

| Grupo | Componentes |
|---|---|
| Núcleo | `Button`, `ButtonLink`, `StickerTag`, `StatusBadge`, `Chip`, `Card`, `CardHeader`, `PanelSection`, `DisplayHeading`, `SectionTitle`, `Kicker`, `StatBlock` |
| Formulário | `Field`, `Input`, `Textarea`, `Select`, `SwitchRow`, `PillChoice`, `Stepper` |
| Dados / feedback | `TeamAvatar`, `AvatarStack`, `ChunkyProgress`, `EmptyState`, `SkeletonBlock`, `Tabs`, `Accordion` |
| Animações | `Reveal`, `Stagger`, `CountUp`, `FlipNumber`, `Typewriter`, `TiltCard`, `Magnetic`, `Shake`, `ScrollProgress`, `Parallax`, `confetti()`, `useCelebrate()`, `useInView()`, `useReducedMotion()` |
| Modais | `ModalPanel`, `Modal`, `ConfirmModal`, `AlertModal`, `InputModal`, `ResultModal`, `StepsModal`, `Sheet`, `ConfirmProvider` + `useConfirm()`, `useDialogBehavior` |
| Avisos | `Toast`, `ToastProvider` + `useToast()` (`toast`, `addToast`, `promise`, `update`, `dismiss`), `TOAST_STYLES` |
| Tipografia e texto | `Heading`, `Text`, `Highlight`, `Code`, `Kbd`, `Prose`, `TextBlock`, `SplitText`, `Columns`, `IconList`, `Steps`, `PullQuote`, `Callout`, `FactList`, `Timeline`, `MediaText`, `ArticleHeader`, `TableOfContents`, `ArticleLayout` |
| Cards de informação | `FeatureCard` (o card do QuickBrick), `StatCard`, `TeamCard`, `DocCard`, `QuoteCard`, `ChecklistCard` |
| Mais cards | `MatchCard` (partida: soon/live/done), `CountdownCard`, `AwardCard` (conquista com progresso), `RobotCard`, `MemberCard`, `NewsCard` (featured/vertical/horizontal), `ActionCard`, `GoalCard` + `ProgressRing`, `RunCompareCard` (antes × depois), `ActivityCard`, `TaskCard` (quadro da equipe), `MissionCard`, `CredentialCard` (crachá), `FlipCard` (flashcard do FlashQA) |
| Mídia | `StageImage`, `Tape`, `MediaGrid` (bento · grid · scatter), `MediaHero`, `ImageGallery` (lightbox), `StageVideo`, `VideoEmbed` (YouTube/Vimeo leve), `MediaDropzone` (upload com prévia) |
| Kit ferramenta | `ToolScope`, `ToolButton`, `IconButton`, `Toolbar` (+ `Group`, `Divider`, `Spacer`), `Panel`, `ToolSection`, `ToolInput`, `ToolSelect`, `PropertyRow`, `Segmented`, `ToolSwitch`, `ToolTabs`, `ToolBadge`, `ListItem`, `ListGroup`, `InfoTile`, `PlainCard`, `InlineAlert`, `ToolEmpty`, `KeyValue`, `DataTable`, `ToolDialog` |
| Capas | `Cover`, `CoverArt`, `TestCover`, `DocBanner`, `CoverPicker`, `CoverSwatch`, `coverFromSeed()`, `COVER_PATTERNS` (12 padrões) |
| Decoração | `Starburst`, `Flower`, `Gear`, `Cloud`, `Blob`, `Sparkle`, `Bolt`, `Squiggle`, `Mascot`, `Marquee`, `AnimatedBackground` |
| Bordas de seção | `SectionEdge variant` e as 15 bordas: `ScallopEdge`, `WaveEdge`, `TornEdge`, `ZigzagEdge`, `PixelEdge`, `SlantEdge`, `CurveEdge`, `TicketEdge`, `CheckerEdge`, `GearEdge`, `StudsEdge`, `CircuitEdge`, `CloudEdge`, `DripEdge`, `BrushEdge` (registro em `EDGES`) |
| Layout | `Logo`, `Navbar`, `ThemeToggle`, `Section`, `Footer`, `Sidebar` |
| Plataforma | `MissionScorer` + `scoreTask`, `ScoreBar`, `TimerDial`, `TimerControls`, `MatchTimer`, `RubricLevelPicker`, `EventCard`, `EventCardSkeleton`, `SeasonCard`, `RankingTable`, `LiveScoreboard`, `DashboardBanner`, `ToolFan`, `ToolCard`, `ProjectCard` |

## O que cada um substitui

| Hoje | Na Stage UI | Observação |
|---|---|---|
| `components/UI/Logo.tsx` | `Logo` | Mesma API (`logoSize`, `redirectIndex`), agora com `next/link`. |
| `components/home/shared.tsx` → `SectionTitle` | `SectionTitle` | Mesma API e visual; aceita também `highlightTone`. |
| `components/home/shared.tsx` → `AnimatedBackground` | `AnimatedBackground` | Mesmo CSS (`rs-*`). |
| `components/UI/Modal/BaseModal.tsx` | `Modal` | Mesma API (`open`, `onClose`, `title`, `description`, `size`, `footer`). |
| `components/UI/Accordion.tsx` | `Accordion` | Mesma API (`items: {title, content}`), com animação. |
| `app/context/ToastContext.tsx` | `ToastProvider` + `useToast()` | Mesmo `addToast(message, type, duration)`; ganha título, ação, `promise()`, pausa no hover e barra de tempo. |
| `components/UI/Modal/ModalConfirm.tsx` | `ConfirmModal` ou `useConfirm()` | Sem ref: `if (await confirm({ title })) …`; aceita ação assíncrona e `requireText`. |
| `components/UI/Modal/ModalAlert.tsx` | `AlertModal` | |
| `components/UI/Modal/ModalInput.tsx` | `InputModal` | Com `validate`. |
| `components/UI/Modal/ModalPoints.tsx`, `components/Timers/CompletionModal.tsx` | `ResultModal` | Pontuação grande, detalhamento e selo de recorde. |
| `components/dashboard/create-project-modal.tsx` | `StepsModal` | Assistente em etapas. |
| `components/QuickBrick/FerramentasSection.tsx` → `FerramentaCard` | `FeatureCard` | Mesmo visual e acessibilidade (link esticado, aba "Abrir ferramenta"); ganhou `tone`. |
| `components/UI/MessageCard.tsx` | `Toast` | Usava verde/vermelho fixos do Tailwind; agora usa os tokens do tema. |
| `components/UI/Cards/CardDefault.tsx` | `Card` + `CardHeader` | |
| `components/UI/Cards/CardSeason.tsx` | `SeasonCard` | |
| `components/UI/Cards/EventCardSkeleton.tsx` | `EventCard` / `EventCardSkeleton` | |
| `components/UI/panel-kit.tsx` | `PanelSection`, `SwitchRow`, `Button` | `ToggleRow` → `SwitchRow` (usa o `toggle` do daisyUI e é acessível). |
| `components/Timers/TimerCircle.tsx` + `ControlBar.tsx` | `TimerDial` + `TimerControls` | |
| `components/Rubric/IndicatorRow.tsx` (botões de nível) | `RubricLevelPicker` | Mesmo `LEVEL_LABELS`. |
| `components/dashboard/sidebar.tsx` | `Sidebar` | Recebe `user` por props (passe o `useUser()` da Clerk). |
| `components/dashboard/banner.tsx` | `DashboardBanner` | |
| `components/dashboard/recent-projects.tsx` | `ProjectCard` | |
| Pontuador FLL | `MissionScorer` | Lê o formato de `public/data/missions.json` (`switch`, opções, `range`, sub-missões). Confira `scoreTask` com a regra do pontuador atual antes de trocar. |

## Notas sobre os cards

- **`CredentialCard`:** o padrão no canto é decorativo, não é um QR Code legível. Para check-in, troque por um QR
  real (por exemplo, a biblioteca `qrcode`).
- **`CountdownCard`:** o servidor e o primeiro render mostram `--` e o relógio começa depois de montar, para não
  divergir na hidratação. O leitor de tela recebe a frase completa ("Faltam 15 dias, 17 horas…").
- **`FlipCard`:** vira no clique, no Enter/Espaço e no hover com mouse; sem JS, vira no hover e no foco.

## Modais e avisos

Coloque os providers uma vez no layout:

```tsx
<ToastProvider position="bottom-right">
  <ConfirmProvider>{children}</ConfirmProvider>
</ToastProvider>
```

```tsx
const { toast, addToast, promise } = useToast();
addToast("Equipe adicionada.", "success");                         // API atual
toast({ type: "error", message: "Teste excluído.", action: { label: "Desfazer", onClick: restore } });
await promise(saveRound(), { loading: "Salvando…", success: "Round salvo!", error: "Falhou." });

const confirm = useConfirm();
if (await confirm({ title: "Excluir teste?", requireText: "EXCLUIR" })) { … }
```

Todos os modais aceitam `inline`: desenham o painel parado na página, sem fundo escuro nem trava de
rolagem (vitrine, documentação, telas de exemplo). O `ModalPanel` é só o painel, para compor do zero.

Todos os modais (fora do modo `inline`) travam a rolagem da página, prendem o Tab dentro do painel, fecham com Esc, devolvem o
foco ao fechar e viram bottom sheet no celular. Use `data-autofocus` para escolher o primeiro campo focado.

## Kit ferramenta (QuickBrick, StageBook, LabTest)

Versão institucional e funcional para telas de trabalho: sem sticker, sem textura, sem inclinação, sem sombra
dura; alturas de 28–36 px, raio pequeno, foco visível. A marca fica no vermelho do botão primário e na Roboto.

```tsx
<ToolScope>                       {/* desliga texturas (data-texture="off") */}
  <Toolbar>
    <IconButton label="Rota (R)" icon={<Route />} active />
    <ToolbarSpacer />
    <ToolButton variant="primary" icon={<Save />}>Salvar</ToolButton>
  </Toolbar>
  <Panel title="Propriedades">
    <PropertyRow label="Velocidade"><ToolInput suffix="%" /></PropertyRow>
  </Panel>
  <DataTable columns={cols} rows={saidas} rowKey={(r) => r.id} onRowClick={select} />
</ToolScope>
```

**Quando usar:** vitrine (sticker, textura, sombra dura) em páginas públicas, home e dashboard; kit ferramenta onde
a pessoa trabalha por muito tempo — editor, tabelas, painéis de propriedades, documentos. O `DataTable` ordena por
coluna (com `aria-sort`) e a linha é selecionável por teclado. O `ToolDialog` tem o mesmo comportamento acessível do
`Modal` (foco preso, Esc, devolve o foco) e aceita `inline`.

## Capas e banners

```tsx
<TestCover code="T-014" title="Saída 2 · garra v2" robot="Bitzinho" runs={18} best={85} />
<DocBanner title="Reunião 14" icon="🦾" breadcrumb={["Equipe", "Caderno"]} actions={<ToolButton>Trocar capa</ToolButton>} />
<Cover title="Plano da temporada" kicker="Projeto" />      // padrão e cor saem do título
<CoverPicker value={{ pattern, tone }} onChange={save} />   // para o "Trocar capa"
```

- **12 padrões:** grid, dots, stripes, waves, circuit, gears, blocks, orbit, topo, confetti, arena, halftone.
- **Determinísticas:** sem `pattern`/`tone`, saem do `seed` (ou do título/código) — T-014 sempre tem a mesma capa,
  no servidor e no navegador. Guarde só `{ pattern, tone }` no banco quando a pessoa escolher outra.
- **SVG puro:** sem upload nem imagem externa; o texto fica em HTML, sobre um véu escuro que garante leitura em
  qualquer cor. `DocBanner` aceita `image` para usar foto.

## Bordas de seção

```tsx
<Section tone="night" edgeTop="gear" edgeBottom="checker">…</Section>
<SectionEdge variant="drip" color="var(--color-primary)" direction="down" height={44} />
```

| Grupo | Variantes |
|---|---|
| Da referência | `scallop` (festonada), `wave` (onda), `torn` (papel rasgado) |
| Geométricas | `zigzag`, `pixel`, `slant` (diagonal, `flip` inverte), `curve` (`concave` vira tigela), `ticket` (picote de ingresso), `checker` (bandeira de chegada) |
| Robótica | `gear` (engrenagem), `studs` (pinos de encaixe), `circuit` (trilha de placa com vias) |
| Orgânicas | `cloud` (nuvem), `drip` (tinta escorrendo — use `direction="down"`), `brush` (pincelada) |

- **Contrato único:** a forma fica embaixo e aponta para cima; `direction="down"` espelha para o rodapé. Use a cor
  da própria seção.
- **Fotos sem textura:** papel e grão nunca passam por cima de `img`, `video`, `iframe` ou `canvas` (regra em
  `stage.css`). `effect="none"` deixa a foto limpa; grão só com `effect="grain" | "halftone" | "duotone"`.
- **Sem emenda:** cada borda leva dentro do SVG a mesma textura de papel e grão da `<Section>`, calibrada contra o
  CSS (diferença máxima de 3/255 no claro e 1/255 no escuro). A `<Section>` repassa a textura certa sozinha; solta,
  use `texture="none" | "noise" | "both"`.
- **Determinísticas:** sem `Math.random`, então o HTML do servidor e o do navegador batem.

## Animações

Regras da casa:

1. **Nada some sem JS.** O HTML do servidor já vem no estado final (o `Reveal` só esconde depois de montar,
   o `CountUp` traz o valor final, o `Typewriter` mostra a primeira palavra).
2. **`prefers-reduced-motion` desliga tudo:** utilitários CSS, `Reveal`, contagens, parallax, inclinação e confete.
3. **Mesmos tokens em todo lugar:** `--ease-stage` (com quique: stickers e conquistas), `--ease-out` (entradas),
   `--ease-in-out` (trocas de estado) e `--duration-fast | base | slow | show` (150, 250, 500 e 900 ms).
4. **Movimento com motivo:** entrada, mudança de valor, resposta a uma ação ou celebração. Em telas de dados
   densas (pontuador, ranking ao vivo), só o número mudando.

```tsx
<Reveal effect="fade-up" delay={100}>…</Reveal>      // fade, fade-up/down, slide-left/right, pop, blur, drop
<Stagger step={80}>{itens}</Stagger>
<CountUp value={285} suffix=" pts" />
<FlipNumber value={score} minDigits={3} />            // placar do ShowLive
<Typewriter words={["robótica", "estratégia"]} />
<TiltCard><FeatureCard … /></TiltCard>
<Shake trigger={tentativas}><Field … /></Shake>
<Button onClick={(e) => confetti(e.currentTarget)}>Salvar recorde</Button>
<ScrollProgress />  <Parallax speed={0.1}>…</Parallax>
```

Utilitários CSS: `animate-spin-slow`, `animate-wiggle`, `animate-float`, `animate-live`, `animate-pop`,
`animate-drop`, `animate-rise`, `animate-shake`, `animate-blink`, `animate-marquee` e `stage-press`.

## Tipografia e texto

- **Escala:** `Heading level={1…6}` (Roboto black, tracking fechado) e `Text variant="lead | body | small | caption | mono"`.
- **Destaques:** `Highlight variant="block"` (o do hero), `"marker"` (marca-texto) e `"underline"` (sublinhado à mão).
- **Texto longo:** `Prose` usa o `@tailwindcss/typography` (já registrado no `globals.css` do RoboStage), com
  medida de 68 caracteres, títulos em black, links vermelhos, citação com barra e tabelas finas.
- **Layouts:** `TextBlock`, `SplitText` (título fixo + texto), `Columns`, `IconList`, `Steps`, `PullQuote`,
  `Callout` (`info`, `tip`, `success`, `warning`, `danger`, `rule`), `FactList`, `Timeline`, `MediaText` e
  `ArticleLayout` com `ArticleHeader` e `TableOfContents` (para notícias, docs e changelog).

## Texturas

Duas camadas, desenhadas atrás do conteúdo (sobre o fundo do elemento) e sem capturar cliques:

- **Ruído** (`stage-noise`): grão de impressão fino, em `overlay` no claro e `soft-light` no escuro.
- **Papel** (`stage-paper`): manchas suaves e fibras finas.
- **As duas** (`stage-texture`).

Os componentes já vêm texturizados: cards, botões cheios, etiquetas, seções, modal, toast, menu
lateral, navbar, rodapé, pontuador, ranking, placar e mídias. Os stickers SVG ganharam grão no
preenchimento e borda levemente irregular (prop `texture={false}` desliga).

Controle fino:

```tsx
<Card texture="none" />               // "none" | "noise" | "paper" | "both"
<Section tone="night" texture="noise" />
<Button texture={false}>Salvar</Button>
<div data-texture="strong">…</div>    // cartazes, capas, CTAs
<html data-texture="off">              // desliga em tudo (ex.: telas de dados densas)
```

As intensidades ficam em variáveis CSS (`--stage-noise-opacity`, `--stage-paper-opacity`, por tema).

## Imagens e vídeos

```tsx
<StageImage src="/images/fll/fll_about.jpg" alt="Equipe na mesa" frame="polaroid" tape tilt={-3} caption="Round 2" />
<StageImage src="…" alt="…" frame="card" effect="duotone" tone="secondary" badge="FLL" />
<MediaGrid layout="bento" items={[{ src, alt }, …]} />
<ImageGallery columns={4} items={[{ src, alt, caption, credit }, …]} />
<StageVideo src="/videos/round.mp4" poster="/videos/round.jpg" title="Round 2" badge="live" />
<VideoEmbed provider="youtube" id="ID_DO_VIDEO" title="Abertura do torneio" />
<MediaDropzone maxFiles={6} maxSizeMB={50} onChange={(files) => upload(files)} />
```

- **Molduras** (`frame`): `plain`, `card` (canto + sombra 8px), `polaroid`, `sticker`, `torn` (papel rasgado), `arch`.
  No vídeo: `plain`, `card`, `sticker` e `screen` (telão, para o ShowLive).
- **Efeitos** (`effect`): `none` (foto limpa, sem textura), `grain`, `halftone` (retícula), `duotone` (com `tone`).
- **StageImage** usa `next/image` com `fill`; para `src` remoto, libere o domínio em `images.remotePatterns`.
- **StageVideo** mostra os controles nativos até hidratar (funciona sem JS). Depois, controles da marca e
  atalhos com o player em foco: espaço/K, ←/→ (5 s), M, F. `ambient` = mudo, em loop, sem controles.
- **VideoEmbed** só carrega o iframe (youtube-nocookie / Vimeo dnt) no clique.
- **MediaDropzone** não envia nada: valida tipo, tamanho e quantidade, mostra as prévias e entrega
  `File[]` em `onChange`, para a tela decidir o destino (R2, anexo do StageBook…).

## Tons

`primary`, `secondary`, `accent`, `info`, `success`, `warning`, `neutral` (areia), `ink` (cor do texto),
`paper` (base-100). Mapas prontos em `lib.ts`: `toneFill`, `toneSoft` (ícone que enche no hover),
`toneText`, `toneVar` (para SVG).

## Utilitários CSS

`stage-shadow-sm | stage-shadow | stage-shadow-lg`, `stage-press` (sobe no hover, afunda no clique),
`stage-corner | -sm | -lg`, `stage-ink` (borda base-300), `stage-display`, `stage-kicker`, `stage-label`,
`stage-dots`, `stage-grid-on-color`, `stage-night` (superfície sempre escura), `stage-noise`, `stage-paper`,
`stage-texture`, `stage-halftone`, `stage-tape` e as animações
`animate-marquee`, `animate-spin-slow`, `animate-wiggle`, `animate-float`, `animate-live`, `animate-pop`
(todas desligadas com `prefers-reduced-motion`).
