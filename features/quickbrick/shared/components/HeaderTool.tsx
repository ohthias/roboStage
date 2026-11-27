import { LucideIcon } from "lucide-react";

interface HeaderToolProps {
  NameTool: string;
  DescriptionTool: string;
  IconTool: LucideIcon;
}

// Cabeçalho das telas do QuickBrick na Stage UI: kicker mono, ícone em caixa
// com canto recortado e sombra dura, título em Roboto black.
export default function HeaderTool({ NameTool, DescriptionTool, IconTool }: HeaderToolProps) {
  return (
    <header className="flex flex-col items-start gap-3 px-4 pt-8">
      <p className="stage-kicker text-base-content/45">/ QUICKBRICK STUDIO</p>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-primary text-primary-content shadow-[4px_4px_0_0_var(--stage-shadow)]">
          <IconTool size={22} />
        </span>
        <h1 className="stage-display text-3xl sm:text-4xl">{NameTool}</h1>
      </div>
      <p className="max-w-2xl text-base leading-relaxed text-base-content/65">{DescriptionTool}</p>
    </header>
  );
}
