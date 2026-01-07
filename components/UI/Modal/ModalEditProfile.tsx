"use client";

import { useEffect, useState } from "react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  session: any;
  supabase: any;
  addToast: (msg: string, type: "success" | "error") => void;
}

export default function EditProfileModal({
  open,
  onClose,
  session,
  supabase,
  addToast,
}: EditProfileModalProps) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = session?.user?.id;

  // Carrega dados do banco quando o modal abrir
  useEffect(() => {
    if (open && userId) {
      setIsVisible(true);
      (async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("avatar_url,banner_url")
            .eq("id", userId)
            .single();

          if (error) throw error;
          setAvatarUrl(data.avatar_url || "");
          setBannerUrl(data.banner_url || "");
          setAvatarPreview(data.avatar_url || null);
          setBannerPreview(data.banner_url || null);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open, userId, supabase]);

  if (!open && !isVisible) return null;

  // Converte para WebP
  const convertToWebP = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Erro ao criar contexto do canvas");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Falha ao converter para WebP");
            const webpFile = new File(
              [blob],
              `${file.name.split(".")[0]}.webp`,
              {
                type: "image/webp",
              }
            );
            resolve(webpFile);
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpdateImages = async () => {
    if (!userId) return;
    setLoading(true);

    let newAvatarUrl = avatarUrl;
    let newBannerUrl = bannerUrl;

    try {
      // Upload Avatar
      if (avatarFile) {
        const webpFile = await convertToWebP(avatarFile);
        const fileName = `avatar-${Date.now()}.webp`;
        const filePath = `${userId}/${fileName}`;

        const { error: avatarError } = await supabase.storage
          .from("photos")
          .upload(filePath, webpFile, { upsert: true });

        if (avatarError) throw avatarError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(filePath);
        newAvatarUrl = publicUrl;
      }

      // Upload Banner
      if (bannerFile) {
        const webpFile = await convertToWebP(bannerFile);
        const fileName = `banner-${Date.now()}.webp`;
        const filePath = `${userId}/${fileName}`;

        const { error: bannerError } = await supabase.storage
          .from("photos")
          .upload(filePath, webpFile, { upsert: true });

        if (bannerError) throw bannerError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(filePath);
        newBannerUrl = publicUrl;
      }

      // Atualiza banco
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatarUrl,
          banner_url: newBannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (dbError) throw dbError;

      addToast("Imagens atualizadas com sucesso!", "success");
      onClose();
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar imagens", "error");
    } finally {
      setLoading(false);
    }
  };

  // Libera memória dos previews
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  return (
    <div
      className={`modal modal-open backdrop-blur-sm transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`modal-box w-full max-w-none sm:max-w-xl lg:max-w-3xl p-0 overflow-hidden transform transition-all duration-300 overflow-y-auto ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-3"
        }`}
      >
        {/* ================= HEADER ================= */}
        <header className="px-4 sm:px-6 py-4 bg-base-200 border-b border-base-300 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Editar Perfil</h3>
            <p className="hidden sm:block text-sm text-base-content/70">
              Atualize sua foto e banner público
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="p-4 sm:p-6 space-y-10">
          {/* AVATAR */}
          <section className="grid gap-6 lg:grid-cols-[auto_1fr] items-center">
            <header className="lg:col-span-2 space-y-1">
              <h4 className="font-semibold text-sm sm:text-base">
                Foto de Perfil
              </h4>
              <p className="text-xs sm:text-sm text-base-content/60">
                Recomendado: imagem quadrada
              </p>
            </header>

            <figure className="flex justify-center lg:justify-start">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Pré-visualização do avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-base-300"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-dashed border-base-300 flex items-center justify-center text-xs text-base-content/60">
                  Sem imagem
                </div>
              )}
            </figure>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const previewUrl = URL.createObjectURL(file);
                  setAvatarPreview(previewUrl);
                  setAvatarFile(file);
                }}
              />
              <p className="text-xs text-base-content/60">
                PNG, JPG ou WEBP • até 5MB
              </p>
            </div>
          </section>

          <div className="divider" />

          {/* BANNER */}
          <section className="space-y-4">
            <header className="space-y-1">
              <h4 className="font-semibold text-sm sm:text-base">
                Banner do Perfil
              </h4>
              <p className="text-xs sm:text-sm text-base-content/60">
                Recomendado: imagem horizontal
              </p>
            </header>

            <figure
              className="h-28 sm:h-32 lg:h-40 rounded-xl border border-base-300 bg-base-200 bg-cover bg-center flex items-center justify-center text-xs sm:text-sm text-base-content/60"
              style={{
                backgroundImage: bannerPreview
                  ? `url(${bannerPreview})`
                  : undefined,
              }}
            >
              {!bannerPreview && "Pré-visualização do banner"}
            </figure>

            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const previewUrl = URL.createObjectURL(file);
                setBannerPreview(previewUrl);
                setBannerFile(file);
              }}
            />
          </section>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="px-4 sm:px-6 py-4 bg-base-200 border-t border-base-300 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="btn btn-ghost w-full sm:w-auto"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleUpdateImages}
            className="btn btn-primary w-full sm:w-auto min-w-[160px]"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </footer>
      </div>
    </div>
  );
}