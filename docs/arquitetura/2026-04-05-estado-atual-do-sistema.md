# Estado Atual do Sistema - Ilumina

Data da varredura: 2026-04-05  
Escopo analisado: backend e documentacao tecnica

## 1. Resumo executivo

O sistema agora possui, alem do modulo de autenticacao JWT e health check, os modulos iniciais de Professor e Turma em producao no backend.

No estado atual:
- o cadastro de professor esta funcional e transacional (cria `User` + `Professor`);
- a leitura/edicao/desativacao seguem controle de acesso por papel e ownership;
- a desativacao e logica (`user.active=false`), preservando historico de perfil;
- o modulo de turma possui CRUD inicial, desativacao logica e vinculo N:N professor-turma via entidade explicita;
- ainda nao existem relacionamentos funcionais com alunos, provas ou flashcards.

## 2. Estrutura atual do repositorio

- `backend/`: API Spring Boot (modulos de Auth, Health, Professor e Turma).
- `frontend/`: sem implementacao de codigo consolidada (README inicial).
- `docs/`: arquitetura, etapas, guias e features.

## 3. Stack tecnica consolidada (backend)

- Java 21
- Spring Boot 3.5.12
- Spring Security + JWT (JJWT)
- Spring Data JPA + Hibernate
- PostgreSQL (dev)
- H2 para testes
- Swagger/OpenAPI + Actuator

## 4. Dominios implementados ate agora

## 4.1 Identidade e acesso

Entidades:
- `User`
- `UserRole`

Capacidades:
- cadastro/login/refresh
- emissao de access token + refresh token
- claims JWT com contexto de perfil (`userId`, `roles`, `professorId`, `alunoId` quando existir)
- carga de roles padrao (`ROLE_ADMIN`, `ROLE_PROFESSOR`, `ROLE_ALUNO`)

## 4.2 Perfil Professor (primeiro corte)

Entidade:
- `Professor` com relacao 1:1 para `User` via `user_id` unico

Campos do perfil:
- `disciplina`
- `sexo`

Capacidades:
- criar
- listar
- detalhar
- editar
- desativar

## 4.3 Modulo Turma (primeiro corte)

Entidades:
- `Turma`
- `ProfTurma` (pivot explicita para relacionamento N:N professor-turma)

Campos principais de turma:
- `nome`
- `ano` (1..9)
- `turno` (`MATUTINO`, `VESPERTINO`, `NOTURNO`)
- `ensino` (`INFANTIL`, `FUNDAMENTAL`, `MEDIO`, `SUPERIOR`)
- `qntAlunos` (>= 0)
- `active`

Capacidades:
- criar (admin/professor)
- listar (admin: todas; professor: apenas vinculadas)
- detalhar (admin ou professor vinculado)
- editar (admin ou professor vinculado; bloqueada se turma inativa)
- desativar (admin ou professor vinculado)
- join/leave de professor (com dupla validacao por professor autenticado + professorId alvo)

## 5. Arquitetura em camadas (estado real)

Controller:
- `AuthController`
- `HealthController`
- `ProfessorController`
- `TurmaController`

Service:
- `AuthSeervice`
- `ProfessorService`
- `TurmaService`
- `DataInitializerRole`

Repository:
- `UserRepository`
- `RoleRepository`
- `ProfessorRepository`
- `TurmaRepository`
- `ProfTurmaRepository`

Security:
- `SecurityConfig`
- `JwtAuthenticationFilter`
- `JwtTokenService`
- `CustomUserDetailsService`
- handlers 401/403

Observacoes de seguranca JWT:
- rotas protegidas aceitam somente access token;
- refresh token e exclusivo para renovacao em `/api/v1/auth/refresh`;
- expiracao e configuravel por `jwt.expiration` (access) e `jwt.refresh-expiration` (refresh).

Exception:
- `GlobalExceptionHandler` com mapeamento para 400/401/403/404/409/500

## 6. Contrato de seguranca atual

Rotas publicas principais:
- `/api/v1/auth/**`
- `/api/v1/health/**`
- `POST /api/v1/professor` (cadastro publico do primeiro corte)

Contratos de autenticacao (estado atual):
- login/register/create professor retornam `token` + `refreshToken`;
- `POST /api/v1/auth/refresh` retorna novos tokens (rotacao de sessao).

Rotas protegidas do modulo professor:
- `GET /api/v1/professor` -> admin
- `GET /api/v1/professor/{id}` -> admin ou proprio professor
- `PUT /api/v1/professor/{id}` -> admin ou proprio professor
- `PATCH /api/v1/professor/{id}/deactivate` -> admin

Rotas protegidas do modulo turma:
- `POST /api/v1/turmas` -> admin/professor
- `GET /api/v1/turmas` -> admin/professor (escopo por perfil)
- `GET /api/v1/turmas/{id}` -> admin ou professor vinculado
- `PUT /api/v1/turmas/{id}` -> admin ou professor vinculado
- `PATCH /api/v1/turmas/{id}/deactivate` -> admin ou professor vinculado
- `POST /api/v1/turmas/{id}/join` -> professor
- `DELETE /api/v1/turmas/{id}/leave?professorId=<uuid>` -> professor

## 7. Persistencia e estado dos dados

Modelo ativo para professor:
- `users` (identidade + credenciais)
- `professores` (perfil funcional)
- `users_roles` (associacao N:N de papeis)

Modelo ativo para turmas:
- `turmas` (dominio da turma com estado logico)
- `prof_turma` (associacao N:N professor-turma com constraint de unicidade)

Sem acoplamentos implementados no momento:
- professor <-> provas
- professor <-> colecoes
- turma <-> alunos
- turma <-> provas

## 8. Qualidade e testes

Base de teste atual:
- profile de teste com H2
- teste de contexto da aplicacao
- testes de integracao do modulo professor cobrindo cenarios de sucesso e erro
- testes de integracao do modulo turma cobrindo sucesso, validacoes, autorizacao e fluxo de vinculo

Estado observado:
- suite executando com sucesso na rodada mais recente de validacao (`38` testes)

## 9. Decisoes arquiteturais aplicadas

Mantidas:
- separacao identidade (`User`) x perfil de dominio (`Professor`)
- desativacao logica
- criacao atomica em transacao unica

Divergencia operacional atual:
- criacao de professor foi aberta sem autenticacao para simplificar onboarding inicial

## 10. Proximos pontos arquiteturais recomendados

- Definir politica final de criacao de professor (publica x restrita por ambiente).
- Iniciar modulo de relacionamento aluno-turma.
- Evoluir listagem de professor com filtros e paginacao.
- Evoluir listagem de turmas com filtros e paginacao.
- Introduzir estrategia de revogacao de refresh token (blacklist/versionamento) para cenarios de logout forcado.
