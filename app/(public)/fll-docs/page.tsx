"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { useEffect, useState } from "react";

interface DocCard {
    title: string;
    description: string;
    url: string;
}

export default function FllDocs() {
    const [docs, setDocs] = useState<DocCard[]>([]);

    useEffect(() => {
        fetch("/api/data/fllDocs")
            .then((res) => res.json())
            .then((data) => setDocs(data))
            .catch((err) => console.error("Erro ao carregar documentos:", err));
    }, []);

    return (
        <>
            <Navbar />
            <div className="p-8 max-w-5xl mx-auto min-h-screen">
                <h1 className="text-4xl font-extrabold text-center mb-6 text-primary">
                    Documentações
                </h1>
                <p className="text-center text-base-content mb-10">
                    Aqui você encontra os principais materiais de referência da temporada: regras, caderno de engenharia, guias e atualizações.
                </p>

                <div className="grid gap-8 md:grid-cols-2">
                    {docs.map((doc, idx) => (
                        <div
                            key={idx}
                            className="card bg-base-200 shadow-xl border border-base-300 hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200"
                        >
                            <div className="card-body">
                                <h2 className="card-title text-primary text-xl">{doc.title}</h2>
                                <p className="mb-4 text-base-content">{doc.description}</p>
                                <div className="card-actions justify-end">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Acessar
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
