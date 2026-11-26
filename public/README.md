# public/

Arquivos servidos direto na raiz do site (`public/x` → `/x`).

```
public/
├── brand/            logos do RoboStage
├── audio/            sons (start/end das partidas)
├── data/             JSON estático (missões, docs, confere-ai…)
├── files/
│   ├── docs/         PDFs oficiais por competição/temporada
│   ├── downloads/    pacotes .zip da página /assets
│   └── anatix/       código Pybricks da página /anatix
└── images/
    ├── home/         banners e heros da home/landing
    ├── illustrations/ ilustrações soltas
    ├── icons/        ícones de persona e placeholders
    ├── competitions/ imagens por liga (fll, ftc)
    ├── seasons/      logos de temporada (fll, ftc)
    ├── missions/     thumbs de missão por temporada
    └── products/     imagens por produto (labtest, quickbrick, showlive, stagebook)
```

Regras:

- Pastas em minúsculo.
- Nada de JSON fora de `data/`, nada de PDF/ZIP fora de `files/`.
- Arquivo novo sem extensão ignorada no `matcher` do `proxy.ts` (pdf, py, mp3…) precisa de prefixo público em `publicRoutePatterns`.
- Caminhos antigos usados em links externos têm redirect em `next.config.ts`.
