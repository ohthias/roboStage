"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, ImageOff, Loader2 } from "lucide-react";

/**
 * Pré-visualização 3D de um projeto do BrickLink Studio 2.0 (.io).
 *
 * O .io é um ZIP protegido por senha (ZipCrypto) com o modelo em LDraw
 * (`model.ldr`). Aqui o arquivo é baixado do R2 (URL pré-assinada),
 * descompactado no navegador com zip.js e renderizado com o LDrawLoader do
 * three.js, buscando as peças na biblioteca LDraw pública. Peças que não
 * existirem na biblioteca (ex.: peças exclusivas do Studio) são ignoradas e
 * o resto do modelo continua aparecendo.
 */

const STUDIO_ZIP_PASSWORD = "soho0909";
const LDRAW_LIBRARY =
  process.env.NEXT_PUBLIC_LDRAW_LIBRARY_URL ??
  "https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/";

export type StudioViewerHandle = {
  resetView: () => void;
  screenshot: () => string | null;
};

type Status =
  | { phase: "download" }
  | { phase: "unzip" }
  | { phase: "parts"; loaded: number; total: number }
  | { phase: "ready"; missing: number }
  | { phase: "error"; message: string; thumbnail: string | null };

type Props = {
  /** Busca uma URL nova (assinada) do arquivo .io. */
  getUrl: () => Promise<string>;
  autoRotate: boolean;
  showEdges: boolean;
  className?: string;
};

async function extractModel(blob: Blob) {
  const zip = await import("@zip.js/zip.js");
  zip.configure({ useWebWorkers: false, useCompressionStream: true });
  const reader = new zip.ZipReader(new zip.BlobReader(blob), { password: STUDIO_ZIP_PASSWORD });
  try {
    const entries = (await reader.getEntries()).filter((e) => !e.directory);
    const byName = (re: RegExp) => entries.find((e) => re.test(e.filename));
    const modelEntry = byName(/(^|\/)model\.ldr$/i) ?? byName(/\.(ldr|mpd)$/i);
    const thumbEntry = byName(/\.png$/i);
    let thumbnail: string | null = null;
    if (thumbEntry && !thumbEntry.directory) {
      const png = await thumbEntry.getData(new zip.BlobWriter("image/png"));
      thumbnail = URL.createObjectURL(png);
    }
    if (!modelEntry || modelEntry.directory) return { text: null, thumbnail };
    const text = await modelEntry.getData(new zip.TextWriter());
    return { text, thumbnail };
  } finally {
    await reader.close();
  }
}

export const StudioViewer = forwardRef<StudioViewerHandle, Props>(function StudioViewer(
  { getUrl, autoRotate, showEdges, className = "" },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>({ phase: "download" });

  // Objetos do three.js ficam em refs para os controles externos.
  const api = useRef<{
    reset?: () => void;
    shot?: () => string | null;
    setAutoRotate?: (v: boolean) => void;
    setEdges?: (v: boolean) => void;
  }>({});

  useImperativeHandle(ref, () => ({
    resetView: () => api.current.reset?.(),
    screenshot: () => api.current.shot?.() ?? null,
  }));

  useEffect(() => api.current.setAutoRotate?.(autoRotate), [autoRotate]);
  useEffect(() => api.current.setEdges?.(showEdges), [showEdges]);

  // Valores iniciais lidos uma vez pelo efeito de montagem.
  const initial = useRef({ autoRotate, showEdges, getUrl });

  useEffect(() => {
    let disposed = false;
    let thumbnailUrl: string | null = null;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        setStatus({ phase: "download" });
        const url = await initial.current.getUrl();
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Não foi possível baixar o arquivo (${res.status}).`);
        const blob = await res.blob();
        if (disposed) return;

        setStatus({ phase: "unzip" });
        const { text, thumbnail } = await extractModel(blob);
        thumbnailUrl = thumbnail;
        if (disposed) return;
        if (!text) {
          setStatus({ phase: "error", message: "O arquivo .io não tem um modelo LDraw.", thumbnail });
          return;
        }

        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const { LDrawLoader } = await import("three/examples/jsm/loaders/LDrawLoader.js");
        const { LDrawConditionalLineMaterial } = await import(
          "three/examples/jsm/materials/LDrawConditionalLineMaterial.js"
        );
        if (disposed || !mountRef.current) return;

        const mount = mountRef.current;
        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 400;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        mount.appendChild(renderer.domElement);
        renderer.domElement.style.display = "none";

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 1, 100000);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8170, 2.4));
        const sun = new THREE.DirectionalLight(0xffffff, 2.2);
        sun.position.set(1, 2, 1.5);
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xffffff, 0.8);
        fill.position.set(-2, 0.5, -1);
        scene.add(fill);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = initial.current.autoRotate;
        controls.autoRotateSpeed = 1.6;

        // Progresso: cada arquivo de peça é uma requisição do LoadingManager.
        const manager = new THREE.LoadingManager();
        let missing = 0;
        manager.onProgress = (_url, loaded, total) => {
          if (!disposed) setStatus({ phase: "parts", loaded, total });
        };

        const loader = new LDrawLoader(manager);
        loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
        loader.setPartsLibraryPath(`${LDRAW_LIBRARY}complete/ldraw/`);
        await loader.preloadMaterials(`${LDRAW_LIBRARY}colors/ldcfgalt.ldr`);

        // Peça ausente na biblioteca vira um arquivo vazio em vez de derrubar
        // o modelo inteiro (o LDrawLoader lança erro por padrão).
        const parseCache = (loader as unknown as {
          partsCache: { parseCache: { fetchData: (f: string) => Promise<string> } };
        }).partsCache.parseCache;
        const originalFetch = parseCache.fetchData.bind(parseCache);
        parseCache.fetchData = async (fileName: string) => {
          try {
            return await originalFetch(fileName);
          } catch {
            missing += 1;
            return `0 Peça indisponível: ${fileName}\n`;
          }
        };

        const group = await new Promise<import("three").Group>((resolve, reject) =>
          loader.parse(text, resolve, reject),
        );
        if (disposed) {
          renderer.dispose();
          return;
        }
        // LDraw usa Y para baixo.
        group.rotation.x = Math.PI;
        scene.add(group);

        const setEdges = (visible: boolean) => {
          group.traverse((obj) => {
            if ((obj as { isLineSegments?: boolean }).isLineSegments) obj.visible = visible;
          });
        };
        setEdges(initial.current.showEdges);

        // Enquadra o modelo.
        const box = new THREE.Box3().setFromObject(group);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const radius = Math.max(size.length() / 2, 1);
        const home = () => {
          const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
          camera.position.copy(center).add(new THREE.Vector3(0.9, 0.55, 1).normalize().multiplyScalar(dist * 0.95));
          camera.near = dist / 100;
          camera.far = dist * 100;
          camera.updateProjectionMatrix();
          controls.target.copy(center);
          controls.update();
        };
        home();

        const resize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          if (!w || !h) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(mount);

        let frame = 0;
        const loop = () => {
          frame = requestAnimationFrame(loop);
          controls.update();
          renderer.render(scene, camera);
        };
        loop();
        renderer.domElement.style.display = "block";

        api.current = {
          reset: home,
          shot: () => renderer.domElement.toDataURL("image/png"),
          setAutoRotate: (v) => (controls.autoRotate = v),
          setEdges,
        };
        setStatus({ phase: "ready", missing });

        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          controls.dispose();
          group.traverse((obj) => {
            const mesh = obj as { geometry?: { dispose(): void } };
            mesh.geometry?.dispose();
          });
          renderer.dispose();
          renderer.domElement.remove();
          api.current = {};
        };
      } catch (err) {
        console.error("[quickbrick] visualizador 3D:", err);
        if (!disposed) {
          setStatus({
            phase: "error",
            message: "Não foi possível montar o modelo 3D deste arquivo.",
            thumbnail: thumbnailUrl,
          });
        }
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {status.phase !== "ready" && status.phase !== "error" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-base-content/60">
            <div className="relative grid size-16 place-items-center">
              <Box className="size-8 text-primary/70" strokeWidth={1.4} />
              <Loader2 className="absolute inset-0 size-16 animate-spin text-primary/30" strokeWidth={1} />
            </div>
            <p className="qb-hand text-lg">
              {status.phase === "download" && "Baixando o projeto do Studio…"}
              {status.phase === "unzip" && "Abrindo o arquivo .io…"}
              {status.phase === "parts" && `Montando as peças… ${status.loaded}/${status.total}`}
            </p>
          </div>
        </div>
      )}

      {status.phase === "error" && (
        <div className="absolute inset-0 grid place-items-center p-6">
          {status.thumbnail ? (
            <figure className="flex h-full flex-col items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={status.thumbnail} alt="Miniatura do projeto do Studio" className="max-h-[80%] object-contain" />
              <figcaption className="qb-hand text-base text-base-content/55">
                {status.message} Mostrando a miniatura salva pelo Studio.
              </figcaption>
            </figure>
          ) : (
            <div className="flex max-w-xs flex-col items-center gap-2 text-center text-base-content/60">
              <ImageOff className="size-8" strokeWidth={1.4} />
              <p className="qb-hand text-lg">{status.message}</p>
            </div>
          )}
        </div>
      )}

      {status.phase === "ready" && status.missing > 0 && (
        <p className="qb-hand absolute bottom-2 left-3 text-sm text-base-content/45">
          {status.missing} peça(s) do Studio sem equivalente LDraw foram ocultadas.
        </p>
      )}
    </div>
  );
});
