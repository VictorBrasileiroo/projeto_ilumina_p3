# Etapa: Modulo Professor (CRUD inicial)

Data: 2026-04-05  
Ordem: 04  
Contexto: implementacao do primeiro corte funcional de professor no backend

## 1. Objetivo da etapa

Entregar o CRUD inicial de professor, alinhado ao modelo `User` (identidade) + `Professor` (perfil), sem implementar relacionamentos com turmas, alunos, provas ou flashcards nesta rodada.

## 2. Arquivos criados

### 2.1 Dominio e persistencia

- `backend/src/main/java/br/com/ilumina/entity/Professor/Professor.java`
- `backend/src/main/java/br/com/ilumina/repository/Professor/ProfessorRepository.java`

Resultado:
- entidade `Professor` com `@OneToOne` para `User` via `user_id` unico;
- consultas para listagem geral e listagem de ativos.

### 2.2 DTOs do modulo

- `backend/src/main/java/br/com/ilumina/dto/professor/CreateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/UpdateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/ProfessorResponse.java`

Resultado:
- contratos de entrada e saida dedicados ao modulo professor;
- validacoes declarativas de campos obrigatorios e limites.

### 2.3 Regra de negocio

- `backend/src/main/java/br/com/ilumina/service/Professor/ProfessorService.java`

Resultado:
- criacao transacional de `User + Professor`;
- validacao de unicidade de email;
- update segmentado (identidade e perfil);
- desativacao logica com protecao para ja inativo;
- regra de acesso para owner/admin em leitura e edicao.

### 2.4 API REST

- `backend/src/main/java/br/com/ilumina/controller/Professor/ProfessorController.java`

Resultado:
- endpoints expostos em `/api/v1/professor` para criar/listar/detalhar/editar/desativar;
- respostas padronizadas com `ApiResponse`.

## 3. Arquivos alterados

### 3.1 Seguranca

- `backend/src/main/java/br/com/ilumina/security/SecurityConfig.java`

Alteracao:
- `POST /api/v1/professor` liberado sem autenticacao para simplificar onboarding inicial.

### 3.2 Tratamento global de erro

- `backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java`

Alteracoes:
- handler especifico para `AccessDeniedException` (403);
- handler especifico para `DataIntegrityViolationException` (409).

### 3.3 Ambiente de teste

- `backend/pom.xml` (dependencia H2 em teste)
- `backend/src/test/resources/application-test.yml`
- `backend/src/test/java/br/com/ilumina/IluminaBackendApplicationTests.java`

Resultado:
- testes executaveis sem dependencia de PostgreSQL externo.

## 4. Testes de integracao adicionados

Arquivo:
- `backend/src/test/java/br/com/ilumina/controller/Professor/ProfessorControllerIntegrationTest.java`

Cenarios cobertos:
- criacao sem autenticacao;
- conflito de email duplicado;
- listagem de ativos e com inativos;
- acesso por owner/admin;
- bloqueio de edicao de terceiro;
- desativacao e bloqueio de login subsequente;
- desativacao de ja inativo;
- validacao de payload invalido;
- recurso inexistente.

## 5. Comportamento funcional consolidado

Criacao:
- cria `User` com `ROLE_PROFESSOR` e `active=true`
- cria `Professor` vinculado
- retorna `201`

Consulta:
- listagem por admin
- detalhe por admin ou proprio professor

Edicao:
- admin ou proprio professor
- valida conflito de email

Desativacao:
- admin
- seta `active=false`
- se ja inativo, retorna regra de negocio (400)

## 6. Decisoes e observacoes importantes da etapa

- A modelagem 1:1 `User` x `Professor` foi mantida conforme decisao arquitetural.
- O modulo ficou intencionalmente sem relacoes com outras tabelas de dominio neste corte.
- A abertura de cadastro sem autenticacao e uma simplificacao operacional; precisa de validacao de politica final para ambiente de producao.

## 7. Resultado da etapa

Etapa concluida tecnicamente para o objetivo desta rodada:
- modulo de professor operacional no backend;
- contratos e erros padronizados;
- cobertura de testes automatizados para o fluxo principal e cenarios de borda.
