"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "@/components/hero";

export default function CodePage() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const trimmedCode = code.trim();

        if (!trimmedCode) {
            setError("Digite um código válido.");
            setLoading(false);
            return;
        }

        const { data, error: fetchError } = await supabase
            .from("public_event_lookup")
            .select("id_evento, type")
            .eq("code", trimmedCode)
            .single();

        if (fetchError) {
            console.error(fetchError);
            setError("Erro ao buscar o evento. Tente novamente.");
            setLoading(false);
            return;
        }

        if (!data) {
            setError("Código não encontrado.");
            setLoading(false);
            return;
        }

        const route = data.type === "visit" ? "visit" : "volunteer";
        router.push(`/${route}/${data.id_evento}`);
        setLoading(false);
    };

    return (
        <div>
            <Hero />
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-4"
                >
                    <h2 className="text-2xl font-bold text-center">Insira seu código</h2>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Digite seu código..."
                        className="w-full p-3 border border-gray-300 rounded-md"
                        disabled={loading}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                Carregando...
                            </span>
                        ) : (
                            "Acessar"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
