"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

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
  const { addToast } = useToast();

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

  // Função para converter imagem em WebP
  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas não suportado"));

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" }));
            } else {
              reject(new Error("Erro ao converter imagem para WebP"));
            }
          },
          "image/webp",
          0.8 // qualidade do WebP
        );
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Função para salvar no banco
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      addToast("Usuário não encontrado. Faça login novamente.", "error");
      return;
    }

    setLoading(true);

    try {
      let backgroundUrl = null;

      // Upload da imagem no Storage (convertendo antes para webp)
      if (file) {
        const webpFile = await convertToWebP(file);
        const path = `themes/${userId}/${Date.now()}-${webpFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("style-backgrounds")
          .upload(path, webpFile);

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

      addToast("Tema criado com sucesso!", "success");
      onClose();
    } catch (err: any) {
      console.error(err);
      addToast("Erro ao criar tema: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg relative">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Criar Tema</h2>

        {/* Barra de progresso de steps */}
        <ul className="steps w-full mb-6">
          <li className={`step ${step >= 1 ? "step-primary text-primary font-semibold" : ""} text-base-content/75 text-sm`}>Nome</li>
          <li className={`step ${step >= 2 ? "step-primary text-primary font-semibold" : ""} text-base-content/75 text-sm`}>Cores</li>
          <li className={`step ${step >= 3 ? "step-primary text-primary font-semibold" : ""} text-base-content/75 text-sm`}>Imagem</li>
          <li className={`step ${step >= 4 ? "step-primary text-primary font-semibold" : ""} text-base-content/75 text-sm`}>Finalizar</li>
        </ul>

        <form
          className="relative"
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (step < 4) {
                e.preventDefault();
                if (
                  (step === 1 && name.trim() !== "") ||
                  (step === 2 && colors.every((c) => !!c)) ||
                  (step === 3 && file)
                ) {
                  next();
                }
              }
            }
          }}
        >
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
                    required
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
                      required
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
                  required
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
                  Criando o tema <span className="text-primary">{name}</span>
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
                  disabled={
                    (step === 1 && name.trim() === "") ||
                    (step === 2 && colors.some((c) => !c)) ||
                    (step === 3 && !file)
                  }
                >
                  Próximo
                </button>
              ) : (
                <button type="submit" className="btn btn-success" disabled={loading}>
                  Criar Tema
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}