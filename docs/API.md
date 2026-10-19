# APIs do RoboStage

Referência das APIs HTTP implementadas pelo RoboStage. Os exemplos usam
`https://www.robostage.com.br` como base:

> Esta página documenta a API atualmente disponível. Consulte o [repositório no
> GitHub](https://github.com/ohthias/roboStage) para acompanhar alterações de
> implementação e versões.

```text
https://www.robostage.com.br/api
```

## Convenções

- As respostas são JSON, salvo o webhook do Clerk, que responde `text/plain`.
- Erros seguem o formato:

  ```json
  {
    "error": "Mensagem para o cliente"
  }
  ```

- As rotas protegidas exigem uma sessão válida do Clerk. A sessão é enviada
  pelo cookie de autenticação do Clerk; não envie `userId` no corpo para
  escolher outro usuário.
- A autorização é aplicada no servidor. Por exemplo, o LabTest sempre filtra
  os testes pelo usuário autenticado.
- Erros inesperados retornam `500` e são registrados no servidor. Detalhes
  internos do banco e do sistema de arquivos não são expostos ao cliente.

## Resumo das rotas

| Método | Rota | Autenticação |
| --- | --- | --- |
| `GET` | [`/api/competitions`](https://github.com/ohthias/roboStage/blob/main/app/api/competitions/route.ts) | Clerk |
| `GET` | [`/api/data/missions`](https://github.com/ohthias/roboStage/blob/main/app/api/data/missions/route.ts) | Pública |
| `GET` | [`/api/data/missions/future-edition`](https://github.com/ohthias/roboStage/blob/main/app/api/data/missions/future-edition/route.ts) | Clerk pelo middleware |
| `GET` | [`/api/data/fllDocs`](https://github.com/ohthias/roboStage/blob/main/app/api/data/fllDocs/route.ts) | Clerk pelo middleware |
| `GET` | [`/api/data/toolsAbout`](https://github.com/ohthias/roboStage/blob/main/app/api/data/toolsAbout/route.ts) | Clerk pelo middleware |
| `GET` | [`/api/labtest`](https://github.com/ohthias/roboStage/blob/main/app/api/labtest/route.ts) | Clerk |
| `POST` | [`/api/labtest`](https://github.com/ohthias/roboStage/blob/main/app/api/labtest/route.ts) | Clerk |
| `GET` | [`/api/legal/[slug]`](https://github.com/ohthias/roboStage/blob/main/app/api/legal/[slug]/route.ts) | Pública |
| `POST` | [`/api/webhooks/clerk`](https://github.com/ohthias/roboStage/blob/main/app/api/webhooks/clerk/route.ts) | Assinatura Svix |

> **Middleware:** além da autenticação realizada pelos próprios handlers,
> [`proxy.ts`](https://github.com/ohthias/roboStage/blob/main/proxy.ts) protege as rotas que não estão na lista pública.
> Em produção, a URL do webhook deve ser configurada no Clerk e não deve
> depender de uma sessão de usuário.

## Competições do usuário

### `GET /api/competitions`

Lista as competições associadas ao usuário autenticado por meio de
`user_league_interests`.

#### Query string

| Parâmetro | Obrigatório | Valores | Descrição |
| --- | --- | --- | --- |
| `relationType` | Não | `participante`, `interessado` | Filtra o tipo de relação com a competição. |

Exemplo:

```http
GET /api/competitions?relationType=participante
```

Resposta `200`:

```json
[
  {
    "id": "2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8",
    "code": "FLL",
    "name": "FIRST LEGO League Challenge",
    "description": "Competição de robótica",
    "relationType": "participante",
    "teamName": "RoboStage",
    "season": "2026"
  }
]
```

Erros:

- `401` — usuário não autenticado.
- `400` — `relationType` inválido.
- `500` — falha ao consultar o banco.

## Dados públicos e dados da temporada

Estas rotas carregam JSON versionado no diretório `public/data`. O formato do
corpo acompanha o arquivo correspondente e pode evoluir junto com a temporada.

| Rota | Arquivo de origem |
| --- | --- |
| `GET /api/data/missions` | `public/data/missions.json` |
| `GET /api/data/missions/future-edition` | `public/data/fll/future-edition.json` |
| `GET /api/data/fllDocs` | `public/data/fllDocs.json` |
| `GET /api/data/toolsAbout` | `public/data/toolsAbout.json` |

Respostas:

- `200` — conteúdo JSON do arquivo.
- `500` — arquivo ausente, ilegível ou com JSON inválido.

`/api/data/missions` é pública. As demais rotas de dados não estão na lista
pública do middleware e, portanto, exigem sessão Clerk quando acessadas pela
aplicação.

## Documentos legais

### `GET /api/legal/[slug]`

Retorna o conteúdo Markdown de um documento em `content/legal`.

Exemplos:

```http
GET /api/legal/privacy
GET /api/legal/terms
```

Resposta `200`:

```json
{
  "slug": "privacy",
  "content": "# Política de privacidade\n..."
}
```

O `slug` aceita somente letras, números e hífens (`^[a-z0-9-]+$`). Isso evita
que o parâmetro seja usado para acessar arquivos fora do diretório legal.

Erros:

- `400` — slug inválido.
- `404` — documento não encontrado.

## LabTest

As operações do LabTest exigem sessão Clerk. O servidor limita o corpo das
requisições a `256 KiB`, valida estruturas JSON e limita textos, objetos,
arrays e quantidade de lançamentos.

### `GET /api/labtest`

Sem parâmetros, lista somente os testes do usuário autenticado.

Resposta `200`:

```json
[
  {
    "id": "2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8",
    "name": "Runs de treino",
    "description": "Treino de terça-feira",
    "mode": "runs",
    "season": "2026",
    "status": "planejamento",
    "config": {
      "missions": ["mission-1", "mission-2"]
    },
    "createdAt": "2026-10-11T19:00:00.000Z",
    "updatedAt": "2026-10-11T19:10:00.000Z",
    "executionsCount": 3
  }
]
```

Com `testId`, retorna um teste do usuário e suas execuções:

```http
GET /api/labtest?testId=2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8
```

Resposta `200`:

```json
{
  "test": {
    "id": "2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8",
    "name": "Runs de treino",
    "description": null,
    "mode": "runs",
    "season": "2026",
    "status": "planejamento",
    "config": {},
    "createdAt": "2026-10-11T19:00:00.000Z",
    "updatedAt": "2026-10-11T19:10:00.000Z"
  },
  "executions": [
    {
      "id": "7b6e3f7f-7bc5-4bc8-a3c0-5c17b4d7cb1e",
      "executionNumber": 1,
      "notes": "Saída consistente",
      "results": {
        "score": 320
      },
      "createdAt": "2026-10-11T19:10:00.000Z"
    }
  ]
}
```

Erros:

- `401` — usuário não autenticado.
- `400` — `testId` não é um UUID válido.
- `404` — teste não encontrado para o usuário autenticado.
- `500` — falha ao carregar os dados.

### `POST /api/labtest`

O campo `action` define a operação.

#### Criar teste

Payload:

```json
{
  "action": "create",
  "name": "Runs de treino",
  "description": "Treinos da semana",
  "mode": "runs",
  "season": "2026",
  "config": {
    "missions": ["mission-1", "mission-2"]
  },
  "fields": [
    {
      "fieldKey": "score",
      "label": "Pontuação",
      "type": "number",
      "order": 0,
      "required": true
    }
  ]
}
```

Campos:

- `name` é obrigatório e pode ter até `2.000` caracteres.
- `mode` deve ser `runs`, `calibrabot`, `individual` ou `custom`.
- `description` e `season` são opcionais, aceitam `null` e têm limite de
  `2.000` caracteres.
- `config` e `fields`, quando enviados, devem ser JSON limitado em tamanho e
  profundidade. Em `runs`, se `config` não for enviado, a configuração de
  missões é derivada de `fields`.

Resposta `200`:

```json
{
  "id": "2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8"
}
```

#### Adicionar execuções

Payload:

```json
{
  "action": "entries",
  "testId": "2f0c0a22-9d8e-4f8c-8e25-22ec0a08d2e8",
  "entries": [
    {
      "notes": "Tentativa com bateria carregada",
      "results": {
        "score": 320,
        "duration": 48
      }
    }
  ]
}
```

Regras:

- `testId` deve ser um UUID e pertencer ao usuário autenticado.
- `entries` deve conter de 1 a 100 itens.
- Cada item deve possuir `results` como objeto JSON e pode possuir `notes`.
- O número da execução é calculado no servidor; o cliente não deve enviá-lo.
- Os números são atribuídos em sequência a partir da última execução
  registrada.

Resposta `200`:

```json
{
  "ok": true,
  "created": [
    {
      "id": "7b6e3f7f-7bc5-4bc8-a3c0-5c17b4d7cb1e",
      "executionNumber": 4
    }
  ]
}
```

Erros do `POST`:

- `400` — ação, payload, modo, campos ou lançamentos inválidos.
- `401` — usuário não autenticado.
- `404` — teste não encontrado para o usuário.
- `413` — corpo maior que `256 KiB`.
- `500` — falha ao salvar.

## Webhook do Clerk

### `POST /api/webhooks/clerk`

Endpoint consumido pelo Clerk para sincronizar usuários, organizações e
membros no banco local. Não usa sessão de usuário.

O Clerk deve enviar os cabeçalhos Svix:

- `svix-id`
- `svix-timestamp`
- `svix-signature`

O servidor valida a assinatura com `CLERK_WEBHOOK_SECRET`. Sem os cabeçalhos,
com assinatura inválida ou sem o segredo configurado, a requisição é rejeitada.

Eventos sincronizados:

- `user.created`
- `user.updated`
- `user.deleted`
- `organization.updated`
- `organization.deleted`
- `organizationMembership.created`
- `organizationMembership.updated`
- `organizationMembership.deleted`

Resposta:

- `200` com `ok` quando o evento é processado.
- `400` quando os cabeçalhos estão ausentes ou a assinatura é inválida.
- `500` quando `CLERK_WEBHOOK_SECRET` não está configurado.
- Falhas inesperadas de sincronização devem ser investigadas nos logs do
  servidor e tratadas pelo mecanismo de retry do provedor.

## Configuração local

Para usar as rotas que acessam o banco ou o Clerk, configure no ambiente:

```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
```

Nunca publique esses valores nem os envie em exemplos, commits ou respostas da
API.