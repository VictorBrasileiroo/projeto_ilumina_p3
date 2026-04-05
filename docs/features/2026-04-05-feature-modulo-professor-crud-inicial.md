# Feature: Modulo Professor (CRUD inicial)

Data: 2026-04-05  
Status: implementado (primeiro corte)  
Escopo: backend API

## 1. Objetivo da feature

Entregar o primeiro corte funcional do modulo de Professor no backend, com operacoes de:
- criar professor
- listar professores
- detalhar professor
- atualizar professor
- desativar professor (exclusao logica)

Esse corte foi planejado para destravar o dominio de professor sem acoplar, neste momento, com turmas, alunos, provas ou colecoes de flashcards.

## 2. Escopo atual e fora de escopo

### 2.1 Escopo atual

- Modelagem de `Professor` como perfil 1:1 de `User`.
- Cadastro transacional (`User` + `Professor`).
- Endpoints REST para CRUD inicial em base path `/api/v1/professor`.
- Controle de acesso por papel para leitura, edicao e desativacao.
- Padrao de resposta com `ApiResponse`.

### 2.2 Fora de escopo

- Relacao professor-turma (N:N).
- Relacao professor-provas.
- Relacao professor-colecoes de flashcards.
- Filtros avancados de busca (nome/disciplina em endpoint dedicado).
- Paginacao da listagem.

## 3. Modelo de dados atual da feature

### 3.1 Entidades envolvidas

`User` (identidade/autenticacao):
- `id`
- `name`
- `email` (unico)
- `password` (hash)
- `active`

`Professor` (perfil de dominio):
- `id`
- `user_id` (unico)
- `disciplina`
- `sexo`

### 3.2 Relacionamento atual

- `User` 1:1 `Professor`.
- `Professor` depende de `User` para identidade, credenciais e roles.

### 3.3 Invariantes praticas

- Todo professor criado recebe `ROLE_PROFESSOR` no `User`.
- Desativacao e logica (`user.active = false`).
- Unicidade de email e aplicada no fluxo de criacao/edicao.

## 4. Camadas e principais arquivos

- `backend/src/main/java/br/com/ilumina/entity/Professor/Professor.java`
- `backend/src/main/java/br/com/ilumina/repository/Professor/ProfessorRepository.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/CreateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/UpdateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/ProfessorResponse.java`
- `backend/src/main/java/br/com/ilumina/service/Professor/ProfessorService.java`
- `backend/src/main/java/br/com/ilumina/controller/Professor/ProfessorController.java`

## 5. Contrato funcional dos endpoints

Base path: `/api/v1/professor`

## 5.1 POST /api/v1/professor

Objetivo: criar professor.

Autenticacao no estado atual:
- aberta (sem token), por regra explicita em `SecurityConfig`.

Body (`CreateProfessorRequest`):
```json
{
  "name": "Professora Maria",
  "email": "maria@escola.com",
  "password": "123456",
  "disciplina": "Matematica",
  "sexo": "Feminino"
}
```

Sucesso:
- `201 Created`

Erros esperados:
- `400 Bad Request` -> campos invalidos
- `409 Conflict` -> email ja cadastrado
- `500 Internal Server Error` -> falha inesperada

## 5.2 GET /api/v1/professor?includeInactive=false

Objetivo: listar professores.

Autorizacao:
- `ROLE_ADMIN`

Comportamento:
- por padrao, retorna apenas ativos (`includeInactive=false`)
- com `includeInactive=true`, inclui inativos

Sucesso:
- `200 OK`

Erros esperados:
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> token sem papel ADMIN

## 5.3 GET /api/v1/professor/{id}

Objetivo: detalhar professor.

Autorizacao:
- `ROLE_ADMIN` ou `ROLE_PROFESSOR` dono do proprio perfil

Sucesso:
- `200 OK`

Erros esperados:
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> professor tentando acessar outro perfil
- `404 Not Found` -> professor inexistente

## 5.4 PUT /api/v1/professor/{id}

Objetivo: atualizar dados de identidade e perfil.

Autorizacao:
- `ROLE_ADMIN` ou `ROLE_PROFESSOR` dono do proprio perfil

Body (`UpdateProfessorRequest`, todos opcionais):
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "disciplina": "Historia",
  "sexo": "Masculino"
}
```

Sucesso:
- `200 OK`

Erros esperados:
- `400 Bad Request` -> campos invalidos ou vazios quando enviados
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> tentativa de editar terceiro
- `404 Not Found` -> professor inexistente
- `409 Conflict` -> email em uso

## 5.5 PATCH /api/v1/professor/{id}/deactivate

Objetivo: desativar professor (setar `user.active=false`).

Autorizacao:
- `ROLE_ADMIN`

Sucesso:
- `200 OK`

Erros esperados:
- `400 Bad Request` -> professor ja desativado
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> papel sem permissao
- `404 Not Found` -> professor inexistente

## 6. Fluxo de uso no frontend

Fluxo de cadastro de professor:
1. Tela de cadastro envia `POST /api/v1/professor` com JSON.
2. Em sucesso (`201`), redireciona para login ou painel.
3. Em erro (`400`/`409`), exibe mensagens de `errors[]`.

Fluxo de administracao:
1. Admin autentica e obtem token.
2. Front salva token conforme politica da aplicacao.
3. Front envia `Authorization: Bearer <token>` para listar, detalhar, editar e desativar.

## 7. Estado de qualidade

- Testes de integracao do modulo professor cobrindo cenarios de sucesso, erro de validacao, conflitos e autorizacao.
- Ambiente de teste baseado em H2 para execucao isolada do PostgreSQL.

## 8. Evolucao prevista

- Filtros por nome/disciplina.
- Paginacao na listagem.
- Relacionamento professor-turma.
- Integracao com modulo de provas e colecoes.