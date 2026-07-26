import { LucideIcon } from "lucide-react";
import Breadcrumbs from "../UI/Breadcrumbs";

interface HeaderToolProps {
  NameTool: string;
  DescriptionTool: string;
  IconTool: LucideIcon;
}

export default function HeaderTool({
  NameTool,
  DescriptionTool,
  IconTool,
}: HeaderToolProps) {
  return (
    <div className="flex flex-col items-start justify-start gap-3 px-4 pt-8">
      <Breadcrumbs start="fll" />
      <div className="flex flex-col items-start justify-start gap-2">
        <div className="flex items-center justify-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <IconTool size={22} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-primary">
            {NameTool}
          </h3>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-base-content/70">
          {DescriptionTool}
        </p>
      </div>
    </div>
  );
}
