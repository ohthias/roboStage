import "server-only";

import { AwsClient } from "aws4fetch";

/**
 * Cliente mínimo do Cloudflare R2 (API compatível com S3).
 *
 * Os arquivos do QuickBrick Studio (fotos do robô e projetos .io do Studio
 * 2.0) vão direto do navegador para o R2 por URL pré-assinada — assim não
 * passam pelo limite de corpo das funções serverless. O servidor só assina
 * as URLs, confere o objeto depois do envio (HEAD) e guarda a chave no banco.
 *
 * Variáveis de ambiente:
 *   R2_ACCOUNT_ID          id da conta Cloudflare
 *   R2_ACCESS_KEY_ID       token R2 (Object Read & Write)
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET              opcional — padrão "quickbrick-projects"
 */

const DEFAULT_BUCKET = "quickbrick-projects";

let client: AwsClient | null = null;

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Armazenamento R2 não configurado (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).",
    );
  }
  const bucket = process.env.R2_BUCKET || DEFAULT_BUCKET;
  if (!client) {
    client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
  }
  return { client, base: `https://${accountId}.r2.cloudflarestorage.com/${bucket}` };
}

export function isR2Configured() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");

function objectUrl(key: string) {
  const { base } = config();
  return new URL(`${base}/${encodeKey(key)}`);
}

async function presign(method: "GET" | "PUT", url: URL, expiresIn: number) {
  const { client } = config();
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await client.sign(new Request(url, { method }), { aws: { signQuery: true } });
  return signed.url;
}

/** URL para o navegador enviar o arquivo (PUT). */
export function presignUpload(key: string, expiresIn = 600) {
  return presign("PUT", objectUrl(key), expiresIn);
}

/** URL temporária para exibir/baixar o arquivo (GET). */
export function presignDownload(key: string, opts: { expiresIn?: number; fileName?: string } = {}) {
  const url = objectUrl(key);
  if (opts.fileName) {
    const safe = opts.fileName.replace(/["\\\r\n]/g, "_");
    url.searchParams.set(
      "response-content-disposition",
      `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(opts.fileName)}`,
    );
  }
  return presign("GET", url, opts.expiresIn ?? 3600);
}

/** Metadados do objeto ou null se ele não existir. */
export async function headObject(key: string): Promise<{ size: number; contentType: string | null } | null> {
  const { client } = config();
  const res = await client.fetch(objectUrl(key).toString(), { method: "HEAD" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Falha ao consultar o armazenamento (${res.status}).`);
  return {
    size: Number(res.headers.get("content-length") ?? 0),
    contentType: res.headers.get("content-type"),
  };
}

export async function deleteObject(key: string) {
  const { client } = config();
  const res = await client.fetch(objectUrl(key).toString(), { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Falha ao remover arquivo do armazenamento (${res.status}).`);
  }
}

/** Remove vários objetos; erros individuais não interrompem a limpeza. */
export async function deleteObjects(keys: string[]) {
  await Promise.allSettled(keys.map((k) => deleteObject(k)));
}
