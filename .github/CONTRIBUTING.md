# Contribuindo com o RoboStage

Obrigado por querer contribuir com o RoboStage.

O RoboStage é uma plataforma construída para a comunidade de robótica, atualmente com foco na FIRST LEGO League. O projeto evolui a partir do uso real de equipes, técnicos, mentores, organizadores, árbitros, desenvolvedores e entusiastas da comunidade.

Existem várias formas de contribuir: código, documentação, testes, correções, ideias, feedback, divulgação e apoio à continuidade do projeto.

> **Antes de contribuir:** leia o [Código de Conduta](./CODE-OF-CONDUCT.md).

## Índice

* [Formas de contribuir](#formas-de-contribuir)
* [Antes de começar](#antes-de-começar)
* [Encontrando algo para fazer](#encontrando-algo-para-fazer)
* [Reportando bugs](#reportando-bugs)
* [Sugerindo funcionalidades](#sugerindo-funcionalidades)
* [Configurando o ambiente](#configurando-o-ambiente)
* [Fluxo de desenvolvimento](#fluxo-de-desenvolvimento)
* [Branches](#branches)
* [Commits](#commits)
* [Pull Requests](#pull-requests)
* [Revisão de código](#revisão-de-código)
* [Testes](#testes)
* [Banco de dados](#banco-de-dados)
* [Interface e experiência do usuário](#interface-e-experiência-do-usuário)
* [Documentação](#documentação)
* [Segurança](#segurança)
* [Dados pessoais](#dados-pessoais)
* [Contribuições relacionadas à FLL](#contribuições-relacionadas-à-fll)
* [Apoiando o RoboStage](#apoiando-o-robostage)
* [Divulgando o projeto](#divulgando-o-projeto)
* [Licença](#licença)
* [Contato](#contato)

## Formas de contribuir

Você não precisa ser desenvolvedor para contribuir com o RoboStage.

### Código

Você pode contribuir com:

* novas funcionalidades;
* correções de bugs;
* melhorias de desempenho;
* melhorias de acessibilidade;
* melhorias de UX/UI;
* componentes reutilizáveis;
* integrações;
* melhorias na infraestrutura;
* testes;
* refatorações.

### Issues

Issues são úteis para:

* reportar bugs;
* sugerir funcionalidades;
* documentar problemas;
* discutir melhorias;
* registrar necessidades da comunidade.

### Documentação

Contribuições para documentação são especialmente úteis.

Você pode melhorar:

* README;
* documentação técnica;
* guias;
* textos da plataforma;
* exemplos;
* mensagens de erro;
* conteúdo educacional;
* documentação das ferramentas.

### Testes e feedback

Você também pode contribuir utilizando o RoboStage e relatando:

* comportamentos inesperados;
* problemas de usabilidade;
* dificuldades de navegação;
* inconsistências;
* problemas encontrados durante treinos;
* necessidades de equipes e técnicos.

### Comunidade

Você pode ajudar outras pessoas a utilizar o RoboStage, responder dúvidas, compartilhar experiências e trazer necessidades reais da comunidade de robótica.

# Antes de começar

Antes de abrir uma Issue ou Pull Request:

1. procure Issues existentes relacionadas ao problema;
2. verifique se existe uma discussão sobre a funcionalidade;
3. consulte a documentação disponível;
4. confirme se o comportamento realmente representa um problema;
5. evite duplicar uma contribuição já em andamento.

O GitHub recomenda verificar o contexto existente do projeto antes de iniciar uma contribuição, além de utilizar Issues para problemas e Pull Requests para propor alterações.

# Encontrando algo para fazer

Se você não sabe por onde começar, consulte as [Issues do RoboStage](https://github.com/ohthias/roboStage/issues).

Procure especialmente por Issues identificadas com estas etiquetas:

* [`area: competitions`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20competitions%22) — ferramentas específicas para uma competição;
* [`area: labtest`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20labtest%22) — testes e análise de runs e pontuação (LabTest);
* [`area: quickbrick-studio`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20quickbrick-studio%22) — simulador e editor de arena (QuickBrick Studio);
* [`area: showlive`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20showlive%22) — criação e gestão de eventos ao vivo (ShowLive);
* [`area: stylelab`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20stylelab%22) — personalização visual da plataforma (StyleLab);
* [`area: thinklab`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20thinklab%22) — diagramas e organização de ideias (Thinklab);
* [`area: users`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20users%22) — conta, perfil, autenticação e dashboard do usuário;
* [`area: workspaces`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22area%3A%20workspaces%22) — espaços colaborativos e organização em pastas (StageBook);
* [`bug`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3Abug) — comportamento incorreto ou quebrado no sistema;
* [`dependencies`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3Adependencies) — atualização de dependências e configuração de build;
* [`documentation`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3Adocumentation) — criação ou atualização de documentação;
* [`enhancement`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3Aenhancement) — nova funcionalidade ou melhoria em recurso existente;
* [`good first issue`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22good%20first%20issue%22) — bom para quem está começando a contribuir;
* [`help wanted`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3A%22help%20wanted%22) — colaboração externa é bem-vinda;
* [`question`](https://github.com/ohthias/roboStage/issues?q=state%3Aopen%20label%3Aquestion) — dúvida ou pedido de esclarecimento.

Se uma Issue já estiver sendo trabalhada por outra pessoa, considere conversar com os envolvidos antes de iniciar uma implementação paralela.

Se a alteração for significativa, recomendamos abrir uma Issue antes de desenvolver a solução.

# Reportando bugs

Ao encontrar um bug, abra uma Issue descrevendo o problema.

Sempre que possível, inclua:

### O que aconteceu?

Explique o comportamento observado.

### O que deveria acontecer?

Descreva o comportamento esperado.

### Como reproduzir?

Forneça os passos necessários para reproduzir o problema.

Exemplo:

```text
1. Acesse o LabTest
2. Crie um novo teste
3. Adicione uma execução
4. Salve o teste
5. Observe o comportamento apresentado
```

### Informações adicionais

Quando relevantes, informe:

* navegador;
* sistema operacional;
* dispositivo;
* versão do RoboStage;
* página ou ferramenta afetada;
* mensagens de erro;
* screenshots;
* logs sem dados pessoais.

**Nunca publique senhas, tokens, chaves de API, cookies, credenciais ou dados pessoais em uma Issue.**

# Sugerindo funcionalidades

Antes de propor uma nova funcionalidade, explique o problema que ela resolve.

Uma boa proposta deve responder:

* Qual problema existe atualmente?
* Quem é afetado?
* Como esse problema é resolvido hoje?
* Qual seria a solução proposta?
* Existem alternativas?
* A funcionalidade atende equipes, técnicos, organizadores ou outro público?
* Existe algum impacto na arquitetura atual?

Evite propostas baseadas apenas em:

> "Seria legal se tivesse..."

Prefira explicar a necessidade e permitir que a solução seja discutida.

# Configurando o ambiente

O RoboStage utiliza atualmente:

* Next.js;
* React;
* TypeScript;
* Tailwind CSS;
* DaisyUI;
* Drizzle ORM;
* banco de dados;
* Clerk;
* Framer Motion;
* Recharts;
* ferramentas de geração/exportação de documentos.

A versão e as dependências oficiais devem ser verificadas no `package.json` antes da configuração do ambiente.

## Pré-requisitos

Instale:

* Node.js em uma versão compatível com o projeto;
* npm;
* Git.

Clone o repositório:

```bash
git clone https://github.com/ohthias/roboStage.git
cd roboStage
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo de variáveis de ambiente:

```bash
.env.local
```

Utilize as variáveis necessárias para o ambiente de desenvolvimento. **Nunca envie arquivos `.env`, credenciais ou secrets para o Git.**

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível localmente no endereço informado pelo Next.js, normalmente:

```text
http://localhost:3000
```

---

# Scripts disponíveis

Os principais scripts atualmente definidos no projeto incluem:

```bash
npm run dev
```

Executa o ambiente de desenvolvimento com Next.js e Turbopack.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Executa a aplicação em modo de produção após uma build.

### Banco de dados

```bash
npm run db:generate
```

Gera as migrações necessárias a partir do schema.

```bash
npm run db:migrate
```

Executa as migrações.

```bash
npm run db:push
```

Sincroniza o schema com o banco configurado.

```bash
npm run db:studio
```

Abre o Drizzle Studio.

Antes de executar comandos que alterem um banco de dados compartilhado, confirme qual ambiente está configurado.

# Fluxo de desenvolvimento

O fluxo recomendado é:

```text
Issue
  ↓
Fork
  ↓
Branch
  ↓
Desenvolvimento
  ↓
Testes
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Code Review
  ↓
Merge
```

# Fork

Como o repositório principal não deve ser alterado diretamente por contribuidores externos, faça um fork do projeto:

```text
https://github.com/ohthias/roboStage
```

Depois clone seu fork:

```bash
git clone https://github.com/SEU-USUARIO/roboStage.git
cd roboStage
```

Adicione o repositório original como `upstream`:

```bash
git remote add upstream https://github.com/ohthias/roboStage.git
```

Verifique:

```bash
git remote -v
```

# Branches

Evite desenvolver diretamente na branch `main`.

Crie uma branch específica para cada alteração:

```bash
git checkout -b feat/nova-funcionalidade
```

Exemplos:

```text
feat/labtest-filtros
fix/dashboard-loading
docs/contributing
refactor/team-dashboard
style/fll-hero
chore/update-dependencies
```

Prefira branches pequenas e focadas.

---

# Commits

Utilize mensagens de commit claras e objetivas.

Exemplos:

```bash
git commit -m "feat: adiciona filtro ao LabTest"
```

```bash
git commit -m "fix: corrige carregamento do dashboard"
```

```bash
git commit -m "docs: atualiza guia de contribuição"
```

```bash
git commit -m "style: melhora layout da página FLL"
```

```bash
git commit -m "refactor: reorganiza componente de testes"
```

Tipos recomendados:

| Tipo       | Uso                                      |
| ---------- | ---------------------------------------- |
| `feat`     | Nova funcionalidade                      |
| `fix`      | Correção de bug                          |
| `docs`     | Documentação                             |
| `style`    | Estilo/UI sem alteração de comportamento |
| `refactor` | Refatoração                              |
| `test`     | Testes                                   |
| `chore`    | Manutenção                               |
| `perf`     | Performance                              |
| `security` | Correções relacionadas à segurança       |

Mantenha cada commit relacionado a uma alteração lógica.

# Pull Requests

Depois de finalizar sua alteração:

```bash
git push origin nome-da-sua-branch
```

Abra um Pull Request no GitHub.

O Pull Request deve explicar:

### O que foi alterado?

Descreva objetivamente a mudança.

### Por que foi alterado?

Explique o problema ou necessidade.

### Como foi implementado?

Descreva decisões técnicas relevantes.

### Como foi testado?

Informe os testes realizados.

### Issue relacionada

Quando aplicável:

```text
Closes #123
```

ou:

```text
Fixes #123
```

## Checklist recomendado

Antes de enviar o Pull Request:

* [ ] A alteração está relacionada a uma Issue ou necessidade clara.
* [ ] O código está formatado.
* [ ] Não existem secrets no código.
* [ ] Não existem dados pessoais expostos.
* [ ] A aplicação inicia corretamente.
* [ ] A build foi executada.
* [ ] A funcionalidade foi testada.
* [ ] O comportamento em telas menores foi verificado quando aplicável.
* [ ] A documentação foi atualizada quando necessário.
* [ ] O Pull Request possui uma descrição clara.

O GitHub recomenda que Pull Requests sejam enviados para revisão com contexto suficiente sobre a alteração e que as mudanças solicitadas pelos mantenedores sejam feitas no mesmo Pull Request, preservando o histórico da revisão.

# Revisão de código

Code review faz parte do processo.

Os revisores podem solicitar:

* alterações arquiteturais;
* simplificação;
* refatoração;
* melhorias de acessibilidade;
* correções de segurança;
* testes adicionais;
* alterações visuais;
* melhorias na documentação.

Comentários devem estar relacionados à alteração e ao código.

Feedback técnico não deve ser interpretado como crítica pessoal.

Consulte também o [Código de Conduta](./CODE-OF-CONDUCT.md).

# Testes

Antes de abrir um Pull Request, execute pelo menos:

```bash
npm run build
```

Quando a alteração afetar o ambiente de desenvolvimento:

```bash
npm run dev
```

e verifique manualmente a funcionalidade alterada.

Para alterações de interface, teste também:

* desktop;
* tablet;
* mobile;
* diferentes tamanhos de viewport;
* estados de carregamento;
* estados vazios;
* mensagens de erro.

Para alterações relacionadas a dados:

* criação;
* leitura;
* atualização;
* exclusão;
* estados de erro;
* permissões;
* autenticação.

# Banco de dados

Alterações no banco devem ser tratadas com atenção.

Ao alterar schemas ou tabelas:

1. avalie o impacto sobre dados existentes;
2. atualize o schema;
3. gere as migrações necessárias;
4. teste em ambiente de desenvolvimento;
5. documente alterações relevantes;
6. nunca execute alterações destrutivas em produção sem autorização adequada.

Não inclua bancos de dados reais ou dumps contendo informações de usuários no repositório.

# Interface e experiência do usuário

O RoboStage possui uma identidade visual própria e utiliza Tailwind CSS e DaisyUI.

Novas interfaces devem:

* respeitar a identidade visual existente;
* utilizar os componentes disponíveis quando apropriado;
* manter consistência de espaçamento;
* considerar responsividade;
* considerar acessibilidade;
* evitar componentes visualmente isolados do restante da plataforma;
* evitar introduzir dependências desnecessárias.

Ao alterar uma página existente, prefira evoluir o padrão visual já utilizado em vez de criar uma linguagem visual completamente diferente.

Para componentes interativos, considere:

* `hover`;
* `focus`;
* `active`;
* `disabled`;
* loading;
* erro;
* estado vazio;
* navegação por teclado.

# Documentação

Alterações que modificam o comportamento de uma ferramenta podem exigir atualização da documentação.

Isso inclui:

* README;
* FAQ;
* guias;
* documentação técnica;
* textos de interface;
* exemplos;
* changelog.

Se uma funcionalidade não puder ser compreendida sem conhecimento interno do código, considere adicionar documentação.

# Segurança

Não publique vulnerabilidades de segurança como Issues públicas quando elas puderem permitir exploração.

Não inclua no código:

```text
API keys
tokens
passwords
session cookies
private keys
database credentials
webhook secrets
```

Se você encontrar uma vulnerabilidade, utilize o processo indicado na política de segurança do repositório.

Nunca utilize uma vulnerabilidade para acessar, alterar, copiar ou excluir dados de terceiros.

# Dados pessoais

O RoboStage pode ser utilizado em ambientes educacionais e por equipes de robótica.

Contribuições devem evitar dados pessoais reais sempre que possível.

Use dados fictícios em exemplos:

```text
Aluno Exemplo
Equipe Teste
teste@example.com
```

Não envie para o GitHub:

* dados de estudantes;
* e-mails pessoais;
* telefones;
* endereços;
* credenciais;
* informações privadas de equipes;
* tokens;
* screenshots contendo informações pessoais;
* registros de produção.

Consulte também:

* [Política de Privacidade](https://www.robostage.com.br/legal/privacy)
* [Termos de Uso](https://www.robostage.com.br/legal/terms)

# Contribuições relacionadas à FLL

O RoboStage possui foco atual na FIRST LEGO League Challenge e oferece ferramentas relacionadas a planejamento, testes, pontuação, documentação e eventos.

Contribuições relacionadas à FLL devem considerar cuidadosamente:

* regras oficiais da temporada;
* sistemas de pontuação;
* missões;
* nomenclatura;
* atualizações oficiais;
* diferenças entre temporadas.

Quando uma funcionalidade representar regras ou pontuação oficial, utilize fontes oficiais da competição como referência.

Não apresente uma implementação experimental como regra oficial.

### Dados de temporadas

O RoboStage atualmente possui suporte/documentação relacionada a temporadas como:

* BIOGLOW;
* UNEARTHED;
* SUBMERGED;
* MASTERPIECE.

Temporadas passadas devem ser adicionadas de maneira organizada, evitando misturar regras ou conteúdos de temporadas diferentes.

# Apoie o RoboStage

Contribuir não significa apenas escrever código.

O RoboStage possui uma página específica para diferentes formas de apoio:

[Apoie o RoboStage](https://www.robostage.com.br/sponsors)

Atualmente, o projeto apresenta três formas principais de apoio:

### Código

Contribua diretamente com o desenvolvimento através do GitHub.

Você pode:

* corrigir bugs;
* criar funcionalidades;
* melhorar a documentação;
* melhorar acessibilidade;
* revisar Pull Requests;
* testar novas versões.

### Divulgação

Uma das formas mais simples de ajudar é apresentar o RoboStage para outras pessoas.

Compartilhe com:

* equipes de robótica;
* técnicos;
* mentores;
* organizadores;
* professores;
* estudantes;
* comunidades de robótica.

Você pode compartilhar:

[RoboStage](https://www.robostage.com.br/)

### Apoio financeiro

O RoboStage também possui uma iniciativa para apoio financeiro destinada à manutenção da infraestrutura e desenvolvimento da plataforma.

No momento, a página oficial informa que essa forma de apoio está sendo preparada. Portanto, não há neste documento uma promessa de valores, benefícios ou modalidades que ainda não estejam oficialmente disponíveis.

Quando o sistema estiver disponível, consulte a página oficial para conhecer as formas de apoio.

# Divulgação responsável

Ao divulgar o RoboStage:

* utilize informações atualizadas;
* não prometa funcionalidades que não existem;
* não represente o RoboStage como uma ferramenta oficial da FIRST;
* deixe claro quando estiver falando em nome próprio;
* utilize os materiais oficiais quando disponíveis.

O RoboStage é uma plataforma independente criada para a comunidade de robótica.

# Relação com patrocinadores e apoiadores

O apoio ao RoboStage tem como objetivo contribuir para:

* manutenção da infraestrutura;
* desenvolvimento;
* novas ferramentas;
* melhorias da plataforma;
* continuidade do projeto.

A existência de apoio financeiro não deve ser interpretada como garantia de:

* acesso privilegiado ao código;
* aprovação automática de Pull Requests;
* prioridade em Issues;
* influência sobre decisões técnicas;
* resultados em competições;
* vantagens competitivas para equipes.

Decisões técnicas devem continuar sendo baseadas nas necessidades do projeto, qualidade da implementação, segurança, manutenção e interesse da comunidade.

# O que acontece depois de um Pull Request?

Depois de abrir um Pull Request:

1. os mantenedores podem revisar a implementação;
2. podem solicitar alterações;
3. você pode atualizar a mesma branch;
4. novas alterações aparecerão no Pull Request;
5. após a revisão, o Pull Request poderá ser aprovado e integrado.

Não abra um novo Pull Request apenas para responder a comentários de revisão, salvo quando solicitado pelos mantenedores.

Evite fazer `force push` desnecessariamente depois que uma revisão já começou, pois isso pode dificultar o acompanhamento das alterações.

# Contribuições que podem não ser aceitas

Nem toda contribuição será incorporada.

Um Pull Request pode ser recusado quando:

* não resolve um problema relevante;
* duplica uma funcionalidade existente;
* aumenta significativamente a complexidade;
* introduz riscos de segurança;
* quebra funcionalidades existentes;
* não segue os padrões do projeto;
* possui manutenção desproporcional ao benefício;
* não está alinhado ao direcionamento atual do RoboStage;
* apresenta problemas legais ou de licenciamento.

A rejeição de uma contribuição não significa que ela seja tecnicamente inválida. Pode significar apenas que ela não se encaixa no estado atual do projeto.

# Licença

O RoboStage utiliza a licença MIT conforme o arquivo `LICENSE` do repositório.

Ao contribuir, verifique se você possui os direitos necessários sobre o código, imagens, textos, dados ou outros materiais enviados ao projeto.

Não envie conteúdo de terceiros sem verificar sua licença ou autorização de uso.

# Contato

Para dúvidas gerais sobre contribuição:

**E-mail:** [robostage.dev@gmail.com](mailto:robostage.dev@gmail.com)

Para desenvolvimento:

**GitHub:**
https://github.com/ohthias/roboStage

Para Issues:

https://github.com/ohthias/roboStage/issues

Para conhecer a plataforma:

https://www.robostage.com.br/

Para apoiar o projeto:

https://www.robostage.com.br/sponsors

# Documentos relacionados

* [README](./README.md)
* [Código de Conduta](./CODE-OF-CONDUCT.md)
* [LICENSE](./LICENSE)
* [Termos de Uso](https://www.robostage.com.br/legal/terms)
* [Política de Privacidade](https://www.robostage.com.br/legal/privacy)
* [Política de Segurança](./SECURITY.md)

## Obrigado por contribuir

Cada contribuição ajuda a tornar o RoboStage mais útil para equipes, técnicos, mentores, organizadores e toda a comunidade de robótica.

**Código, ideias, feedback ou divulgação: toda contribuição pode ajudar o próximo estágio do RoboStage.**