# API - Modulo Aluno + Turma (matriculas para frontend)

Data: 2026-04-07  
Versao: v2  
Base paths: `/api/v1/aluno` e `/api/v1/turmas`

## 1. Objetivo

Documentar os endpoints do modulo Aluno + Matricula em Turma no estado atual, com foco em uso no frontend.

Este documento cobre:
- contratos atuais para fluxo de matricula;
- mudancas de rota (`/alunos` -> `/matriculas`);
- endpoint publico para listagem de alunos por turma;
- uso recomendado por perfil (`ADMIN`, `PROFESSOR`, `ALUNO`, publico).

## 2. Mudancas de contrato desta versao

Mudancas importantes para o frontend:
- `POST /api/v1/turmas/{id}/alunos` foi substituido por `POST /api/v1/turmas/{id}/matriculas`.
- `DELETE /api/v1/turmas/{id}/alunos/{alunoId}` foi substituido por `DELETE /api/v1/turmas/{id}/matriculas/{alunoId}`.
- `GET /api/v1/turmas/{id}/alunos` foi substituido por `GET /api/v1/turmas/{id}/matriculas` (protegido).
- novo endpoint publico: `GET /api/v1/turmas/{id}/matriculas/publico`.
- `GET /api/v1/turmas` agora aceita `ROLE_ALUNO`.

## 3. Seguranca e autorizacao

| Endpoint | Autenticacao | Autorizacao | Uso principal no frontend |
|---|---|---|---|
| `POST /api/v1/aluno` | nao obrigatoria | publica | onboarding de aluno |
| `GET /api/v1/turmas` | obrigatoria (JWT) | `ROLE_ADMIN`, `ROLE_PROFESSOR`, `ROLE_ALUNO` | lista de turmas da tela principal |
| `POST /api/v1/turmas/{id}/matriculas` | obrigatoria (JWT) | `ROLE_ADMIN`, `ROLE_PROFESSOR`, `ROLE_ALUNO` (aluno so pode a propria matricula) | acao de matricular |
| `DELETE /api/v1/turmas/{id}/matriculas/{alunoId}` | obrigatoria (JWT) | `ROLE_ADMIN` ou `ROLE_PROFESSOR` vinculado | acao de desmatricular |
| `GET /api/v1/turmas/{id}/matriculas` | obrigatoria (JWT) | `ROLE_ADMIN` ou `ROLE_PROFESSOR` vinculado | painel interno da turma |
| `GET /api/v1/turmas/{id}/matriculas/publico` | nao obrigatoria | publica | pagina publica da turma |
| `GET /api/v1/aluno/{id}/turmas` | obrigatoria (JWT) | `ROLE_ADMIN` ou aluno dono do `id` | tela "minhas turmas" |

Header para endpoints protegidos:

```http
Authorization: Bearer <jwt>
```

## 4. Regras de escopo importantes

### 4.1 `GET /api/v1/turmas`

Comportamento por papel:
- admin: lista todas as turmas (ativas por padrao; todas com `includeInactive=true`);
- professor: lista somente turmas vinculadas ao professor autenticado;
- aluno: lista todas as turmas (ativas por padrao; inclui inativas com `includeInactive=true`).

### 4.2 `POST /api/v1/turmas/{id}/matriculas`

Regras de autorizacao:
- admin pode matricular qualquer aluno;
- professor precisa estar vinculado na turma alvo;
- aluno pode matricular somente ele mesmo (`alunoId` do body precisa ser o proprio aluno autenticado).

### 4.3 `GET /api/v1/aluno/{id}/turmas`

Regras:
- admin pode consultar qualquer aluno;
- aluno so pode consultar as proprias turmas.

## 5. Envelope padrao de resposta

Todas as respostas seguem `ApiResponse<T>`:

```json
{
  "timestamp": "2026-04-07T10:30:00Z",
  "status": 200,
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "path": "/api/v1/turmas"
}
```

## 6. Contratos de dados usados no frontend

## 6.1 `TurmaAlunoVinculoRequest`

Body para matricular aluno:

```json
{
  "alunoId": "<uuid>"
}
```

Regra:
- `alunoId` obrigatorio.

## 6.2 `AlunoResponse` (itens de listagem de alunos)

```json
{
  "id": "<uuid>",
  "userId": "<uuid>",
  "name": "Aluno Um",
  "email": "aluno1@ilumina.com",
  "matricula": "MAT-401",
  "sexo": "Feminino",
  "active": true,
  "createdAt": "2026-04-07T10:30:00Z"
}
```

## 6.3 `TurmaResponse` (itens de listagem de turmas)

```json
{
  "id": "<uuid>",
  "nome": "Turma 1A",
  "ano": 1,
  "turno": "MATUTINO",
  "ensino": "FUNDAMENTAL",
  "qntAlunos": 30,
  "active": true,
  "createdAt": "2026-04-07T10:30:00Z",
  "professores": []
}
```

## 7. Fluxos recomendados para frontend

## 7.1 Cadastro e bootstrap de sessao de aluno

1. chamar `POST /api/v1/aluno`.
2. armazenar `token` e `refreshToken` retornados.
3. usar `roles` para direcionar o app para area de aluno.

Exemplo (fetch):

```javascript
const response = await fetch('/api/v1/aluno', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Aluno E2E',
    email: 'e2e.aluno@ilumina.com',
    password: '123456',
    matricula: 'MAT-E2E',
    sexo: 'Feminino'
  })
});

const payload = await response.json();
const accessToken = payload.data.token;
const refreshToken = payload.data.refreshToken;
```

## 7.2 Listagem de turmas para aluno logado

```javascript
const response = await fetch('/api/v1/turmas?includeInactive=false', {
  headers: { Authorization: `Bearer ${accessToken}` }
});

const payload = await response.json();
const turmas = payload.data;
```

## 7.3 Auto-matricula de aluno

```javascript
await fetch(`/api/v1/turmas/${turmaId}/matriculas`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  },
  body: JSON.stringify({ alunoId: alunoIdLogado })
});
```

## 7.4 Lista publica de alunos da turma (sem login)

```javascript
const response = await fetch(`/api/v1/turmas/${turmaId}/matriculas/publico`);
const payload = await response.json();
const alunos = payload.data;
```

## 7.5 Minhas turmas (aluno)

```javascript
const response = await fetch(`/api/v1/aluno/${alunoIdLogado}/turmas`, {
  headers: { Authorization: `Bearer ${accessToken}` }
});

const payload = await response.json();
const minhasTurmas = payload.data;
```

## 8. Erros esperados e UX sugerida

| HTTP | Causa comum | Acao sugerida no frontend |
|---|---|---|
| 400 | aluno ja matriculado; turma inativa; payload invalido | mostrar mensagem amigavel e manter usuario na tela |
| 401 | token ausente/expirado/invalido | tentar refresh; se falhar, redirecionar para login |
| 403 | usuario sem permissao para aquela acao | bloquear acao e informar falta de permissao |
| 404 | turma/aluno nao encontrado | mostrar estado de "registro nao encontrado" |
| 409 | conflito de integridade | exibir mensagem de conflito e orientar novo input |

## 9. Checklist de migracao frontend

- substituir rotas antigas de turma-aluno para `/matriculas`.
- usar endpoint publico apenas para leitura sem autenticacao.
- manter endpoint protegido `/matriculas` para tela interna (admin/professor).
- validar que aluno so envia o proprio `alunoId` ao matricular.
- garantir fallback de erro por `message` e `errors[]` do envelope.
