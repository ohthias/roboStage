// Mede o JavaScript de primeira carga de páginas servidas por `next start`:
// lê os <script> de cada HTML (ignorando os noModule, que navegadores modernos
// não baixam) e soma os tamanhos brutos e com gzip.
//
// uso:  npm run build && npm start   (em outro terminal)
//       npm run perf:first-load -- /anatix /labtest /fll/rubric
// Variáveis: BASE_URL (padrão http://localhost:3000), DETAIL=1 lista os chunks.
import { gzipSync } from "node:zlib";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["/licences", "/anatix", "/labtest", "/fll/rubric"];
const cache = new Map();
async function size(url) {
  if (!cache.has(url)) {
    const buf = Buffer.from(await (await fetch(base + url)).arrayBuffer());
    cache.set(url, { raw: buf.length, gz: gzipSync(buf, { level: 9 }).length });
  }
  return cache.get(url);
}
const result = {};
for (const page of pages) {
  const html = await (await fetch(base + page)).text();
  // ignora scripts noModule (polyfills): navegadores modernos não os baixam
  const nomodule = new Set([...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*noModule/gi)].map((m) => m[1]));
  const srcs = [...new Set([...html.matchAll(/(\/_next\/static\/[^"'\s\\]+?\.js)/g)].map((m) => m[1]))].filter((s) => !nomodule.has(s));
  const sizes = await Promise.all(srcs.map(async (s) => [s, await size(s)]));
  result[page] = { html: Buffer.byteLength(html), htmlGz: gzipSync(html).length, scripts: Object.fromEntries(sizes) };
}
// chunks presentes em todas as páginas = compartilhados
const sets = pages.map((p) => new Set(Object.keys(result[p].scripts)));
const shared = [...sets[0]].filter((s) => sets.every((x) => x.has(s)));
const kb = (n) => (n / 1024).toFixed(1);
console.log("página".padEnd(30), "JS gz total", "JS gz próprio", "JS bruto total", "HTML gz");
for (const page of pages) {
  const sc = result[page].scripts;
  let gz = 0, raw = 0, own = 0;
  for (const [s, v] of Object.entries(sc)) { gz += v.gz; raw += v.raw; if (!shared.includes(s)) own += v.gz; }
  console.log(page.padEnd(30), (kb(gz) + " KB").padStart(11), (kb(own) + " KB").padStart(13), (kb(raw) + " KB").padStart(14), (kb(result[page].htmlGz) + " KB").padStart(8));
}
const sharedGz = shared.reduce((a, s) => a + cache.get(s).gz, 0);
console.log("compartilhado entre todas:", kb(sharedGz), "KB gz");
if (process.env.DETAIL) for (const page of pages) {
  console.log("\n" + page);
  for (const [s, v] of Object.entries(result[page].scripts).sort((a, b) => b[1].gz - a[1].gz).slice(0, 8))
    if (!shared.includes(s)) console.log("  ", kb(v.gz).padStart(7), "KB", s);
}
