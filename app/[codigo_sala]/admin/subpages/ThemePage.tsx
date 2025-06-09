"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Mensage from "@/components/Mensage";

type ThemeFormProps = {
  roomId: string;
  defaultPrimaryColor?: string;
  defaultSecondaryColor?: string;
  defaultTextColor?: string;
  defaultWallpaperUrl?: string;
};

export default function ThemeForm({
  roomId,
  defaultPrimaryColor,
  defaultSecondaryColor,
  defaultTextColor,
  defaultWallpaperUrl,
}: ThemeFormProps) {
  const [primaryColor, setPrimaryColor] = useState(
    defaultPrimaryColor || "#ff0000"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    defaultSecondaryColor || "#ffffff"
  );
  const [textColor, setTextColor] = useState(defaultTextColor || "#000000");
  const [file, setFile] = useState<File | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState(defaultWallpaperUrl || "");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "aviso" | "">("");
  const router = useRouter();

  useEffect(() => {
    setPrimaryColor(defaultPrimaryColor || "#ff0000");
    setSecondaryColor(defaultSecondaryColor || "#ffffff");
    setTextColor(defaultTextColor || "#000000");
    setWallpaperUrl(defaultWallpaperUrl || "");
  }, [defaultPrimaryColor, defaultSecondaryColor, defaultTextColor, defaultWallpaperUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedWallpaperUrl = wallpaperUrl;
    setLoading(true);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/rooms/upload/", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        uploadedWallpaperUrl = url;
        setTipoMensagem("sucesso");
        setMensagem("Imagem enviada com sucesso!");
      } else {
        setTipoMensagem("erro");
        setMensagem("Erro ao enviar a imagem. Tente novamente.");
        return;
      }
    }

    await fetch(`/rooms/${roomId}/theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        wallpaper_url: uploadedWallpaperUrl,
      }),
    });

    setTipoMensagem("sucesso");
    setMensagem("Tema atualizado com sucesso!");
    setLoading(false);
    router.refresh();
  };

  if(loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
    <Mensage
            tipo={tipoMensagem}
            mensagem={mensagem}
            onClose={() => {
              setMensagem("");
              setTipoMensagem("");
            }}
          />
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
    >
      <div className="flex flex-col items-start justify-start gap-4">
        <label className="font-semibold text-gray-700">Papel de Parede:</label>
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center w-full gap-4">
          <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
          if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (ev) => {
          setWallpaperUrl(ev.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
          }
        }}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark file:cursor-pointer cursor-pointer w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {wallpaperUrl && (
        <img
          src={wallpaperUrl}
          alt="Wallpaper atual"
          className="mt-2 rounded shadow w-full object-cover h-48"
        />
          )}
        </div>
      </div>

      <div className="flex flex-col items-start justify-start gap-4">
        <div className="flex flex-col items-start justify-start w-full">
          <label className="font-semibold text-gray-700">Cor Primária:</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-full h-12 p-0 border-none bg-transparent cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-start justify-start w-full">
          <label className="font-semibold text-gray-700">Cor Secundária:</label>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="w-full h-12 p-0 border-none bg-transparent cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-start justify-start w-full">
          <label className="font-semibold text-gray-700">Texto:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full h-12 p-0 border-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div className="md:col-span-2 flex justify-center">
        <button
          type="submit"
          className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer w-full md:w-auto"
        >
          Salvar Tema
        </button>
      </div>
    </form>
    </>
      );
}
