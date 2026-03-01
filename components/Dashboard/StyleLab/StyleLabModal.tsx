"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import { StyleLabTheme } from "@/app/(private)/dashboard/stylelab/page";
import { BaseModal } from "../UI/BaseModal";

type StyleLabModalProps = {
  onClose: () => void;
  theme?: StyleLabTheme | null;
};

const stepMeta = {
  1: {
    title: "Nome do Tema",
    description: "Escolha um nome para identificar este estilo.",
  },
  2: {
    title: "Paleta de Cores",
    description: "Defina as cores principais do tema.",
  },
  3: {
    title: "Imagem de Fundo",
    description: "Adicione ou altere a imagem do tema.",
  },
  4: {
    title: "Finalização",
    description: "Revise as informações antes de salvar.",
  },
} as const;

export default function StyleLabModal({ onClose, theme }: StyleLabModalProps) {
  const isEdit = Boolean(theme);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [colors, setColors] = useState<string[]>([
    "#000000",
    "#ffffff",
    "#cccccc",
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { addToast } = useToast();

  /* =======================
     Pré-carregar dados
  ======================= */
  useEffect(() => {
    if (theme) {
      setName(theme.name);
      setColors(theme.colors);
      setBackgroundUrl(theme.background_url);
      setBackgroundBlur(theme.background_blur ?? false);
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const stepVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  const convertToWebP = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject();
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject();
            resolve(
              new File([blob], "background.webp", { type: "image/webp" })
            );
          },
          "image/webp",
          0.8
        );
      };
    });

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      addToast("Usuário não autenticado.", "error");
      return;
    }

    setLoading(true);

    try {
      let finalBackgroundUrl = backgroundUrl;

      if (file) {
        const webp = await convertToWebP(file);
        const path = `style-lab/backgrounds/${userId}/background-${crypto.randomUUID()}.webp`;

        const { error } = await supabase.storage
          .from("style-backgrounds")
          .upload(path, webp, { upsert: true });

        if (error) throw error;

        finalBackgroundUrl = supabase.storage
          .from("style-backgrounds")
          .getPublicUrl(path).data.publicUrl;
      }

      if (isEdit && theme) {
        await supabase
          .from("styleLab")
          .update({
            name,
            colors,
            background_url: finalBackgroundUrl,
            background_blur: backgroundBlur,
          })
          .eq("id_theme", theme.id_theme);

        addToast("Tema atualizado com sucesso!", "success");
      } else {
        await supabase.from("styleLab").insert({
          id_user: userId,
          name,
          colors,
          background_url: finalBackgroundUrl,
          background_blur: backgroundBlur,
        });

        addToast("Tema criado com sucesso!", "success");
      }

      onClose();
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar tema.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? "Editar Estilo" : "Novo Estilo"}
      description={stepMeta[step as keyof typeof stepMeta].description}
      footer={
        <div className="flex gap-3">
          {step > 1 && (
            <button className="btn btn-ghost flex-1" onClick={prev}>
              Voltar
            </button>
          )}

          {step < 4 ? (
            <button
              className="btn btn-primary flex-1"
              onClick={next}
              disabled={step === 1 && !name.trim()}
            >
              Próximo
            </button>
          ) : (
            <button
              className="btn btn-success flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {isEdit ? "Salvar Alterações" : "Criar Tema"}
            </button>
          )}
        </div>
      }
    >
      {/* Stepper */}
      <ul className="steps w-full mb-6 text-xs sm:text-sm">
        {["Nome", "Cores", "Imagem", "Finalizar"].map((label, i) => (
          <li
            key={label}
            className={`step ${step >= i + 1 ? "step-primary" : ""}`}
          >
            {label}
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mb-4">
        {stepMeta[step as keyof typeof stepMeta].title}
      </h3>

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div {...stepVariants}>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex: Dark Modern"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div {...stepVariants} className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: colors[1], color: colors[2] }}
            >
              <h4 className="font-bold" style={{ color: colors[0] }}>
                Preview
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["Primária", "Secundária", "Texto"].map((label, i) => (
                <label key={label} className="form-control">
                  <span className="label-text text-xs">{label}</span>
                  <input
                    type="color"
                    value={colors[i]}
                    onChange={(e) => {
                      const c = [...colors];
                      c[i] = e.target.value;
                      setColors(c);
                    }}
                    className="h-10 rounded-lg cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div {...stepVariants} className="space-y-4">
            <label className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer">
              <span className="text-sm opacity-60">
                Clique ou arraste uma imagem
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {(file || backgroundUrl) && (
              <img
                src={file ? URL.createObjectURL(file) : backgroundUrl || ""}
                className={`rounded-xl max-h-40 mx-auto ${
                  backgroundBlur ? "blur-sm" : ""
                }`}
              />
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={backgroundBlur}
                onChange={(e) => setBackgroundBlur(e.target.checked)}
              />
              <span className="text-sm">Aplicar desfoque no fundo</span>
            </label>
          </motion.div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <motion.div {...stepVariants} className="space-y-4">
            <p className="font-semibold">{name}</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <div
                  key={c}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="text-sm opacity-70">
              Blur do fundo: {backgroundBlur ? "Ativado" : "Desativado"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 bg-base-200/70 flex items-center justify-center rounded-xl">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}
    </BaseModal>
  );
}