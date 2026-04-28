# Estado Atual do Sistema - Modulo Aluno e Matriculas em Turma

Data da varredura: 2026-04-07  
Escopo analisado: backend e documentacao tecnica

## 1. Resumo executivo

O backend agora possui o recorte funcional de Aluno + relacao AlunoTurma em producao no codigo:
- perfil de aluno com identidade separada (`User` + `Aluno`);
- matricula de aluno em turma via entidade associativa explicita (`AlunoTurma`);
- leitura protegida de alunos da turma para equipe interna;
- leitura publica de alunos da turma para consumo sem autenticacao;
- listagem de turmas aberta tambem para `ROLE_ALUNO`.

Este estado complementa os modulos ja existentes de Auth JWT, Professor e Turma.

## 2. Estrutura funcional atual por dominio

## 2.1 Identidade e acesso

Entidades base:
- `User`
- `UserRole`

Capacidades:
- login/register/refresh;
- access token + refresh token;
- claims com contexto de perfil (`userId`, `roles`, `professorId`, `alunoId` quando existir).

## 2.2 Perfil Aluno

Entidade:
- `Aluno` com relacao 1:1 para `User` (`user_id` unico) e `matricula` unica.

Capacidades expostas:
- criar aluno (`POST /api/v1/aluno`);
- listar/detalhar/editar/desativar aluno (regras por papel);
- listar turmas de um aluno (`GET /api/v1/aluno/{id}/turmas`).

## 2.3 Dominio Turma e Matricula

Entidades:
- `Turma`
- `ProfTurma`
- `AlunoTurma`

Modelagem da matricula:
- tabela associativa `aluno_turma`;
- restricao de unicidade por par (`aluno_id`, `turma_id`) para impedir duplicidade.

Capacidades de matricula:
- matricular aluno em turma (`POST /api/v1/turmas/{id}/matriculas`);
- desmatricular (`DELETE /api/v1/turmas/{id}/matriculas/{alunoId}`);
- listar alunos da turma (protegido): `GET /api/v1/turmas/{id}/matriculas`;
- listar alunos da turma (publico): `GET /api/v1/turmas/{id}/matriculas/publico`.

## 3. Arquitetura em camadas (estado real)

Controllers impactados:
- `AlunoController`
- `TurmaController`

Services impactados:
- `AlunoService`
- `TurmaService`

Repositories impactados:
- `AlunoRepository`
- `AlunoTurmaRepository`
- `TurmaRepository`
- `ProfTurmaRepository`

Security:
- `SecurityConfig` com excecao publica para `GET /api/v1/turmas/*/matriculas/publico`.
- autorizacao fina por metodo via `@PreAuthorize`.

## 4. Regras de autorizacao consolidadas do modulo

`GET /api/v1/turmas`:
- `ROLE_ADMIN`, `ROLE_PROFESSOR`, `ROLE_ALUNO`.

`POST /api/v1/turmas/{id}/matriculas`:
- `ROLE_ADMIN`: pode matricular qualquer aluno;
- `ROLE_PROFESSOR`: precisa estar vinculado na turma;
- `ROLE_ALUNO`: so pode matricular o proprio aluno autenticado.

`GET /api/v1/turmas/{id}/matriculas`:
- `ROLE_ADMIN` ou professor vinculado.

`GET /api/v1/turmas/{id}/matriculas/publico`:
- publico (sem JWT).

`GET /api/v1/aluno/{id}/turmas`:
- `ROLE_ADMIN` ou o proprio aluno.

## 5. Fluxos arquiteturais principais

## 5.1 Auto-matricula de aluno

1. frontend autentica aluno e obtem `alunoId` por claim/response.
2. frontend chama `POST /api/v1/turmas/{id}/matriculas` com `{ alunoId }`.
3. service valida que `alunoId` informado e do aluno autenticado.
4. service verifica duplicidade e cria `AlunoTurma`.

## 5.2 Matricula por professor/admin

1. professor/admin chama endpoint de matricula.
2. se professor, service valida vinculo professor-turma.
3. service valida existencia de aluno e turma ativa.
4. grava associacao em `aluno_turma`.

## 5.3 Consulta publica de alunos da turma

1. cliente sem autenticacao chama endpoint publico.
2. controller consulta service sem contexto de usuario.
3. service valida existencia da turma e retorna lista ordenada de alunos.

## 6. Impacto no frontend

A arquitetura atual permite tres frentes de consumo:
- area autenticada de aluno: listar turmas e auto-matricula;
- area interna de professor/admin: gestao de matriculas e lista protegida de alunos;
- pagina publica de vitrine da turma: lista publica de alunos matriculados.

Observacao de compatibilidade:
- rotas antigas baseadas em `/alunos` para matricula foram substituidas por `/matriculas`.

## 7. Qualidade e validacao

Evidencia de regressao na rodada mais recente:
- total: 65 testes;
- falhas: 0;
- erros: 0;
- skipped: 0.

Suites relevantes:
- AlunoControllerIntegrationTest;
- TurmaControllerIntegrationTest;
- ProfessorControllerIntegrationTest;
- IluminaBackendApplicationTests.

## 8. Riscos e proximos passos arquiteturais

- alinhar toda documentacao antiga de API para evitar drift de contrato;
- evoluir paginacao/filtros de listagens de aluno e turma;
- definir limites de exposicao da listagem publica (cache, rate limit, campos sensiveis);
- consolidar guideline de frontend para consumo dos novos endpoints de matricula.
