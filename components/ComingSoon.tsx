"use client";

import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Image src="/progress.svg" alt="Em breve" width={100} height={100} className="w-full max-h-72"/>
      <h2 className="text-2xl font-bold">Em breve</h2>
      <p className="text-center text-lg max-w-md">
        Esta funcionalidade está em desenvolvimento e será lançada em breve. Fique
        atento para atualizações!
      </p>
      <div className="flex flex-col items-center">
        <span className="text-sm opacity-70">
          Enquanto isso, explore outras ferramentas disponíveis.
        </span>
      </div>
    </div>
  );
}
