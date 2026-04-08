# Feature: Modulo Aluno + TurmaAluno (matriculas)

Data: 2026-04-07
Status: implementado
Escopo: backend API + consumo frontend

## 1. Objetivo da feature

Entregar o modulo funcional de aluno e matricula em turma, com foco em:
- cadastro e manutencao de perfil de aluno;
- vinculo aluno-turma por entidade associativa;
- contrato de API explicito para matricula (`/matriculas`);
- regras de autorizacao por papel (admin, professor, aluno);
- endpoint publico de leitura de alunos por turma para consumo sem autenticacao.

## 2. Contexto e problema resolvido

Antes desta feature, o sistema tinha:
- autenticacao JWT com claims de perfil;
- modulo professor funcional;
- modulo turma com vinculo professor-turma.

Gaps resolvidos por esta entrega:
- inexistencia de fluxo completo aluno <-> turma;
- naming de rota de matricula ambigo (`/alunos`) para operacao de vinculo;
- ausencia de endpoint publico para leitura de alunos por turma;
- ausencia de permissao de `ROLE_ALUNO` na listagem de turmas.

## 3. Escopo atual

## 3.1 Escopo funcional implementado

- CRUD inicial de aluno (criar, listar, detalhar, atualizar, desativar).
- Relacao N:N aluno-turma via `AlunoTurma`.
- Matricular aluno em turma.
- Desmatricular aluno de turma.
- Listar alunos de uma turma (protegido).
- Listar alunos de uma turma (publico).
- Listar turmas de um aluno.
- Listar turmas com acesso para `ROLE_ALUNO`.
- Auto-matricula de aluno com validacao de ownership.

## 3.2 Fora de escopo

- Paginacao de listas de aluno/turma.
- Filtros avancados por nome, serie, disciplina ou status de matricula.
- Metadados de matricula (periodo letivo, status historico, data de cancelamento).
- Exclusao fisica de aluno/turma/vinculo.
- Rate limit e cache especifico para endpoint publico.

## 4. Modelagem e persistencia

## 4.1 Entidades principais

`Aluno`:
- perfil 1:1 com `User` via `user_id` unico;
- `matricula` unica;
- `sexo`;
- heranca de auditoria via `BaseEntity`.

`AlunoTurma`:
- associativa explicita entre `Aluno` e `Turma`;
- `@ManyToOne` para aluno e turma;
- unicidade no par (`aluno_id`, `turma_id`).

## 4.2 Invariantes de dados

- nao pode existir aluno sem `User` associado;
- nao pode existir duplicidade de `matricula` em aluno;
- nao pode existir duplicidade de vinculo para o mesmo par aluno-turma;
- matricula em turma so ocorre quando turma esta ativa.

## 5. Regras de negocio consolidadas

## 5.1 Matricular aluno em turma

- Admin pode matricular qualquer aluno em qualquer turma ativa.
- Professor pode matricular apenas se estiver vinculado a turma alvo.
- Aluno pode matricular somente a si mesmo.
- Matricula duplicada retorna erro de regra de negocio.
- Turma inativa bloqueia nova matricula.

## 5.2 Desmatricular aluno

- Admin pode desmatricular qualquer aluno.
- Professor pode desmatricular aluno apenas se estiver vinculado a turma.
- Operacao falha quando aluno nao esta matriculado na turma.

## 5.3 Listagens

`GET /api/v1/turmas`:
- admin: todas (com ou sem inativas conforme `includeInactive`);
- professor: somente turmas vinculadas;
- aluno: todas as turmas (comportamento atual do modulo).

`GET /api/v1/turmas/{id}/matriculas`:
- admin ou professor vinculado.

`GET /api/v1/turmas/{id}/matriculas/publico`:
- publico, sem JWT.

`GET /api/v1/aluno/{id}/turmas`:
- admin ou o proprio aluno.

## 6. Contrato de API (estado atual)

## 6.1 Endpoints de aluno

Base path: `/api/v1/aluno`

- `POST /api/v1/aluno` (publico)
- `GET /api/v1/aluno?includeInactive=false` (admin)
- `GET /api/v1/aluno/{id}` (admin ou proprio aluno)
- `PUT /api/v1/aluno/{id}` (admin ou proprio aluno)
- `PATCH /api/v1/aluno/{id}/deactivate` (admin)
- `GET /api/v1/aluno/{id}/turmas?includeInactive=false` (admin ou proprio aluno)

## 6.2 Endpoints de matricula em turma

Base path: `/api/v1/turmas`

- `POST /api/v1/turmas/{id}/matriculas`
- `DELETE /api/v1/turmas/{id}/matriculas/{alunoId}`
- `GET /api/v1/turmas/{id}/matriculas`
- `GET /api/v1/turmas/{id}/matriculas/publico`

## 6.3 Mudanca de contrato relevante

Mudanca aplicada para semantica mais clara:
- de `.../alunos` para `.../matriculas` nos endpoints de vinculo aluno-turma.

Impacto direto no frontend:
- atualizar chamadas antigas para o novo path;
- manter compatibilidade visual com mensagens de negocio retornadas no envelope.

## 7. Seguranca e autorizacao

Matriz resumida:
- `ROLE_ADMIN`: visao e gestao ampla.
- `ROLE_PROFESSOR`: opera turmas vinculadas.
- `ROLE_ALUNO`: consulta turmas e faz auto-matricula.
- publico: consulta `GET /api/v1/turmas/{id}/matriculas/publico`.

Detalhe de seguranca em infraestrutura:
- liberacao explicita em `SecurityConfig` para `GET /api/v1/turmas/*/matriculas/publico`.

## 8. Fluxos de frontend recomendados

## 8.1 Onboarding de aluno

1. chamar `POST /api/v1/aluno`.
2. salvar `token` e `refreshToken` retornados.
3. carregar dashboard usando `GET /api/v1/turmas`.

## 8.2 Auto-matricula de aluno

1. usuario aluno escolhe turma.
2. frontend chama `POST /api/v1/turmas/{id}/matriculas` com `alunoId` do proprio contexto.
3. em sucesso, atualizar tela de turmas do aluno.

## 8.3 Area interna de professor/admin

1. listar alunos da turma via endpoint protegido.
2. executar matricula/desmatricula conforme acao da tela.
3. usar mensagens do backend para feedback imediato.

## 8.4 Pagina publica de turma

1. chamar `GET /api/v1/turmas/{id}/matriculas/publico` sem token.
2. renderizar lista publica com campos de `AlunoResponse`.

## 9. Tratamento de erros e UX

HTTP esperados no modulo:
- 400: payload invalido, turma inativa, aluno ja matriculado, aluno nao matriculado.
- 401: token ausente/expirado/invalido em endpoint protegido.
- 403: operacao sem permissao de papel ou ownership.
- 404: recurso nao encontrado (turma/aluno).
- 409: conflito de integridade.

Recomendacoes para frontend:
- exibir `message` como texto principal;
- exibir `errors[]` quando existir para detalhar campo/regra;
- aplicar retry apenas em cenarios de expiracao de token apos refresh.

## 10. Qualidade e validacao

Cobertura de testes de integracao relevante para a feature:
- `AlunoControllerIntegrationTest`
- `TurmaControllerIntegrationTest`

Cenarios validados:
- auto-matricula de aluno;
- bloqueio de aluno tentando matricular outro aluno;
- listagem de turmas para `ROLE_ALUNO`;
- endpoint publico sem autenticacao;
- fluxos de professor/admin com regras de vinculo.

Rodada de regressao registrada:
- total: 65 testes;
- falhas: 0;
- erros: 0;
- skipped: 0.

## 11. Arquivos centrais da implementacao

API e regra:
- `backend/src/main/java/br/com/ilumina/controller/Aluno/AlunoController.java`
- `backend/src/main/java/br/com/ilumina/controller/Turma/TurmaController.java`
- `backend/src/main/java/br/com/ilumina/service/Aluno/AlunoService.java`
- `backend/src/main/java/br/com/ilumina/service/Turma/TurmaService.java`
- `backend/src/main/java/br/com/ilumina/security/SecurityConfig.java`

Modelo e repositorios:
- `backend/src/main/java/br/com/ilumina/entity/Aluno/Aluno.java`
- `backend/src/main/java/br/com/ilumina/entity/Turma/AlunoTurma.java`
- `backend/src/main/java/br/com/ilumina/repository/Aluno/AlunoRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Turma/AlunoTurmaRepository.java`

Testes:
- `backend/src/test/java/br/com/ilumina/controller/Aluno/AlunoControllerIntegrationTest.java`
- `backend/src/test/java/br/com/ilumina/controller/Turma/TurmaControllerIntegrationTest.java`

## 12. Dependencias e compatibilidade

Dependencias funcionais:
- modulo de autenticacao JWT com claims e refresh token;
- modulo de turma (dominio principal da matricula);
- modulo de professor (vinculo professor-turma para autorizacao).

Compatibilidade:
- frontend deve considerar a mudanca definitiva para `/matriculas`.
- endpoint antigo com `/alunos` nao e o contrato atual da feature.

## 13. Resultado da feature

Feature concluida com sucesso:
- modulo aluno-turma operacional;
- contrato de matricula estabilizado e mais semantico;
- endpoint publico entregue;
- cobertura de testes validada sem regressao.
