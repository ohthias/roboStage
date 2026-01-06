"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import { StyleLabTheme } from "@/app/(private)/dashboard/stylelab/page";

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

  /* =========================================================
     Pré-carregar dados (edição)
  ========================================================= */
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
              new File([blob], "background.webp", {
                type: "image/webp",
              })
            );
          },
          "image/webp",
          0.8
        );
      };
    });

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */
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
        const safeFileName = `background-${crypto.randomUUID()}.webp`;
        const path = `style-lab/backgrounds/${userId}/${safeFileName}`;

        const { error } = await supabase.storage
          .from("style-backgrounds")
          .upload(path, webp, { upsert: true });

        if (error) throw error;

        finalBackgroundUrl = supabase.storage
          .from("style-backgrounds")
          .getPublicUrl(path).data.publicUrl;
      }

      if (isEdit && theme) {
        const { error } = await supabase
          .from("styleLab")
          .update({
            name,
            colors,
            background_url: finalBackgroundUrl,
            background_blur: backgroundBlur,
          })
          .eq("id_theme", theme.id_theme);

        if (error) throw error;

        addToast("Tema atualizado com sucesso!", "success");
      } else {
        const { error } = await supabase.from("styleLab").insert([
          {
            id_user: userId,
            name,
            colors,
            background_url: finalBackgroundUrl,
            background_blur: backgroundBlur,
          },
        ]);

        if (error) throw error;

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
    <div className="modal modal-open px-2">
      <div className="modal-box max-w-lg w-full rounded-2xl">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Steps */}
        <ul className="steps steps-horizontal w-full mb-6 text-xs sm:text-sm">
          {["Nome", "Cores", "Imagem", "Finalizar"].map((label, i) => (
            <li
              key={i}
              className={`step ${step >= i + 1 ? "step-primary" : ""}`}
            >
              {label}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold">
          {stepMeta[step as keyof typeof stepMeta].title}
        </h2>
        <p className="text-sm text-base-content/60 mb-6">
          {stepMeta[step as keyof typeof stepMeta].description}
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="form-control"
              >
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
              <motion.div
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: colors[1], color: colors[2] }}
                >
                  <h3
                    className="text-lg font-bold"
                    style={{ color: colors[0] }}
                  >
                    Preview
                  </h3>
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: colors[1] }}>
                        <th className="p-2 text-left">Equipe</th>
                        <th className="p-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2">Alpha</td>
                        <td className="p-2 text-right">320</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["Primária", "Secundária", "Texto"].map((label, i) => (
                    <label key={i} className="form-control">
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
              <motion.div
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer">
                  <span className="text-sm opacity-60">
                    Clique ou arraste uma imagem (opcional)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>

                {(file || backgroundUrl) && (
                  <img
                    src={file ? URL.createObjectURL(file) : backgroundUrl || ""}
                    className={`rounded-xl max-h-40 mx-auto object-cover ${
                      backgroundBlur ? "blur-sm" : ""
                    }`}
                  />
                )}

                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={backgroundBlur}
                    onChange={(e) => setBackgroundBlur(e.target.checked)}
                  />
                  <span className="label-text">Aplicar desfoque no fundo</span>
                </label>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <p className="font-semibold">{name}</p>
                <div className="flex gap-2">
                  {colors.map((c, i) => (
                    <div
                      key={i}
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

          {/* Actions */}
          <div className="mt-8 flex justify-between gap-2">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-ghost w-1/2"
                onClick={prev}
              >
                Voltar
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={next}
                disabled={step === 1 && !name.trim()}
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success flex-1"
                disabled={loading}
              >
                {isEdit ? "Salvar Alterações" : "Criar Tema"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}