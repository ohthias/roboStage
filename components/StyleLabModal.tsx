"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";

type StyleLabModalProps = {
  onClose: () => void;
};

export default function StyleLabModal({ onClose }: StyleLabModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [colors, setColors] = useState<string[]>(["#000000", "#ffffff", "#cccccc"]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUserId(data.user.id);
      }
    };
    fetchUser();
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Função para salvar no banco
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }

    setLoading(true);

    try {
      let backgroundUrl = null;

      // Upload da imagem no Storage
      if (file) {
        const path = `themes/${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("style-backgrounds")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("style-backgrounds").getPublicUrl(path);
        backgroundUrl = data.publicUrl;
      }

      // Inserção no banco
      const { error } = await supabase.from("styleLab").insert([
        {
          id_user: userId,
          name,
          colors,
          background_url: backgroundUrl,
        },
      ]);

      if (error) throw error;

      alert("Tema criado com sucesso!");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Erro ao criar tema: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg relative">
        <h2 className="text-xl font-bold mb-4">✨ Criar Tema</h2>

        {/* Barra de progresso de steps */}
        <ul className="steps w-full mb-6">
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Nome</li>
          <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Cores</li>
          <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Imagem</li>
          <li className={`step ${step >= 4 ? "step-primary" : ""}`}>Finalizar</li>
        </ul>

        <form className="relative" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome do Tema</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dark Mode"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-3 gap-4 w-full"
              >
                {["Primária", "Secundária", "Texto"].map((label, i) => (
                  <div className="form-control" key={i}>
                    <label className="label">
                      <span className="label-text">{label}</span>
                    </label>
                    <input
                      type="color"
                      className="input input-bordered h-10 w-full p-1 cursor-pointer"
                      value={colors[i]}
                      onChange={(e) => {
                        const newColors = [...colors];
                        newColors[i] = e.target.value;
                        setColors(newColors);
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="form-control w-full"
              >
                <label className="label">
                  <span className="label-text">Imagem</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                  }}
                />
                {file && (
                  <div className="mt-4 flex justify-center">
                    <img
                      alt="Preview"
                      className="max-h-56 rounded-lg shadow-lg object-contain bg-base-200"
                      src={URL.createObjectURL(file)}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4 w-full"
              >
                <p className="text-lg font-semibold">
                  🎉 Pronto para criar o tema?
                </p>
                <p className="text-sm text-gray-500">
                  Revise as informações e clique em <b>Criar</b> para salvar seu tema.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loader Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200/70 rounded-lg">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}

          {/* Ações */}
          <div className="modal-action mt-10 flex justify-between">
            <div>
              {step > 1 && (
                <button type="button" className="btn btn-ghost" onClick={prev}>
                  Voltar
                </button>
              )}
            </div>
            <div>
              {step < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={next}
                >
                  Próximo
                </button>
              ) : (
                <button type="submit" className="btn btn-success" disabled={loading}>
                  Criar Tema
                </button>
              )}
              <button type="button" className="btn btn-ghost ml-2" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}