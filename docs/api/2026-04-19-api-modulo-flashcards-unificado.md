# API - Modulo Flashcards (Guia Unificado para Integracao Frontend)

Data: 2026-04-19  
Versao: v1  
Escopo: BLOCO 2 concluido (professor/admin) + base para evolucao BLOCO 3 e BLOCO 4

---

## 1. Objetivo

Este documento e a referencia principal para integracao frontend com o modulo Flashcards.

Cobertura atual:
- contratos de request/response dos endpoints de professor/admin;
- regras de validacao com impacto em formulario e UX;
- semantica de erros relevantes (`400/401/403/404`);
- direcao de evolucao para BLOCO 3 (LLM) e BLOCO 4 (aluno).

Este e um arquivo unico e evolutivo. Novos blocos devem atualizar este mesmo documento.

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

- Fluxo professor: `ROLE_PROFESSOR` ou `ROLE_ADMIN`
- Fluxo aluno (planejado): `ROLE_ALUNO` ou `ROLE_ADMIN`

### 2.4 Envelope de resposta padrao

Sucesso (exceto `204 No Content`):

```json
{
  "timestamp": "2026-04-19T16:30:00Z",
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
  "timestamp": "2026-04-19T16:31:00Z",
  "status": 400,
  "success": false,
  "message": "Erro de validação.",
  "data": null,
  "errors": [
    "titulo: O titulo e obrigatorio."
  ],
  "path": "/api/v1/colecoes"
}
```

### 2.5 Formatos e tipos

- IDs: UUID string
- Datas: `OffsetDateTime` (ISO-8601 com timezone)
- Status da colecao: `RASCUNHO` ou `PUBLICADA`
- `qntCards`: metadado opcional de planejamento

### 2.6 Endpoints com 204

Retornam sem body:
- `DELETE /api/v1/colecoes/{id}`
- `DELETE /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}`

---

## 3. Catalogo rapido de endpoints (BLOCO 2)

| Metodo | Path | Sucesso | Data retornado |
|---|---|---|---|
| POST | `/api/v1/colecoes` | 201 | `ColecaoResponse` |
| GET | `/api/v1/colecoes` | 200 | `ColecaoResponse[]` |
| GET | `/api/v1/colecoes/{id}` | 200 | `ColecaoDetalheResponse` |
| PUT | `/api/v1/colecoes/{id}` | 200 | `ColecaoResponse` |
| DELETE | `/api/v1/colecoes/{id}` | 204 | sem body |
| PATCH | `/api/v1/colecoes/{id}/publicar` | 200 | `ColecaoResponse` |
| PATCH | `/api/v1/colecoes/{id}/despublicar` | 200 | `ColecaoResponse` |
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
| `titulo` | string | sim | `NotBlank`, max 255 |
| `tema` | string | nao | max 255 |
| `qntCards` | number | nao | sem validacao numerica adicional no BLOCO 2 |
| `turmaId` | uuid | sim | `NotNull`, turma deve existir |

Exemplo:

```json
{
  "titulo": "Colecao Revolucao Industrial",
  "tema": "Revolucao Industrial",
  "qntCards": 10,
  "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd"
}
```

### 5.2 UpdateColecaoRequest

Todos os campos opcionais:
- `titulo` (max 255)
- `tema` (max 255)
- `qntCards`

### 5.3 CreateFlashcardRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `textoFrente` | string | sim | `NotBlank` |
| `textoVerso` | string | sim | `NotBlank` |

### 5.4 UpdateFlashcardRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `textoFrente` | string | sim | `NotBlank` |
| `textoVerso` | string | sim | `NotBlank` |

### 5.5 GerarFlashcardsRequest (BLOCO 3 - pendente)

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `tema` | string | sim | `NotBlank`, max 255 |
| `quantidade` | number | sim | min 1, max 20 |

---

## 6. Endpoints detalhados - Professor/Admin

## 6.1 POST /api/v1/colecoes

Cria colecao em status inicial `RASCUNHO`.

### Erros comuns

- `400`: professor sem vinculo com turma, turma inativa, admin sem perfil professor para criacao, validacao de campo.
- `401`: token ausente/invalido.
- `403`: sem role permitida.
- `404`: turma nao encontrada.

---

## 6.2 GET /api/v1/colecoes

Lista colecoes:
- professor: apenas as proprias;
- admin: todas as colecoes.

---

## 6.3 GET /api/v1/colecoes/{id}

Detalha colecao com cards ordenados por `ordem`.

### Erros comuns

- `403`: professor sem ownership da colecao.
- `404`: colecao nao encontrada.

---

## 6.4 PUT /api/v1/colecoes/{id}

Atualiza metadados da colecao (`titulo`, `tema`, `qntCards`).

### Regras de dominio

- so permite mutacao em `RASCUNHO`;
- colecao `PUBLICADA` retorna `400`.

---

## 6.5 DELETE /api/v1/colecoes/{id}

Remove colecao e cards associados via cascade.

Resposta: `204 No Content`.

---

## 6.6 PATCH /api/v1/colecoes/{id}/publicar

Publica colecao.

### Regras de dominio

- exige status atual `RASCUNHO`;
- exige ao menos 1 flashcard;
- todos os cards devem ter frente e verso preenchidos.

---

## 6.7 PATCH /api/v1/colecoes/{id}/despublicar

Retorna colecao para `RASCUNHO`.

### Regras de dominio

- exige status atual `PUBLICADA`.

---

## 6.8 POST /api/v1/colecoes/{colecaoId}/flashcards

Adiciona card manual com `ordem` sequencial (`max(ordem)+1`).

### Regras de dominio

- so em colecao `RASCUNHO`.

---

## 6.9 PUT /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}

Edita frente/verso de card manual.

### Regras de dominio

- so em colecao `RASCUNHO`;
- `flashcardId` deve pertencer a `colecaoId`.

---

## 6.10 DELETE /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}

Remove card manual.

### Regras de dominio

- so em colecao `RASCUNHO`;
- `flashcardId` deve pertencer a `colecaoId`.

Resposta: `204 No Content`.

---

## 7. Mapeamento de erros (handler global)

| Tipo de erro | HTTP |
|---|---|
| `BusinessException` | 400 |
| `MethodArgumentNotValidException` | 400 |
| `IllegalArgumentException` | 400 |
| `AccessDeniedException` | 403 |
| `ResourceNotFoundException` | 404 |
| Falha de autenticacao | 401 |

---

## 8. Estado por bloco

| Bloco | Escopo API | Estado |
|---|---|---|
| 2 | Professor/admin (`/api/v1/colecoes`) | Concluido |
| 3 | Geracao LLM de flashcards | Nao iniciado |
| 4 | Consumo aluno (`/api/v1/aluno/colecoes`) | Nao iniciado |

---

## 9. Referencias de origem

- `docs/planejamento/2026-04-13-guia-implementacao-modulo-flashcards.md`
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java`
- `backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java`
- `backend/src/main/java/br/com/ilumina/dto/flashcard/*.java`
- `backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java`
- `Tasks/bloco2-flashcard-professor/final_receipt.md`
