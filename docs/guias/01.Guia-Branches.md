# Guia Completo de Branches e Pull Requests (PR)

## 1. Objetivo

Padronizar como o time cria branches, desenvolve tarefas e integra codigo via Pull Request, garantindo:

- historico limpo
- menor risco de regressao
- revisao de qualidade
- previsibilidade no fluxo de entrega

## 2. Principios do time

Regras praticas obrigatorias:

1. Ninguem trabalha direto na `main`
2. Ninguem trabalha direto na `develop`
3. Toda tarefa nasce em uma branch propria
4. Toda branch propria abre PR para `develop`

Essas regras valem para backend, frontend, documentacao e tarefas de infraestrutura.

## 3. Estrategia de branches

Branches permanentes:

- `main`: versao estavel e pronta para producao
- `develop`: branch de integracao do time

Branches temporarias (por tarefa):

- `feat/*`: novas funcionalidades
- `fix/*`: correcoes de bugs
- `docs/*`: alteracoes de documentacao
- `chore/*`: setup tecnico, configuracoes, automacoes e manutencao

## 4. Padrao oficial de nomes

Formato:

`<tipo>/<area>-<descricao-curta>`

Exemplos oficiais:

- `feat/backend-auth`
- `feat/backend-users`
- `feat/frontend-login`
- `fix/backend-cors`
- `docs/arquitetura-inicial`
- `chore/backend-setup`

### 4.1 Regras de nomenclatura

1. Use letras minusculas
2. Use hifen `-` para separar palavras
3. Nao use espacos nem caracteres especiais
4. Comece sempre pelo tipo (`feat`, `fix`, `docs`, `chore`)
5. Inclua contexto da area (`backend`, `frontend`, `infra`, etc.)
6. Seja curto e objetivo (evite nomes longos)

## 5. Fluxo operacional completo

## 5.1 Antes de iniciar uma tarefa

1. Atualize sua base local:
   - `git checkout develop`
   - `git pull origin develop`
2. Crie sua branch a partir da `develop`:
   - `git checkout -b feat/backend-auth`

Nunca crie branch de tarefa a partir de `main`.

## 5.2 Durante o desenvolvimento

1. Faça commits pequenos e coerentes
2. Rode testes e linters localmente
3. Sincronize com `develop` periodicamente para reduzir conflitos:
   - `git fetch origin`
   - `git rebase origin/develop`

Se preferir merge local em vez de rebase, alinhe com o padrao do time.

## 5.3 Publicar branch no remoto

Depois dos commits locais:

- `git push -u origin feat/backend-auth`

A flag `-u` define o tracking para os proximos pushes/pulls.

## 5.4 Abrir Pull Request para `develop`

Destino obrigatorio:

- Base branch: `develop`
- Compare branch: sua branch de tarefa (`feat/*`, `fix/*`, `docs/*`, `chore/*`)

Toda entrega deve entrar via PR, nunca por push direto na `develop`.

## 5.5 Revisao e aprovacao

Minimo recomendado:

1. Pelo menos 1 aprovacao de outro membro
2. CI verde (build/test/lint)
3. Sem conflitos
4. Escopo da PR coerente com o titulo e descricao

## 5.6 Merge da PR

Recomendacao:

- usar `Squash and merge` para manter historico limpo por tarefa

Alternativas (se time decidir):

- `Merge commit` quando for importante preservar estrutura completa dos commits
- `Rebase and merge` quando a equipe mantem historico linear por padrao

## 5.7 Pos-merge

1. Excluir branch remota apos merge
2. Excluir branch local:
   - `git branch -d feat/backend-auth`
3. Atualizar `develop` local:
   - `git checkout develop`
   - `git pull origin develop`

## 6. Politica de Pull Request

## 6.1 Tamanho da PR

Recomendacao:

- pequena ou media (facil de revisar)
- evitar PR muito grande com varios temas diferentes

## 6.2 Conteudo minimo da descricao

Cada PR deve responder:

1. O que foi feito
2. Por que foi feito
3. Como validar
4. Impactos e riscos
5. Evidencias (prints, logs, endpoints testados, etc.) quando aplicavel

## 6.3 Checklist obrigatorio

- [ ] Segue o padrao de branch
- [ ] PR aponta para `develop`
- [ ] Testes locais executados
- [ ] Lint/format aplicados
- [ ] Sem arquivos temporarios
- [ ] Documentacao atualizada (quando necessario)
- [ ] Sem segredo/token/senha no codigo

## 7. Convencoes recomendadas de commit

Embora nao seja obrigatorio, padronizar commits ajuda no historico.

Exemplo (Conventional Commits):

- `feat(auth): adiciona endpoint de login`
- `fix(cors): corrige origem permitida no backend`
- `docs(arquitetura): descreve estrutura inicial`
- `chore(ci): ajusta pipeline de build`

## 8. Protecoes recomendadas no repositorio

Configurar protecao para `main` e `develop`:

1. Bloquear push direto
2. Exigir PR para merge
3. Exigir checks de CI
4. Exigir pelo menos 1 aprovacao
5. Bloquear merge com conflitos
6. Opcional: exigir conversa resolvida

## 9. Casos especiais

## 9.1 Hotfix urgente em producao

Quando necessario corrigir algo critico em producao:

1. Criar branch de hotfix a partir de `main` (ex.: `fix/hotfix-login-prod`)
2. Abrir PR para `main`
3. Apos merge em `main`, replicar a mesma correcao para `develop` via PR

Isso evita divergencia entre `main` e `develop`.

## 9.2 Mudanca grande

Para escopos grandes:

1. Quebrar em subtarefas
2. Abrir multiplas PRs pequenas por etapa
3. Integrar incrementalmente na `develop`

## 10. Anti-padroes (evitar)

1. Commits gigantes sem contexto
2. PR com muitos assuntos misturados
3. Branch com nome generico (`teste`, `ajuste`, `coisas`)
4. Trabalho direto em `main` ou `develop`
5. Merge sem revisao
6. Ignorar falhas de CI

## 11. Fluxo resumido (passo a passo)

1. `git checkout develop`
2. `git pull origin develop`
3. `git checkout -b feat/frontend-login`
4. Desenvolver + testar
5. `git add .`
6. `git commit -m "feat(login): implementa fluxo de autenticacao"`
7. `git push -u origin feat/frontend-login`
8. Abrir PR para `develop`
9. Corrigir feedbacks
10. Merge
11. Apagar branch

## 12. Decisao oficial deste projeto

Padrao adotado:

- Branches de tarefa no formato `tipo/area-descricao`
- Ninguem trabalha direto em `main`
- Ninguem trabalha direto em `develop`
- Toda tarefa em branch propria
- Toda branch propria abre PR para `develop`

Esse guia e a referencia oficial para colaboracao no projeto.
