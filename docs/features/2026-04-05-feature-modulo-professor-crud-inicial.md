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

Esse corte foi pensado para destravar o dominio de professor sem acoplar, neste momento, com turmas, alunos, provas ou colecoes de flashcards.

## 2. Escopo atual e fora de escopo

### 2.1 Escopo atual

- Modelagem de `Professor` como perfil 1:1 de `User`.
- Cadastro transacional (`User` + `Professor`).
- Endpoints REST de CRUD inicial em `/api/v1/professors`.
- Controle de acesso por papel para leitura/edicao/desativacao.
- Padrao de resposta com `ApiResponse`.
- Tratamento de erros esperado para 400/401/403/404/409.

### 2.2 Fora de escopo

- Relacao professor-turma (N:N).
- Relacao professor-provas.
- Relacao professor-colecoes de flashcards.
- Filtros avancados de busca (nome/disciplina em query dedicada).
- Paginacao da listagem.

## 3. Modelo de dados atual da feature

### 3.1 Entidades envolvidas

`User` (identidade/autenticacao):
- `id`
- `name`
- `email` (unico)
- `password` (hash)
- `active`
- `roles`

`Professor` (perfil de dominio):
- `id`
- `user_id` (FK unica para `users`)
- `disciplina`
- `sexo`

### 3.2 Relacionamento atual

- `users (1) <-> (0..1) professores`

### 3.3 Invariantes praticas

- Professor nao duplica credenciais (email/senha ficam em `User`).
- Todo professor criado recebe `ROLE_PROFESSOR` no `User`.
- Desativacao e logica (`user.active = false`).

## 4. Arquitetura da feature

Arquivos principais:
- `backend/src/main/java/br/com/ilumina/entity/Professor/Professor.java`
- `backend/src/main/java/br/com/ilumina/repository/Professor/ProfessorRepository.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/CreateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/UpdateProfessorRequest.java`
- `backend/src/main/java/br/com/ilumina/dto/professor/ProfessorResponse.java`
- `backend/src/main/java/br/com/ilumina/service/Professor/ProfessorService.java`
- `backend/src/main/java/br/com/ilumina/controller/Professor/ProfessorController.java`

Fluxo arquitetural:
1. Controller recebe a requisicao e valida DTO.
2. Service aplica regra de negocio e autorizacao contextual (owner/admin).
3. Repository persiste/consulta `User` e `Professor`.
4. Response retorna envelope `ApiResponse`.

## 5. Endpoints, contratos e erros esperados

Base path: `/api/v1/professors`

## 5.1 Envelope padrao de resposta

Sucesso:
```json
{
  "timestamp": "2026-04-05T12:00:00Z",
  "status": 200,
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "path": "/api/v1/professors"
}
```

Erro:
```json
{
  "timestamp": "2026-04-05T12:00:00Z",
  "status": 400,
  "success": false,
  "message": "Erro de validacao.",
  "data": null,
  "errors": ["campo: mensagem"],
  "path": "/api/v1/professors"
}
```

## 5.2 POST /api/v1/professors

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

## 5.3 GET /api/v1/professors?includeInactive=false

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

## 5.4 GET /api/v1/professors/{id}

Objetivo: detalhar professor.

Autorizacao:
- `ROLE_ADMIN` ou `ROLE_PROFESSOR` dono do proprio perfil

Sucesso:
- `200 OK`

Erros esperados:
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> professor tentando acessar outro perfil
- `404 Not Found` -> professor inexistente

## 5.5 PUT /api/v1/professors/{id}

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
- `400 Bad Request` -> campos invalidos/vazios quando enviados
- `401 Unauthorized` -> sem token
- `403 Forbidden` -> tentativa de editar terceiro
- `404 Not Found` -> professor inexistente
- `409 Conflict` -> email em uso

## 5.6 PATCH /api/v1/professors/{id}/deactivate

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

## 6. Como usar no frontend

## 6.1 Fluxo recomendado para a UI

Fluxo de cadastro de professor:
1. Tela de cadastro envia `POST /api/v1/professors` com JSON.
2. Em sucesso (`201`), redireciona para login ou painel.
3. Em erro (`400`/`409`), exibe mensagens de `errors[]`.

Fluxo de administracao:
1. Admin autentica e obtem token.
2. Front salva token (ex.: memory storage ou storage protegido da aplicacao).
3. Front envia `Authorization: Bearer <token>` para listar/detalhar/editar/desativar.

## 6.2 Exemplo com Axios

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function createProfessor(payload: {
  name: string;
  email: string;
  password: string;
  disciplina: string;
  sexo: string;
}) {
  const { data } = await api.post("/professors", payload);
  return data;
}

export async function listProfessors(token: string, includeInactive = false) {
  const { data } = await api.get("/professors", {
    params: { includeInactive },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function updateProfessor(token: string, id: string, payload: {
  name?: string;
  email?: string;
  disciplina?: string;
  sexo?: string;
}) {
  const { data } = await api.put(`/professors/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function deactivateProfessor(token: string, id: string) {
  const { data } = await api.patch(`/professors/${id}/deactivate`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}
```

## 6.3 Mapeamento de erro para UX

- `400`: erro de validacao -> destacar campos e mostrar mensagens.
- `401`: usuario nao autenticado -> redirecionar para login.
- `403`: sem permissao -> exibir alerta de acesso negado.
- `404`: recurso nao encontrado -> tela de nao encontrado.
- `409`: conflito de email -> mensagem clara para troca de email.
- `500`: erro interno -> fallback generico e opcao de tentar novamente.

## 7. Estado atual da feature x evolucao futura

Estado atual:
- modulo funcional e testado no backend
- sem relacionamentos com turmas/alunos/provas/flashcards

Evolucao planejada:
- associacao professor-turma (N:N)
- uso de `Professor` como referencia de dominio em provas/colecoes
- filtros de busca por nome/disciplina e paginacao
- eventual revisao da politica de criacao publica, caso o produto exija cadastro restrito

## 8. Validacao e testes da feature

Arquivo de testes de integracao:
- `backend/src/test/java/br/com/ilumina/controller/Professor/ProfessorControllerIntegrationTest.java`

Cenarios cobertos:
- criacao sem autenticacao
- conflito de email
- listagem de ativos/inativos
- acesso por dono/admin
- bloqueio de edicao de terceiro
- desativacao e tentativa de login apos desativacao
- validacoes e nao encontrado
