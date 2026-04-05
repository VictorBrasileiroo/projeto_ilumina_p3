# Feature: Modulo Turma (CRUD v1 + vinculo professor)

Data: 2026-04-05
Status: implementado
Escopo: backend API

## 1. Objetivo da feature

Entregar o recorte v1 do modulo de Turmas no backend, com:
- CRUD inicial de Turma
- desativacao logica
- vinculo Professor <-> Turma
- operacoes de join/leave para professor autenticado
- autorizacao por papel e vinculo

## 2. Escopo atual

- Entidade `Turma` com `nome`, `ano`, `turno`, `ensino`, `qntAlunos`, `active`.
- Entidade de vinculo `ProfTurma` com constraint de unicidade (`professor_id`, `turma_id`).
- Endpoints em `/api/v1/turmas` para criar, listar, detalhar, atualizar, desativar, entrar e sair.
- Auto-vinculo do professor autenticado na criacao da turma.
- Envelope de resposta padronizado com `ApiResponse`.

## 3. Fora de escopo

- Matricula aluno-turma.
- Integracao com Provas e Flashcards.
- Ownership por criador.
- Exclusao fisica de turma.
- Filtros avancados e paginacao.

## 4. Regras aplicadas

- `ano` entre 1 e 9.
- `qntAlunos` inteiro >= 0.
- `turno` enum fechado: `MATUTINO`, `VESPERTINO`, `NOTURNO`.
- `ensino` enum fechado: `INFANTIL`, `FUNDAMENTAL`, `MEDIO`, `SUPERIOR`.
- Turma desativada continua persistida (`active=false`) e visivel quando `includeInactive=true`.
- Professor lista apenas turmas em que esta vinculado.
- Professor so pode editar/desativar/detalhar turma se estiver vinculado.
- Admin pode editar/desativar/detalhar qualquer turma.
- Turma desativada nao aceita `update` nem novo `join`.
- Join/leave usam professor autenticado + professorId alvo para dupla validacao.

## 5. Endpoints do modulo

Base path: `/api/v1/turmas`

- `POST /api/v1/turmas`
- `GET /api/v1/turmas?includeInactive=false`
- `GET /api/v1/turmas/{id}`
- `PUT /api/v1/turmas/{id}`
- `PATCH /api/v1/turmas/{id}/deactivate`
- `POST /api/v1/turmas/{id}/join`
- `DELETE /api/v1/turmas/{id}/leave?professorId=<uuid>`

## 6. Qualidade e testes

- Nova suite de integracao: `TurmaControllerIntegrationTest`.
- Cobertura de fluxo feliz, validacoes, autorizacao, join/leave, visibilidade de inativos e erros principais.
- Regressao validada com os testes existentes de Professor e contexto da aplicacao.
