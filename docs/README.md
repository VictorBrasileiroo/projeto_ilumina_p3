# Guia de Documentacao 

Este README explica o que existe em cada pasta de `docs/` e onde encontrar os documentos mais importantes do projeto.

## 1. Estrutura de pastas

| Pasta | O que voce encontra aqui |
|---|---|
| `docs/arquitetura` | estado atual do sistema, decisoes arquiteturais e visao tecnica macro |
| `docs/features` | documentacao por feature/modulo (contratos, uso, endpoint, escopo) |
| `docs/etapas` | historico passo a passo do que foi implementado em cada etapa tecnica |
| `docs/guias` | guias de processo de time (branches, PR, padroes de trabalho) |
| `docs/api` | espaco reservado para documentacao de API mais detalhada por dominio |
| `docs/diagramas` | espaco para diagramas (ERD, fluxo, sequencia, etc.) |
| `docs/atas` | atas e registros de reunioes tecnicas/produto |

## 2. Documentos principais no estado atual

Arquitetura:
- `docs/arquitetura/2026-04-05-estado-atual-do-sistema.md` (snapshot mais recente)
- `docs/arquitetura/2026-04-04-decisao-modelagem-user-professor-aluno.md` (decisao canonica de modelagem)

Feature de Professor:
- `docs/features/2026-04-05-feature-modulo-professor-crud-inicial.md`

Feature de JWT (refresh + claims):
- `docs/features/2026-04-05-feature-jwt-refresh-claims.md`

API do modulo de Professor:
- `docs/api/2026-04-05-api-modulo-professor.md`

API de autenticacao (JWT):
- `docs/api/2026-04-05-api-auth-jwt-refresh-claims.md`

Historico de implementacao:
- `docs/etapas/2026-03-24-01-seguranca-cors-health-apiresponse.md`
- `docs/etapas/2026-03-25-02-modelo-usuario-auditoria-repositorios.md`
- `docs/etapas/2026-03-25-03-seguranca-jwt-autenticacao.md`
- `docs/etapas/2026-04-05-04-modulo-professor-crud-inicial.md`
- `docs/etapas/2026-04-05-05-evolucao-jwt-refresh-claims.md`

Guias de processo:
- `docs/guias/01.Guia-Branches.md`
- `docs/guias/02.Template-PR.md`
- `docs/guias/03.Bloqueio-Páginas.md`
- `docs/guias/04.Guia-Tokens-Refresh-Claims.md`

## 3. Como navegar rapido

Se voce quer entender o sistema hoje:
1. Leia `docs/arquitetura/2026-04-05-estado-atual-do-sistema.md`.
2. Leia a feature alvo em `docs/features/`.
3. Consulte `docs/etapas/` para entender o historico de implementacao.

Se voce vai implementar algo novo:
1. Confirme decisoes em `docs/arquitetura/`.
2. Registre a feature em `docs/features/`.
3. Registre a execucao em `docs/etapas/`.

## 4. Convencao de nomes recomendada

Padrao sugerido para novos arquivos:
- arquitetura: `YYYY-MM-DD-<tema>.md`
- features: `YYYY-MM-DD-feature-<modulo>.md`
- etapas: `YYYY-MM-DD-<ordem>-<tema>.md`

Exemplos:
- `2026-04-05-estado-atual-do-sistema.md`
- `2026-04-05-feature-modulo-professor-crud-inicial.md`
- `2026-04-05-04-modulo-professor-crud-inicial.md`
