"use client";

import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function HubHero() {
    return (
        <section className="flex flex-col gap-8">
            {/* Banner de Boas-vindas */}
            <div
                className="hero rounded-xl shadow-lg bg-primary/65 border border-primary/75"
                aria-label="Bem-vindo ao seu Dashboard"
                role="region"
            >
                <div className="hero-overlay rounded-xl bg-black/30"></div>
                <div className="hero-content w-full flex flex-col items-start justify-start gap-4 text-left p-6 md:p-12">
                    <h1 className="text-4xl font-bold text-primary-content">
                        Bem-vindo ao seu Dashboard!
                    </h1>
                    <p className="text-lg text-primary-content max-w-2xl">
                        Seu hub para{" "}
                        <span className="font-semibold">gerenciar</span>,{" "}
                        <span className="font-semibold">testar</span> e{" "}
                        <span className="font-semibold">criar</span> seus robôs, projetos e eventos! Facilitando sua jornada na robótica!
                    </p>
                </div>
            </div>

            {/* Seção de Introdução */}
            <div className="collapse collapse-arrow bg-base-100 rounded-lg shadow-md border border-base-300">
                <input type="checkbox" className="peer" />
                <div className="collapse-title text-2xl font-bold text-secondary">
                    <SparklesIcon className="size-6 text-secondary inline-block mr-2" />
                    O que você pode fazer aqui?
                </div>
                <div className="collapse-content px-6">
                    <ul className="list-disc list-inside space-y-2 text-base-content">
                        <li>
                            <span className="font-semibold">Gerenciar Eventos:</span> Crie e administre eventos de robótica ao vivo com o ShowLive.
                        </li>
                        <li>
                            <span className="font-semibold">Testar Robôs:</span> Utilize o LabTest para simular e testar seus robôs em diversos cenários.
                        </li>
                        <li>
                            <span className="font-semibold">Personalizar Temas:</span> Use o StyleLab para criar temas únicos para seus eventos.
                        </li>
                        <li>
                            <span className="font-semibold">Gerenciar Tempo:</span> Utilize o Timer para controlar o tempo durante competições e testes.
                        </li>
                        <li>
                            <span className="font-semibold">Inovar com Diagramas:</span> Use o InnoLab para criar diagramas que ajudem a visualizar e planejar seus projetos. <i className="text-primary">Em correções</i>
                        </li>
                        <li>
                            <span className="font-semibold">Configurar Perfil:</span> Atualize suas informações pessoais e preferências na seção de Configurações.
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}