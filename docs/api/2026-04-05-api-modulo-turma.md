# API - Modulo Turma (v1)

Data: 2026-04-05
Versao: v1
Base path: `/api/v1/turmas`

## 1. Objetivo

Documentar os endpoints do modulo Turma no estado atual do backend.

## 2. Seguranca e autorizacao

| Endpoint | Autenticacao | Autorizacao |
|---|---|---|
| `POST /api/v1/turmas` | obrigatoria (JWT) | `ROLE_ADMIN` ou `ROLE_PROFESSOR` |
| `GET /api/v1/turmas` | obrigatoria (JWT) | `ROLE_ADMIN` ou `ROLE_PROFESSOR` (escopo diferente por perfil) |
| `GET /api/v1/turmas/{id}` | obrigatoria (JWT) | `ROLE_ADMIN` ou professor vinculado |
| `PUT /api/v1/turmas/{id}` | obrigatoria (JWT) | `ROLE_ADMIN` ou professor vinculado |
| `PATCH /api/v1/turmas/{id}/deactivate` | obrigatoria (JWT) | `ROLE_ADMIN` ou professor vinculado |
| `POST /api/v1/turmas/{id}/join` | obrigatoria (JWT) | `ROLE_PROFESSOR` |
| `DELETE /api/v1/turmas/{id}/leave` | obrigatoria (JWT) | `ROLE_PROFESSOR` |

Regra de escopo em `GET /api/v1/turmas`:
- admin: lista todas as turmas (ativas por padrao, incluindo inativas com `includeInactive=true`);
- professor: lista apenas turmas vinculadas ao professor autenticado (ativas por padrao, incluindo inativas vinculadas com `includeInactive=true`).

Header para endpoints protegidos:

```http
Authorization: Bearer <jwt>
```

## 3. Envelope padrao

Todas as respostas do modulo Turma usam `ApiResponse<T>`:

```json
{
  "timestamp": "2026-04-05T10:30:00Z",
  "status": 200,
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "path": "/api/v1/turmas"
}
```

## 4. Contratos de request

### 4.1 CreateTurmaRequest

```json
{
  "nome": "1A",
  "ano": 1,
  "turno": "MATUTINO",
  "ensino": "FUNDAMENTAL",
  "qntAlunos": 30
}
```

Regras:
- `nome`: obrigatorio, max 60
- `ano`: obrigatorio, 1..9
- `turno`: obrigatorio, enum fechado
- `ensino`: obrigatorio, enum fechado
- `qntAlunos`: obrigatorio, >= 0

### 4.2 UpdateTurmaRequest

Todos os campos opcionais, com as mesmas regras quando enviados.

### 4.3 TurmaVinculoRequest

```json
{
  "professorId": "<uuid>"
}
```

Uso:
- `POST /api/v1/turmas/{id}/join` usa `TurmaVinculoRequest` no body.

### 4.4 Leave sem body (query param)

`DELETE /api/v1/turmas/{id}/leave?professorId=<uuid>`

Observacao:
- o endpoint de leave nao usa body em `DELETE`; o `professorId` e enviado via query string.

## 5. Contrato de response principal

`TurmaResponse`:

```json
{
  "id": "<uuid>",
  "nome": "1A",
  "ano": 1,
  "turno": "MATUTINO",
  "ensino": "FUNDAMENTAL",
  "qntAlunos": 30,
  "active": true,
  "createdAt": "2026-04-05T10:30:00Z",
  "professores": [
    {
      "id": "<uuid>",
      "name": "Professor Um",
      "email": "prof@ilumina.com",
      "active": true
    }
  ]
}
```

## 6. Catalogo de erros (resumo)

| HTTP | Causa comum |
|---|---|
| 400 | validacao de payload, vinculo duplicado, leave sem vinculo, turma ja inativa, update/join em turma inativa |
| 401 | sem autenticacao |
| 403 | sem permissao por papel, professor tentando operar com `professorId` diferente do autenticado, ou sem vinculo exigido |
| 404 | turma ou professor nao encontrado |
| 409 | conflito de integridade de dados |
| 500 | erro interno nao mapeado |
