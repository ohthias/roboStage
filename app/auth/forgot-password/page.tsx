"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        console.log(data, error);

        if (error) {
            setStatus(error.message);
        } else {
            setStatus("Enviamos um link para redefinir sua senha!");
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-2/3 hidden md:flex flex-col justify-between bg-base-300 p-8">
                <Link href="/" className="inline-block">
                    <img
                        src="/images/logos/Icone.png"
                        alt="Logo"
                        className="h-12 w-auto hover:scale-105 transition-transform"
                    />
                </Link>
            </div>

            <div className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
                <div className="card w-full max-w-md shadow-2xl">
                    <div className="card-body">
                        <h2 className="text-3xl font-bold text-center mb-4">
                            Recuperar Senha
                        </h2>
                        <p className="text-center mb-4 text-sm text-gray-500">
                            Digite seu email para receber as instruções.
                        </p>

                        {status && (
                            <p className="text-center text-sm mb-2 text-blue-500">{status}</p>
                        )}

                        <form className="form-control" onSubmit={handleSubmit}>
                            <label className="label" htmlFor="email">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="input input-bordered w-full"
                                required
                            />

                            <button type="submit" className="btn btn-primary w-full mt-6">
                                Enviar Link de Recuperação
                            </button>
                        </form>

                        <p className="text-center mt-4">
                            <Link href="/auth/login" className="link link-primary">
                                Voltar ao Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}