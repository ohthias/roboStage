import { Construction } from "lucide-react";

export default function Banner() {
  return (
    <div className="alert alert-error alert-soft rounded-none border-x-0 border-t-0">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <Construction className="h-6 w-6 shrink-0 self-start" />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Aviso de manutenção</span>
          </div>

          <p className="mt-1 text-sm leading-relaxed">
            Estamos realizando uma atualização da infraestrutura do RoboStage, incluindo a migração para um novo serviço de banco de dados. Durante esse processo, algumas funcionalidades podem apresentar instabilidades ou indisponibilidade temporária. Essas melhorias têm como objetivo aumentar a performance, a estabilidade e a confiabilidade da plataforma. Agradecemos sua compreensão e paciência enquanto concluímos essa atualização.
          </p>
        </div>
      </div>
    </div>
  );
}