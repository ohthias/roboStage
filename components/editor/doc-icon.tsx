"use client";

import type { CSSProperties, ComponentType } from "react";
import {
  Archive, BarChart3, Bell, BookOpen, Bookmark, Bot, Briefcase, Brush, Bug, Building2,
  Calendar, Camera, Car, CheckCircle2, ClipboardList, Clock, Cloud, Code2, Coffee,
  Compass, Cpu, CreditCard, Crown, Database, DollarSign, Dumbbell, Eye, FileText, Flag,
  Flame, FlaskConical, Folder, Gamepad2, Gem, Globe, GraduationCap, Hammer, Handshake,
  Heart, Home, Image as ImageIcon, Inbox, Key, Layers, LayoutDashboard, Leaf, Lightbulb,
  Link2, ListTodo, Lock, Mail, Map, MapPin, Megaphone, MessageSquare, Mic, Microscope,
  Moon, Music, Newspaper, Notebook, Package, Palette, PenTool, PieChart, Pizza, Plane,
  Puzzle, Rocket, Search, Server, Settings, Shield, ShoppingCart, Smile, Sparkles, Star,
  Sun, Tag, Target, Terminal, TrendingUp, Trophy, Truck, User, Users, Video, Wallet,
  Workflow, Wrench, Zap,
} from "lucide-react";
import { SWATCHES, bgVar, onSolidVar, solidVar, textVar } from "./editor-colors";
import { parseDocIcon, type DocIconValue } from "@/utils/stagebook/doc-icon";
import "./editor.css";

type IconDef = { Icon: ComponentType<{ size?: number; strokeWidth?: number }>; label: string; tags: string };

/** Catálogo de ícones disponíveis (id → componente). O id é o que vai para o banco. */
export const ICON_CATALOG: Record<string, IconDef> = {
  "file-text": { Icon: FileText, label: "Documento", tags: "arquivo pagina texto nota" },
  "book-open": { Icon: BookOpen, label: "Livro", tags: "leitura estudo guia" },
  notebook: { Icon: Notebook, label: "Caderno", tags: "anotacoes notas" },
  lightbulb: { Icon: Lightbulb, label: "Ideia", tags: "lampada insight" },
  rocket: { Icon: Rocket, label: "Foguete", tags: "lancamento startup" },
  target: { Icon: Target, label: "Alvo", tags: "meta objetivo foco" },
  flag: { Icon: Flag, label: "Bandeira", tags: "marco milestone" },
  star: { Icon: Star, label: "Estrela", tags: "favorito destaque" },
  heart: { Icon: Heart, label: "Coração", tags: "amor favorito" },
  zap: { Icon: Zap, label: "Raio", tags: "energia rapido" },
  flame: { Icon: Flame, label: "Fogo", tags: "urgente hot" },
  sparkles: { Icon: Sparkles, label: "Brilho", tags: "magia novo ia" },
  trophy: { Icon: Trophy, label: "Troféu", tags: "conquista premio" },
  crown: { Icon: Crown, label: "Coroa", tags: "premium rei" },
  gem: { Icon: Gem, label: "Gema", tags: "valor joia" },
  briefcase: { Icon: Briefcase, label: "Maleta", tags: "trabalho negocio" },
  calendar: { Icon: Calendar, label: "Calendário", tags: "data agenda evento" },
  clock: { Icon: Clock, label: "Relógio", tags: "tempo hora prazo" },
  "check-circle-2": { Icon: CheckCircle2, label: "Concluído", tags: "ok feito tarefa" },
  "list-todo": { Icon: ListTodo, label: "Tarefas", tags: "todo checklist" },
  "clipboard-list": { Icon: ClipboardList, label: "Prancheta", tags: "lista plano" },
  folder: { Icon: Folder, label: "Pasta", tags: "diretorio arquivos" },
  archive: { Icon: Archive, label: "Arquivo", tags: "guardar historico" },
  inbox: { Icon: Inbox, label: "Caixa de entrada", tags: "recebidos" },
  mail: { Icon: Mail, label: "E-mail", tags: "carta mensagem" },
  "message-square": { Icon: MessageSquare, label: "Mensagem", tags: "chat conversa" },
  users: { Icon: Users, label: "Equipe", tags: "pessoas time grupo" },
  user: { Icon: User, label: "Pessoa", tags: "perfil usuario" },
  handshake: { Icon: Handshake, label: "Acordo", tags: "parceria cliente" },
  megaphone: { Icon: Megaphone, label: "Megafone", tags: "anuncio marketing" },
  newspaper: { Icon: Newspaper, label: "Notícias", tags: "jornal blog" },
  bot: { Icon: Bot, label: "Robô", tags: "ia automacao agente" },
  cpu: { Icon: Cpu, label: "Processador", tags: "hardware chip" },
  "code-2": { Icon: Code2, label: "Código", tags: "dev programacao" },
  terminal: { Icon: Terminal, label: "Terminal", tags: "console shell cli" },
  database: { Icon: Database, label: "Banco de dados", tags: "sql dados" },
  server: { Icon: Server, label: "Servidor", tags: "infra backend" },
  cloud: { Icon: Cloud, label: "Nuvem", tags: "cloud deploy" },
  globe: { Icon: Globe, label: "Globo", tags: "web mundo site" },
  "link-2": { Icon: Link2, label: "Link", tags: "url referencia" },
  lock: { Icon: Lock, label: "Cadeado", tags: "seguranca privado" },
  key: { Icon: Key, label: "Chave", tags: "acesso senha" },
  shield: { Icon: Shield, label: "Escudo", tags: "protecao seguranca" },
  settings: { Icon: Settings, label: "Configurações", tags: "ajustes engrenagem" },
  wrench: { Icon: Wrench, label: "Ferramenta", tags: "manutencao ajuste" },
  hammer: { Icon: Hammer, label: "Martelo", tags: "construir obra" },
  palette: { Icon: Palette, label: "Paleta", tags: "design cores arte" },
  "pen-tool": { Icon: PenTool, label: "Caneta", tags: "desenho vetor" },
  brush: { Icon: Brush, label: "Pincel", tags: "arte pintura" },
  camera: { Icon: Camera, label: "Câmera", tags: "foto" },
  image: { Icon: ImageIcon, label: "Imagem", tags: "foto galeria" },
  music: { Icon: Music, label: "Música", tags: "audio som" },
  video: { Icon: Video, label: "Vídeo", tags: "filme gravacao" },
  mic: { Icon: Mic, label: "Microfone", tags: "podcast audio" },
  map: { Icon: Map, label: "Mapa", tags: "roteiro viagem" },
  "map-pin": { Icon: MapPin, label: "Local", tags: "endereco lugar" },
  compass: { Icon: Compass, label: "Bússola", tags: "direcao explorar" },
  plane: { Icon: Plane, label: "Avião", tags: "viagem voo" },
  car: { Icon: Car, label: "Carro", tags: "veiculo transporte" },
  truck: { Icon: Truck, label: "Caminhão", tags: "entrega logistica" },
  home: { Icon: Home, label: "Casa", tags: "inicio lar" },
  "building-2": { Icon: Building2, label: "Prédio", tags: "empresa escritorio" },
  "shopping-cart": { Icon: ShoppingCart, label: "Carrinho", tags: "compras loja" },
  "credit-card": { Icon: CreditCard, label: "Cartão", tags: "pagamento" },
  wallet: { Icon: Wallet, label: "Carteira", tags: "dinheiro financas" },
  "dollar-sign": { Icon: DollarSign, label: "Dinheiro", tags: "preco custo orcamento" },
  "trending-up": { Icon: TrendingUp, label: "Crescimento", tags: "vendas metricas" },
  "bar-chart-3": { Icon: BarChart3, label: "Gráfico de barras", tags: "relatorio dados" },
  "pie-chart": { Icon: PieChart, label: "Gráfico de pizza", tags: "relatorio analise" },
  layers: { Icon: Layers, label: "Camadas", tags: "stack niveis" },
  "layout-dashboard": { Icon: LayoutDashboard, label: "Painel", tags: "dashboard kanban" },
  workflow: { Icon: Workflow, label: "Fluxo", tags: "processo automacao" },
  package: { Icon: Package, label: "Pacote", tags: "produto entrega" },
  bug: { Icon: Bug, label: "Bug", tags: "erro defeito" },
  "flask-conical": { Icon: FlaskConical, label: "Experimento", tags: "teste laboratorio" },
  microscope: { Icon: Microscope, label: "Microscópio", tags: "pesquisa ciencia" },
  "graduation-cap": { Icon: GraduationCap, label: "Formatura", tags: "curso estudo" },
  leaf: { Icon: Leaf, label: "Folha", tags: "natureza eco" },
  sun: { Icon: Sun, label: "Sol", tags: "dia clima" },
  moon: { Icon: Moon, label: "Lua", tags: "noite" },
  coffee: { Icon: Coffee, label: "Café", tags: "pausa" },
  pizza: { Icon: Pizza, label: "Pizza", tags: "comida" },
  "gamepad-2": { Icon: Gamepad2, label: "Jogo", tags: "game lazer" },
  puzzle: { Icon: Puzzle, label: "Quebra-cabeça", tags: "plugin integracao" },
  bookmark: { Icon: Bookmark, label: "Marcador", tags: "salvar referencia" },
  tag: { Icon: Tag, label: "Etiqueta", tags: "categoria" },
  bell: { Icon: Bell, label: "Sino", tags: "alerta notificacao" },
  search: { Icon: Search, label: "Busca", tags: "pesquisa lupa" },
  eye: { Icon: Eye, label: "Olho", tags: "visao revisao" },
  smile: { Icon: Smile, label: "Sorriso", tags: "feliz feedback" },
  dumbbell: { Icon: Dumbbell, label: "Haltere", tags: "treino saude" },
};

/** Emojis agrupados para o seletor. */
export const EMOJI_GROUPS: { label: string; items: string[] }[] = [
  { label: "Trabalho", items: ["📝", "📌", "📎", "📊", "📈", "📉", "🗂️", "📁", "📅", "🗓️", "📋", "✅", "🎯", "💡", "🔧", "⚙️", "🧪", "🏁", "🚀", "💼", "📣", "🧾", "🗒️", "📚"] },
  { label: "Tecnologia", items: ["🤖", "💻", "🖥️", "⌨️", "🖱️", "📱", "🔌", "🔋", "🛰️", "🧠", "🔒", "🔑", "🌐", "☁️", "🧩", "🕹️", "🐛", "🧬", "📡", "💾"] },
  { label: "Rostos", items: ["😀", "😄", "😎", "🤓", "🥳", "🤩", "😍", "🤔", "😴", "🙌", "👏", "👍", "💪", "🙏", "👀", "🔥", "✨", "⭐", "❤️", "💜"] },
  { label: "Natureza", items: ["🌱", "🌿", "🌳", "🌸", "🌻", "🍀", "🌍", "🌙", "☀️", "⛅", "⚡", "❄️", "🌈", "🌊", "🐶", "🐱", "🦊", "🐼", "🦋", "🐝"] },
  { label: "Comida", items: ["☕", "🍕", "🍔", "🌮", "🍣", "🍰", "🍎", "🍓", "🥑", "🍷", "🍺", "🥗", "🍜", "🍪", "🍫", "🍿"] },
  { label: "Viagem & lazer", items: ["✈️", "🚗", "🚲", "🏠", "🏢", "🏖️", "⛰️", "🎮", "🎧", "🎬", "🎨", "🎸", "⚽", "🏀", "🏆", "🎁", "🎉", "🛒", "💰", "💎"] },
];

const GRADIENT_VAR: Record<string, string> = {
  sunset: "var(--ed-grad-sunset)",
  ocean: "var(--ed-grad-ocean)",
  forest: "var(--ed-grad-forest)",
  aurora: "var(--ed-grad-aurora)",
  candy: "var(--ed-grad-candy)",
  night: "var(--ed-grad-night)",
};

const known = new Set(SWATCHES.map((s) => s.id));

/** Estilos (fundo + cor do ícone) a partir do valor. */
export function docIconStyle(v: DocIconValue): { box: CSSProperties; color: string | undefined } {
  const box: CSSProperties = {};
  let color: string | undefined = v.color && known.has(v.color) ? textVar(v.color) : undefined;

  if (v.bg) {
    if (v.bg.startsWith("g:")) {
      box.backgroundImage = GRADIENT_VAR[v.bg.slice(2)];
      color = "#fff";
    } else if (v.mode === "solid") {
      box.background = solidVar(v.bg);
      color = onSolidVar(v.bg);
    } else {
      box.background = bgVar(v.bg);
      color = color ?? textVar(v.bg);
    }
  }
  return { box, color };
}

/**
 * Renderiza o ícone de uma página. Aceita o valor cru do banco:
 * emoji antigo ("📝") ou formato novo ("ico:rocket;b=blue;...").
 */
export function DocIcon({
  value,
  size = 20,
  fallback = "📝",
  className = "",
}: {
  value: string | DocIconValue | null | undefined;
  size?: number;
  fallback?: string | null;
  className?: string;
}) {
  const parsed = typeof value === "string" || value == null ? parseDocIcon(value) : value;
  const v = parsed ?? (fallback ? parseDocIcon(fallback) : null);
  if (!v) return null;

  const { box, color } = docIconStyle(v);
  const hasBg = !!v.bg && v.shape !== "none";
  const radius = v.shape === "circle" ? "9999px" : v.shape === "round" ? `${Math.round(size * 0.24)}px` : 0;
  const inner = Math.round(size * (hasBg ? 0.56 : 0.78));
  const def = v.kind === "icon" ? ICON_CATALOG[v.value] : null;

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        ...(hasBg ? box : {}),
        color: hasBg
          ? color
          : v.color && known.has(v.color)
            ? textVar(v.color)
            : v.bg && !v.bg.startsWith("g:") && known.has(v.bg)
              ? textVar(v.bg)
              : undefined,
      }}
    >
      {v.kind === "icon" ? (
        def ? (
          <def.Icon size={inner} strokeWidth={2} />
        ) : (
          <FileText size={inner} />
        )
      ) : (
        <span style={{ fontSize: inner, lineHeight: 1 }}>{v.value}</span>
      )}
    </span>
  );
}
