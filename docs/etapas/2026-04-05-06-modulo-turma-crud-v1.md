# Etapa: Modulo Turma (CRUD v1 + vinculo professor)

Data: 2026-04-05
Ordem: 06
Contexto: abertura do dominio Turma no backend

## 1. Objetivo da etapa

Entregar o recorte v1 do modulo Turma com CRUD inicial, desativacao logica, vinculo N:N com Professor e testes de integracao.

## 2. Arquivos criados

### 2.1 Dominio e persistencia

- `backend/src/main/java/br/com/ilumina/entity/Turma/Turno.java`
- `backend/src/main/java/br/com/ilumina/entity/Turma/Ensino.java`
- `backend/src/main/java/br/com/ilumina/entity/Turma/Turma.java`
- `backend/src/main/java/br/com/ilumina/entity/Turma/ProfTurma.java`
- `backend/src/main/java/br/com/ilumina/repository/Turma/TurmaRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Turma/ProfTurmaRepository.java`

### 2.2 DTOs

- `backend/src/main/java/br/com/ilumina/dto/turma/CreateTurmaRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/turma/UpdateTurmaRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/turma/TurmaResponse.java`
- `backend/src/main/java/br/com/ilumina/dto/turma/TurmaProfessorResponse.java`
- `backend/src/main/java/br/com/ilumina/dto/turma/TurmaVinculoRequest.java`

### 2.3 Regra de negocio e API

- `backend/src/main/java/br/com/ilumina/service/Turma/TurmaService.java`
- `backend/src/main/java/br/com/ilumina/controller/Turma/TurmaController.java`

### 2.4 Testes

- `backend/src/test/java/br/com/ilumina/controller/Turma/TurmaControllerIntegrationTest.java`

### 2.5 Documentacao

- `docs/features/2026-04-05-feature-modulo-turma-crud-v1.md`
- `docs/api/2026-04-05-api-modulo-turma.md`

## 3. Arquivos alterados

- `backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java`
  - adicionado handler de `HttpMessageNotReadableException` para retornar 400 em payloads invalidos (ex.: enum invalido).

## 4. Resultado funcional da etapa

- Criacao de turma por admin/professor.
- Auto-vinculo do professor autenticado ao criar turma.
- Listagem com `includeInactive`:
  - admin ve todas as turmas;
  - professor ve apenas turmas vinculadas.
- Detalhe, atualizacao e desativacao com regra admin ou professor vinculado.
- `update` bloqueado para turma inativa.
- Join/leave com dupla validacao por professor autenticado + professorId alvo.
- `join` bloqueado para turma inativa.
- `leave` com `professorId` via query param (sem body em `DELETE`).
- Turma pode ficar sem professor apos leave.
- Turma desativada permanece persistida (`active=false`).

## 5. Validacao da etapa

- Suite Maven executada com sucesso.
- Testes antigos de Professor permaneceram verdes.
- Nova suite de Turma validando cenarios de sucesso e erro.

Resultado mais recente apos correcoes de review:
- `Tests run: 38, Failures: 0, Errors: 0, Skipped: 0`.
