# Estado Atual do Sistema - Ilumina

Data da varredura: 2026-04-05  
Escopo analisado: backend e documentacao tecnica

## 1. Resumo executivo

O sistema agora possui, alem do modulo de autenticacao JWT e health check, um modulo inicial de Professor em producao no backend.

No estado atual:
- o cadastro de professor esta funcional e transacional (cria `User` + `Professor`);
- a leitura/edicao/desativacao seguem controle de acesso por papel e ownership;
- a desativacao e logica (`user.active=false`), preservando historico de perfil;
- ainda nao existem relacionamentos funcionais com turmas, alunos, provas ou flashcards.

## 2. Estrutura atual do repositorio

- `backend/`: API Spring Boot (modulos de Auth, Health e Professor).
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

## 5. Arquitetura em camadas (estado real)

Controller:
- `AuthController`
- `HealthController`
- `ProfessorController`

Service:
- `AuthSeervice`
- `ProfessorService`
- `DataInitializerRole`

Repository:
- `UserRepository`
- `RoleRepository`
- `ProfessorRepository`

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

## 7. Persistencia e estado dos dados

Modelo ativo para professor:
- `users` (identidade + credenciais)
- `professores` (perfil funcional)
- `users_roles` (associacao N:N de papeis)

Sem acoplamentos implementados no momento:
- professor <-> turma
- professor <-> provas
- professor <-> colecoes

## 8. Qualidade e testes

Base de teste atual:
- profile de teste com H2
- teste de contexto da aplicacao
- testes de integracao do modulo professor cobrindo cenarios de sucesso e erro

Estado observado:
- suite executando com sucesso na rodada mais recente de validacao

## 9. Decisoes arquiteturais aplicadas

Mantidas:
- separacao identidade (`User`) x perfil de dominio (`Professor`)
- desativacao logica
- criacao atomica em transacao unica

Divergencia operacional atual:
- criacao de professor foi aberta sem autenticacao para simplificar onboarding inicial

## 10. Proximos pontos arquiteturais recomendados

- Definir politica final de criacao de professor (publica x restrita por ambiente).
- Iniciar modulo de relacionamento com turmas (N:N) usando `Professor` como entidade de dominio.
- Evoluir listagem de professor com filtros e paginacao.
- Introduzir estrategia de revogacao de refresh token (blacklist/versionamento) para cenarios de logout forcado.
