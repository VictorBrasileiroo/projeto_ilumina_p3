# API - Modulo Flashcards (Guia Unificado para Integracao Frontend)

Data: 2026-04-20
Versao: v1
Escopo: BLOCO 2 e BLOCO 3 concluidos (professor/admin) + base BLOCO 4 (aluno)

---

## 1. Objetivo

Este documento e a referencia principal para integracao frontend com o modulo Flashcards.

Cobertura atual:
- contratos de request/response dos endpoints de professor/admin;
- endpoint de geracao via LLM (`/gerar-flashcards`);
- regras de validacao com impacto em formulario e UX;
- semantica de erros relevantes (`400/401/403/404/429/503`);
- direcao de evolucao para BLOCO 4 (aluno).

Este arquivo e unico e evolutivo. Novas entregas do modulo devem atualizar este mesmo documento.

---

## 2. Convencoes de integracao

### 2.1 Base URLs

- Professor/Admin (implementado): `/api/v1/colecoes`
- Aluno/Admin (planejado para BLOCO 4): `/api/v1/aluno/colecoes`

### 2.2 Headers obrigatorios

```http
Authorization: Bearer <jwt>
Content-Type: application/json
Accept: application/json
```

### 2.3 Autorizacao por role

- Fluxo professor/admin: `ROLE_PROFESSOR` ou `ROLE_ADMIN`
- Fluxo aluno/admin (BLOCO 4): `ROLE_ALUNO` ou `ROLE_ADMIN`

### 2.4 Envelope padrao

Sucesso (exceto `204 No Content`):

```json
{
  "timestamp": "2026-04-20T10:00:00Z",
  "status": 200,
  "success": true,
  "message": "Colecoes listadas com sucesso.",
  "data": [],
  "errors": null,
  "path": "/api/v1/colecoes"
}
```

Erro:

```json
{
  "timestamp": "2026-04-20T10:01:00Z",
  "status": 400,
  "success": false,
  "message": "Erro de validacao.",
  "data": null,
  "errors": [
    "titulo: O titulo e obrigatorio."
  ],
  "path": "/api/v1/colecoes"
}
```

### 2.5 Formatos e tipos

- IDs: UUID string
- Datas: OffsetDateTime (ISO-8601)
- Status da colecao: `RASCUNHO` ou `PUBLICADA`
- `qntCards`: metadado opcional de planejamento

### 2.6 Endpoints com 204

- `DELETE /api/v1/colecoes/{id}`
- `DELETE /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}`

---

## 3. Catalogo rapido de endpoints (BLOCOS 2 e 3)

| Metodo | Path | Sucesso | Data retornado |
|---|---|---|---|
| POST | `/api/v1/colecoes` | 201 | `ColecaoResponse` |
| GET | `/api/v1/colecoes` | 200 | `ColecaoResponse[]` |
| GET | `/api/v1/colecoes/{id}` | 200 | `ColecaoDetalheResponse` |
| PUT | `/api/v1/colecoes/{id}` | 200 | `ColecaoResponse` |
| DELETE | `/api/v1/colecoes/{id}` | 204 | sem body |
| PATCH | `/api/v1/colecoes/{id}/publicar` | 200 | `ColecaoResponse` |
| PATCH | `/api/v1/colecoes/{id}/despublicar` | 200 | `ColecaoResponse` |
| POST | `/api/v1/colecoes/{id}/gerar-flashcards` | 201 | `ColecaoDetalheResponse` |
| POST | `/api/v1/colecoes/{colecaoId}/flashcards` | 201 | `FlashcardResponse` |
| PUT | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | 200 | `FlashcardResponse` |
| DELETE | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | 204 | sem body |

---

## 4. Contratos de dados (TypeScript de referencia)

```ts
export type ApiResponse<T> = {
  timestamp: string;
  status: number;
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
  path: string;
};

export type ColecaoResponse = {
  id: string;
  titulo: string;
  tema: string | null;
  qntCards: number | null;
  status: 'RASCUNHO' | 'PUBLICADA';
  turmaNome: string;
  totalFlashcards: number;
  createdAt: string;
};

export type FlashcardResponse = {
  id: string;
  textoFrente: string;
  textoVerso: string;
  ordem: number;
};

export type ColecaoDetalheResponse = {
  id: string;
  titulo: string;
  tema: string | null;
  qntCards: number | null;
  status: 'RASCUNHO' | 'PUBLICADA';
  turmaNome: string;
  totalFlashcards: number;
  createdAt: string;
  flashcards: FlashcardResponse[];
};
```

---

## 5. Contratos de request

### 5.1 CreateColecaoRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `titulo` | string | sim | NotBlank, max 255 |
| `tema` | string | nao | max 255 |
| `qntCards` | number | nao | sem validacao numerica adicional |
| `turmaId` | uuid | sim | NotNull, turma deve existir |

### 5.2 UpdateColecaoRequest

Todos opcionais:
- `titulo` (max 255)
- `tema` (max 255)
- `qntCards`

### 5.3 CreateFlashcardRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `textoFrente` | string | sim | NotBlank |
| `textoVerso` | string | sim | NotBlank |

### 5.4 UpdateFlashcardRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `textoFrente` | string | sim | NotBlank |
| `textoVerso` | string | sim | NotBlank |

### 5.5 GerarFlashcardsRequest (BLOCO 3 implementado)

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `tema` | string | sim | NotBlank, max 255 |
| `quantidade` | number | sim | min 1, max 20 |

Exemplo:

```json
{
  "tema": "Revolucao Francesa",
  "quantidade": 5
}
```

---

## 6. Endpoints detalhados - Professor/Admin

### 6.1 POST /api/v1/colecoes

Cria colecao em status inicial `RASCUNHO`.

Erros comuns:
- `400`: professor sem vinculo com turma, turma inativa, admin sem perfil professor para criacao, validacao de campo.
- `401`: token ausente/invalido.
- `403`: sem role permitida.
- `404`: turma nao encontrada.

### 6.2 GET /api/v1/colecoes

Lista colecoes:
- professor: apenas as proprias;
- admin: todas.

### 6.3 GET /api/v1/colecoes/{id}

Retorna detalhe da colecao com cards ordenados por `ordem`.

### 6.4 PUT /api/v1/colecoes/{id}

Atualiza metadados (`titulo`, `tema`, `qntCards`) apenas em `RASCUNHO`.

### 6.5 DELETE /api/v1/colecoes/{id}

Exclui colecao e cards associados (cascade). Retorna `204`.

### 6.6 PATCH /api/v1/colecoes/{id}/publicar

Publica colecao. Exige:
- status atual `RASCUNHO`;
- ao menos 1 flashcard;
- frente e verso preenchidos em todos os cards.

### 6.7 PATCH /api/v1/colecoes/{id}/despublicar

Retorna colecao para `RASCUNHO`. Exige status atual `PUBLICADA`.

### 6.8 POST /api/v1/colecoes/{id}/gerar-flashcards

Gera cards via LLM e retorna colecao detalhada atualizada.

Regras de dominio:
- permitido apenas para dono da colecao (ou admin);
- permitido apenas em colecao `RASCUNHO`;
- aplicacao de rate limit por usuario antes da chamada LLM;
- validacao de payload da LLM antes de persistencia;
- em payload invalido, nao persiste flashcards parcialmente.

Erros comuns:
- `400`: colecao publicada, payload invalido da LLM, regras de negocio.
- `403`: sem ownership (professor nao dono).
- `404`: colecao inexistente.
- `429`: limite de geracao excedido.
- `503`: indisponibilidade da LLM.

### 6.9 POST /api/v1/colecoes/{colecaoId}/flashcards

Adiciona card manual com `ordem` sequencial (`max(ordem)+1`).

### 6.10 PUT /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}

Edita frente/verso do card manual. Exige `RASCUNHO` e pertencimento do card a colecao.

### 6.11 DELETE /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}

Remove card manual. Exige `RASCUNHO` e pertencimento do card a colecao. Retorna `204`.

---

## 7. Mapeamento de erros (handler global)

| Tipo de erro | HTTP |
|---|---|
| `BusinessException` | 400 |
| `MethodArgumentNotValidException` | 400 |
| `IllegalArgumentException` | 400 |
| `AccessDeniedException` | 403 |
| `ResourceNotFoundException` | 404 |
| `RateLimitExceededException` | 429 |
| `LlmUnavailableException` | 503 |
| Falha de autenticacao | 401 |

---

## 8. Estado por bloco

| Bloco | Escopo API | Estado |
|---|---|---|
| 2 | Professor/admin (`/api/v1/colecoes`) | Concluido |
| 3 | Geracao LLM (`/gerar-flashcards`) | Concluido |
| 4 | Consumo aluno (`/api/v1/aluno/colecoes`) | Nao iniciado |

---

## 9. Referencias de origem

- backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java
- backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java
- backend/src/main/java/br/com/ilumina/service/Llm/LlmService.java
- backend/src/main/java/br/com/ilumina/service/Llm/LlmValidationService.java
- backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java
- Tasks/bloco3-flashcard-llm/execution_receipt.md
- Tasks/bloco3-flashcard-llm/review_memo.md
- Tasks/bloco3-flashcard-llm/final_receipt.md
