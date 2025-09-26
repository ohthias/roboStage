"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login, loading, error, success } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await login(email, password);
        if (ok) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-2/3 hidden md:flex flex-col justify-between bg-gradient-to-br from-primary via-secondary to-accent p-8 relative overflow-hidden">
                <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-tr from-accent via-secondary to-primary rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-bl from-primary via-secondary to-info rounded-full opacity-20 blur-3xl"></div>
                <Link href="/" className="inline-block">
                    <img
                        src="/images/logos/Icone.png"
                        alt="Logo"
                        className="h-12 w-auto hover:scale-105 transition-transform" />
                </Link>
            </div>
            <div className="w-full md:w-1/3 flex items-center justify-center bg-base-100 p-6">
                <div className="card w-full max-w-md shadow-2xl">
                    <div className="card-body">
                        <h2 className="text-3xl font-bold text-center mb-4">
                            Bem-vindo de volta!
                        </h2>

                        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                        {success && <p className="text-green-500 text-sm mb-2 text-center">{success}</p>}

                        <form className="form-control" onSubmit={handleSubmit}>
                            <label className="label" htmlFor="email">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="robostage@email.com"
                                className="input input-bordered w-full"
                                required />

                            <label className="label mt-4" htmlFor="password">
                                <span className="label-text">Senha</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input input-bordered w-full pr-10"
                                    required />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-3"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {/* Eye Slash (Heroicons) */}
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.05 10.05 0 012.17-3.36m3.11-2.53A9.97 9.97 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.05 10.05 0 01-4.17 5.36M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {/* Eye (Heroicons) */}
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9S3 17 3 12s4.03-9 9-9 9 4.03 9 9z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <label className="label">
                                <Link
                                    href="/auth/forgot-password"
                                    className="label-text-alt link link-hover"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </label>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-6"
                                disabled={loading}
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </button>
                        </form>

                        <p className="text-center mt-4">
                            Não tem uma conta?{" "}
                            <Link href="/auth/signup" className="link link-primary">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}