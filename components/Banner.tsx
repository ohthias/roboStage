import { Construction } from "lucide-react";
import Logo from "./UI/Logo";

export default function Banner() {
    return (
        <div className="alert alert-warning alert-soft rounded-none border-x-0 border-t-0">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <Construction className="h-6 w-6 shrink-0 self-start" />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Novidades em teste</span>
              <div className="badge badge-warning badge-sm">BETA</div>
            </div>

            <p className="mt-1 text-sm leading-relaxed">
              Você está utilizando uma versão beta do{" "}
              <span className="inline-flex align-middle">
                <Logo logoSize="sm" />
              </span>
              . Novas funcionalidades estão sendo liberadas gradualmente e
              alguns recursos podem apresentar instabilidades temporárias.
            </p>
          </div>
        </div>
      </div>
    )
}