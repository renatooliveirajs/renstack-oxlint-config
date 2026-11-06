# Contribuindo

Execute `npm ci` e `npm run check` antes de abrir um PR.

Use Conventional Commits nos commits que chegam à `main`. Ao usar squash merge,
o título do PR deve seguir esse padrão, pois ele será o commit final:

- `fix: corrige regra do preset React` → patch (`0.1.0` → `0.1.1`).
- `feat: adiciona um preset` → minor (`0.1.0` → `0.2.0`).
- `feat!: altera uma configuração incompatível` → major (`0.1.0` → `1.0.0`).
- `docs:`, `test:`, `ci:` e `chore:` não geram versão sozinhos.

Também é possível indicar uma quebra com `BREAKING CHANGE:` no corpo do commit.
O Release Please agrupa os commits, propõe a próxima versão e gera o changelog.
Não altere manualmente a versão para releases normais: revise e mescle o PR
de release gerado pelo bot.
