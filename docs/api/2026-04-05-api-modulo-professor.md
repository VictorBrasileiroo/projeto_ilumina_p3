# API - Modulo Professor (CRUD inicial)

Data: 2026-04-05  
Versao: v1  
Base path: `/api/v1/professors`

## 1. Objetivo

Documentar os endpoints REST do modulo de Professor no estado atual do backend.

Escopo desta API:
- criar professor
- listar professores
- detalhar professor
- atualizar professor
- desativar professor (logica)

Fora de escopo neste corte:
- relacao com turmas
- relacao com provas
- relacao com colecoes de flashcards
- filtros avancados e paginacao

## 2. Seguranca e autorizacao

Politica atual por endpoint:

| Endpoint | Autenticacao | Autorizacao |
|---|---|---|
| `POST /api/v1/professors` | nao obrigatoria | publica |
| `GET /api/v1/professors` | obrigatoria (JWT) | `ROLE_ADMIN` |
| `GET /api/v1/professors/{id}` | obrigatoria (JWT) | `ROLE_ADMIN` ou proprio professor |
| `PUT /api/v1/professors/{id}` | obrigatoria (JWT) | `ROLE_ADMIN` ou proprio professor |
| `PATCH /api/v1/professors/{id}/deactivate` | obrigatoria (JWT) | `ROLE_ADMIN` |

Header para endpoints protegidos:
```http
Authorization: Bearer <jwt>
```

## 3. Envelope padrao de resposta

Todas as respostas do controller usam `ApiResponse<T>`:

```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "status": 200,
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "path": "/api/v1/professors"
}
```

Em erro:
```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "status": 400,
  "success": false,
  "message": "Erro de validacao.",
  "data": null,
  "errors": ["campo: detalhe"],
  "path": "/api/v1/professors"
}
```

## 4. Contratos de dados

## 4.1 CreateProfessorRequest

```json
{
  "name": "Professora Maria",
  "email": "maria@escola.com",
  "password": "123456",
  "disciplina": "Matematica",
  "sexo": "Feminino"
}
```

Regras:
- `name`: obrigatorio, max 100
- `email`: obrigatorio, formato email, max 100
- `password`: obrigatorio, min 6
- `disciplina`: obrigatorio, max 100
- `sexo`: obrigatorio, max 30

## 4.2 UpdateProfessorRequest

```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "disciplina": "Historia",
  "sexo": "Masculino"
}
```

Regras:
- todos os campos sao opcionais
- se enviados, respeitam os limites de tamanho/formato

## 4.3 ProfessorResponse

```json
{
  "id": "0dd4f8f2-7de9-4c3a-b017-55b7be5d7af3",
  "userId": "8af5c9c6-b6a3-40de-9ed8-1492d7e09b85",
  "name": "Professora Maria",
  "email": "maria@escola.com",
  "disciplina": "Matematica",
  "sexo": "Feminino",
  "active": true,
  "createdAt": "2026-04-05T10:30:00Z"
}
```

## 5. Endpoints

## 5.1 Criar professor

`POST /api/v1/professors`

Body: `CreateProfessorRequest`

Sucesso:
- `201 Created`

Exemplo de resposta (resumo):
```json
{
  "status": 201,
  "success": true,
  "message": "Professor criado com sucesso.",
  "data": {
    "id": "...",
    "userId": "...",
    "name": "Professora Maria",
    "email": "maria@escola.com",
    "disciplina": "Matematica",
    "sexo": "Feminino",
    "active": true,
    "createdAt": "..."
  }
}
```

Erros esperados:
- `400 Bad Request`: validacao de campos
- `409 Conflict`: email ja cadastrado
- `500 Internal Server Error`: erro inesperado

cURL:
```bash
curl -X POST "http://localhost:8080/api/v1/professors" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Professora Maria",
    "email":"maria@escola.com",
    "password":"123456",
    "disciplina":"Matematica",
    "sexo":"Feminino"
  }'
```

## 5.2 Listar professores

`GET /api/v1/professors?includeInactive=false`

Query params:
- `includeInactive` (opcional, default `false`)

Sucesso:
- `200 OK`

Erros esperados:
- `401 Unauthorized`: token ausente/invalido
- `403 Forbidden`: usuario sem `ROLE_ADMIN`

cURL:
```bash
curl -X GET "http://localhost:8080/api/v1/professors?includeInactive=false" \
  -H "Authorization: Bearer <jwt>"
```

## 5.3 Detalhar professor

`GET /api/v1/professors/{id}`

Sucesso:
- `200 OK`

Erros esperados:
- `401 Unauthorized`
- `403 Forbidden` (nao e admin e nao e dono)
- `404 Not Found` (professor nao encontrado)

cURL:
```bash
curl -X GET "http://localhost:8080/api/v1/professors/{id}" \
  -H "Authorization: Bearer <jwt>"
```

## 5.4 Atualizar professor

`PUT /api/v1/professors/{id}`

Body: `UpdateProfessorRequest`

Sucesso:
- `200 OK`

Erros esperados:
- `400 Bad Request` (validacao ou valor vazio enviado)
- `401 Unauthorized`
- `403 Forbidden` (nao e admin e nao e dono)
- `404 Not Found`
- `409 Conflict` (email em uso)

cURL:
```bash
curl -X PUT "http://localhost:8080/api/v1/professors/{id}" \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Novo Nome",
    "disciplina":"Historia"
  }'
```

## 5.5 Desativar professor

`PATCH /api/v1/professors/{id}/deactivate`

Sucesso:
- `200 OK`

Erros esperados:
- `400 Bad Request` (professor ja desativado)
- `401 Unauthorized`
- `403 Forbidden` (nao admin)
- `404 Not Found`

cURL:
```bash
curl -X PATCH "http://localhost:8080/api/v1/professors/{id}/deactivate" \
  -H "Authorization: Bearer <jwt>"
```

## 6. Catalogo de erros (resumo)

| HTTP | Causa comum | Origem |
|---|---|---|
| 400 | erro de validacao ou regra de negocio | `GlobalExceptionHandler` (`MethodArgumentNotValidException`, `BusinessException`, `IllegalArgumentException`) |
| 401 | sem autenticacao para rota protegida | `RestAuthenticationEntryPoint` |
| 403 | sem permissao de acesso | `RestAccessDeniedHandler` / `AccessDeniedException` |
| 404 | professor nao encontrado | `ResourceNotFoundException` |
| 409 | conflito de integridade (email duplicado) | `DataIntegrityViolationException` |
| 500 | erro interno nao mapeado | `Exception` generica |

## 7. Observacoes importantes para frontend

- `POST /api/v1/professors` esta aberto no estado atual.
- Os demais endpoints exigem JWT valido.
- Em qualquer erro, prefira ler `message` e `errors[]` no envelope para exibir feedback na UI.
- Na listagem, use `includeInactive=true` apenas em contexto administrativo.

## 8. Evolucao prevista desta API

Proximos incrementos esperados:
- filtros por nome/disciplina
- paginacao
- relacionamentos de professor com turmas
- uso de `Professor` como referencia em provas e colecoes
