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
            const webpFile = new File([blob], `${file.name.split(".")[0]}.webp`, {
              type: "image/webp",
            });
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

        const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);
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

        const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);
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
      className={`modal modal-open transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`modal-box space-y-6 max-w-lg transform transition-all duration-300 ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-3"
        }`}
      >
        <h3 className="font-bold text-lg">Editar Perfil</h3>

        {/* FOTO DE PERFIL */}
        <div className="space-y-3">
          <h4 className="font-semibold">Foto de Perfil</h4>
          <div className="flex flex-col items-center gap-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview avatar"
                className="w-28 h-28 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-base-300 flex items-center justify-center text-sm text-base-content/70">
                Nenhuma imagem
              </div>
            )}
            <span className="text-sm text-base-content/70">Pré-visualização</span>
          </div>

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
        </div>

        <hr className="border-base-300" />

        {/* BANNER */}
        <div className="space-y-3">
          <h4 className="font-semibold">Banner do Perfil</h4>
          <div
            className="h-24 rounded-lg border-2 border-primary flex items-center justify-center text-sm text-base-content/70 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bannerPreview || ""})`,
            }}
          >
            {bannerPreview ? "Pré-visualização do banner" : "Nenhum banner selecionado"}
          </div>

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
        </div>

        {/* Ações */}
        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleUpdateImages} className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}