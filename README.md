# @renstack/oxlint-config

Configurações compartilhadas de **Oxlint** e **Oxfmt** para JavaScript e TypeScript, sem ESLint ou Prettier.

## Instalação

```sh
npm install -D @renstack/oxlint-config oxlint oxfmt
```

Requer Node.js **22.18+** (ou 24+) para carregar os arquivos de configuração TypeScript.

## Oxlint

Crie `oxlint.config.ts` na raiz do projeto:

```ts
import config from '@renstack/oxlint-config/react';

export default config;
```

Escolha o preset conforme o projeto:

| Import                               | Configuração                                               |
| ------------------------------------ | ---------------------------------------------------------- |
| `@renstack/oxlint-config` ou `/base` | Base para JavaScript e TypeScript                          |
| `@renstack/oxlint-config/react`      | Base + React Hooks, JSX e acessibilidade; ambiente browser |
| `@renstack/oxlint-config/next`       | React + regras Next.js; ambientes browser e Node.js        |
| `@renstack/oxlint-config/node`       | Base + regras Node.js; ambiente Node.js                    |

O preset React assume o JSX transform moderno: não exige importar `React` nem declarar `propTypes`.
Todos os presets habilitam erros de correctness, proíbem `var` e `debugger`, exigem `const` quando possível e imports de tipos consistentes. Variáveis e argumentos não utilizados podem receber o prefixo `_`. `any` explícito gera aviso.

### Personalização

Use `extends` para preservar as regras do preset e aplicar suas próprias opções:

```ts
import config from '@renstack/oxlint-config/next';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [config],
  rules: {
    'typescript/no-explicit-any': 'error',
    'nextjs/no-img-element': 'off'
  },
  settings: {
    next: { rootDir: 'apps/web/' }
  }
});
```

Os plugins são nativos do Oxlint; não é necessário instalar plugins ESLint. A análise que depende de tipos não é ativada por padrão. Os presets não incluem globals de Jest/Vitest: configure-os no projeto caso necessário.

## Oxfmt

Crie **outro arquivo**, `oxfmt.config.ts`:

```ts
import config from '@renstack/oxlint-config/oxfmt';

export default config;
```

O preset de formatação é o mesmo para Next.js, React e Node.js: 2 espaços, aspas simples no JavaScript, aspas duplas no JSX, ponto e vírgula, sem trailing commas, largura de 80 caracteres e finais de linha LF. Ativa ordenação de imports e classes Tailwind, com um atributo JSX por linha.

Para personalizar, use spread (a configuração do Oxfmt não usa o `extends` do Oxlint):

```ts
import config from '@renstack/oxlint-config/oxfmt';

export default {
  ...config,
  semi: false,
  printWidth: 80,
  ignorePatterns: [...(config.ignorePatterns ?? []), '**/generated/**']
};
```

As configurações devem ser módulos TypeScript para usar esses imports; não coloque imports em `.oxlintrc.json` ou `.oxfmtrc.json`.

## VS Code no projeto consumidor

Instale a extensão oficial [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) (`oxc.oxc-vscode`), também compatível com editores baseados no VS Code, como Cursor.

A extensão usa o `oxlint --lsp` instalado **localmente no projeto**. Instale as dependências com `npm install` e abra a pasta do projeto consumidor no editor. Mantenha o `oxlint.config.ts` na raiz, importando o preset desta lib conforme os exemplos anteriores. Instalar apenas esta lib ou a extensão não substitui a instalação local do `oxlint`.

### Recomendar a extensão para a equipe

Crie `.vscode/extensions.json` no projeto consumidor:

```json
{
  "recommendations": ["oxc.oxc-vscode"]
}
```

Essa configuração recomenda a extensão, mas cada colaborador precisa instalá-la.

### Aplicar correções ao salvar

Crie `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "always"
  }
}
```

Se esses arquivos já existirem, acrescente as opções sem remover as configurações atuais. Versione ambos para compartilhar a configuração com a equipe.

Com a extensão ativa, o Oxlint apresenta os diagnósticos no editor e no painel **Problems**, respeitando o preset importado pelo projeto. O fix-on-save aplica apenas as correções disponíveis do linter; não substitui a formatação do Oxfmt nem corrige automaticamente todos os erros.

Se os diagnósticos não aparecerem, confirme que as dependências estão instaladas, que a extensão está habilitada no workspace e que o editor usa uma versão compatível do Node.js para carregar o `oxlint.config.ts`. Após alterações, execute **Developer: Reload Window** na paleta de comandos e consulte o painel **Output** da extensão Oxc para investigar erros.

Referência: [configuração oficial do Oxlint para VS Code](https://oxc.rs/docs/guide/usage/linter/editors.html#vs-code).

## Scripts no projeto consumidor

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check ."
  }
}
```

Para tratar avisos como falhas no CI, execute `oxlint --deny-warnings`.

## Lefthook no projeto consumidor

O Lefthook executa as ferramentas nos hooks do Git. Ele deve ser instalado no **projeto consumidor**; esta lib fornece apenas as configurações do Oxlint e do Oxfmt.

### 1. Instale e configure as ferramentas

```sh
npm install -D lefthook @renstack/oxlint-config oxlint oxfmt
```

Crie `oxlint.config.ts` e `oxfmt.config.ts` conforme os exemplos acima, escolhendo o preset `/react`, `/next` ou `/node`. Mantenha os scripts `lint`, `lint:fix`, `format` e `format:check` da seção anterior.

### 2. Configure o hook

Crie `lefthook.yml` na raiz do repositório consumidor:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      run: npm run lint -- --deny-warnings
    format:
      run: npm run format:check
```

Antes de cada commit, o Lefthook verifica **todo o projeto** com os presets importados da lib. Erros de lint, avisos ou problemas de formatação bloqueiam o commit. Os comandos apenas verificam os arquivos: não modificam o código nem executam `git add`, preservando o staging parcial.

Para corrigir os problemas, execute e revise as alterações antes de adicioná-las ao commit:

```sh
npm run lint:fix
npm run format
```

### 3. Ative os hooks

Dentro de um repositório Git, execute:

```sh
npx lefthook install
```

Para reinstalar os hooks automaticamente após `npm install` ou `npm ci`, adicione ao `package.json` do consumidor:

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

Se já existir um script `prepare`, preserve o comando atual e acrescente `&& lefthook install`. Versione `lefthook.yml`, as configurações e os arquivos de dependências; cada colaborador precisa instalar os hooks no próprio clone.

Para testar sem criar um commit, execute `npx lefthook run pre-commit`. Mantenha também as verificações no CI: hooks locais podem ser ignorados e não substituem a validação do GitHub Actions.

## Desenvolvimento e publicação

Este repositório também usa Lefthook: o `pre-commit` executa **lint, typecheck e testes em paralelo**. O script `prepare` instala os hooks automaticamente após instalar as dependências. Para executar as verificações do hook manualmente, inclusive sem arquivos no staging, use `npx lefthook run pre-commit --force`.

```sh
npm install
npm run check
npm pack --dry-run
npm publish --access public
```

O pacote é ESM, com declarações TypeScript, e não precisa de build. A publicação exige acesso ao escopo `@renstack` no npm.

## Releases automáticas

O repositório usa **Release Please** com **Conventional Commits**:

1. Faça merge de PRs na branch `main`, usando títulos como `fix: ...`, `feat: ...` ou `feat!: ...` no squash merge.
2. O workflow valida tipos, lint, formatação, testes e empacotamento no Node.js 22 e 24.
3. O bot abre ou atualiza um PR com a próxima versão, `package-lock.json` e `CHANGELOG.md`, com links para commits.
4. Ao mesclar o PR de release, o bot cria a tag `vX.Y.Z` e uma **GitHub Release** com as notas das alterações.

`fix` gera patch, `feat` gera minor e breaking changes geram major, inclusive antes de `1.0.0`. Commits apenas de documentação, testes e manutenção não geram uma versão sozinhos. Veja [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).

### Ativar no GitHub

- Envie este diretório como a raiz do repositório GitHub, usando `main` como branch principal.
- Em **Settings → Actions → General → Workflow permissions**, habilite **Allow GitHub Actions to create and approve pull requests**. O bot apenas abre o PR; a aprovação e o merge continuam sob seu controle.
- Selecione squash merge e use o título do PR como mensagem do commit final.
- O manifesto parte da versão `0.1.0`. Se ela já foi lançada, crie a tag `v0.1.0` no commit correspondente antes de iniciar o fluxo, para não incluir o histórico antigo na primeira release automática.
- PRs criados com `GITHUB_TOKEN` não disparam outros workflows automaticamente. Se a proteção da branch exigir CI no PR do bot, configure um token de GitHub App no lugar de `GITHUB_TOKEN` na action do Release Please. O workflow de release sempre valida novamente o commit na `main` antes de criar a release.

O workflow também pode ser iniciado pela aba **Actions → Release → Run workflow**. Ele não cria uma versão nova se não houver alterações elegíveis.

### Publicação automática no npm (opcional)

A criação de tags e GitHub Releases funciona sem configurar o npm. Para publicar o pacote automaticamente também:

1. Adicione a URL real do repositório ao campo `repository` do `package.json` (tipo `git`, URL `git+https://github.com/OWNER/REPO.git`) e mantenha o repositório público para usar provenance.
2. No npm, em **Settings → Trusted Publisher** do pacote, selecione GitHub Actions e informe owner, repositório, workflow **`release.yml`** e environment **`npm`**. Permita publicação direta por esse trusted publisher.
3. No GitHub, crie o environment **`npm`**. Você pode exigir aprovação manual nele, se desejar.
4. Em **Settings → Secrets and variables → Actions → Variables**, crie `NPM_PUBLISH_ENABLED` com valor `true` **antes de mesclar o próximo PR de release**.

A publicação usa OIDC, sem armazenar `NPM_TOKEN`, e publica exatamente a tag criada. O npm CLI temporário da versão 11 evita depender do npm pré-instalado no runner. O `prepublishOnly` executa novamente todas as verificações.

Se a publicação no npm falhar depois de criar a release, corrija o problema e reexecute **apenas o job que falhou** no GitHub Actions. Reexecutar o workflow inteiro pode não publicar, pois a release já terá sido criada. Não gere outra versão apenas para tentar publicar novamente.
