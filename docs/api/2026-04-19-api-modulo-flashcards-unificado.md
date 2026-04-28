# API - Modulo Flashcards (Referencia Unificada)

Data de atualizacao: 2026-04-21
Versao: v2

---

## 1. Objetivo

Este documento e a referencia principal de integracao HTTP do modulo Flashcards.

Ele contempla:
- contratos de professor/admin para criar, editar, publicar, despublicar, excluir e detalhar colecoes;
- contratos de flashcards manuais dentro de uma colecao;
- contrato de geracao de flashcards via LLM;
- contratos de aluno para listar colecoes publicadas disponiveis e detalhar uma colecao;
- DTOs de request/response usados pelo frontend;
- matriz de autorizacao, regras de negocio e erros esperados.

O modulo esta funcionalmente fechado nos blocos atuais:
- BLOCO 1: fundacao de dominio;
- BLOCO 2: API professor/admin;
- BLOCO 3: geracao via LLM;
- BLOCO 4: consumo por aluno.

---

## 2. Convencoes gerais

### 2.1 Base URLs

| Fluxo | Base URL | Estado |
|---|---|---|
| Professor/Admin | `/api/v1/colecoes` | implementado |
| Aluno | `/api/v1/aluno/colecoes` | implementado |

### 2.2 Headers

Para requests com body:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
Accept: application/json
```

Para GET/DELETE sem body:

```http
Authorization: Bearer <jwt>
Accept: application/json
```

### 2.3 Autorizacao por role

| Fluxo | Roles aceitas no controller | Regra adicional no service |
|---|---|---|
| Professor/Admin | `ROLE_PROFESSOR`, `ROLE_ADMIN` | professor precisa ter perfil `Professor`; admin tem bypass de ownership, exceto criacao que exige perfil professor |
| Aluno | `ROLE_ALUNO`, `ROLE_ADMIN` | usuario precisa resolver para perfil `Aluno`; admin sem perfil aluno recebe 403 |

Observacao: o comportamento de `ADMIN` no fluxo aluno segue o padrao ja existente em `AlunoProvaController`: o controller permite a role, mas o service ainda exige perfil de dominio `Aluno`.

### 2.4 Envelope padrao de sucesso

Exceto endpoints `204 No Content`, respostas de sucesso usam `ApiResponse<T>`.

```json
{
  "timestamp": "2026-04-21T10:00:00Z",
  "status": 200,
  "success": true,
  "message": "Colecoes listadas com sucesso.",
  "data": [],
  "errors": null,
  "path": "/api/v1/colecoes"
}
```

### 2.5 Envelope padrao de erro

```json
{
  "timestamp": "2026-04-21T10:01:00Z",
  "status": 403,
  "success": false,
  "message": "Acesso negado.",
  "data": null,
  "errors": [
    "Acesso negado."
  ],
  "path": "/api/v1/aluno/colecoes/00000000-0000-0000-0000-000000000000"
}
```

### 2.6 Tipos comuns

| Tipo | Formato |
|---|---|
| UUID | string UUID |
| data/hora | ISO-8601 (`OffsetDateTime`) |
| status de colecao | `RASCUNHO` ou `PUBLICADA` |
| ordem de flashcard | inteiro positivo |

---

## 3. Catalogo de endpoints

### 3.1 Professor/Admin

| Metodo | Path | Sucesso | Body de sucesso |
|---|---|---|---|
| POST | `/api/v1/colecoes` | 201 | `ApiResponse<ColecaoResponse>` |
| GET | `/api/v1/colecoes` | 200 | `ApiResponse<ColecaoResponse[]>` |
| GET | `/api/v1/colecoes/{id}` | 200 | `ApiResponse<ColecaoDetalheResponse>` |
| PUT | `/api/v1/colecoes/{id}` | 200 | `ApiResponse<ColecaoResponse>` |
| DELETE | `/api/v1/colecoes/{id}` | 204 | sem body |
| PATCH | `/api/v1/colecoes/{id}/publicar` | 200 | `ApiResponse<ColecaoResponse>` |
| PATCH | `/api/v1/colecoes/{id}/despublicar` | 200 | `ApiResponse<ColecaoResponse>` |
| POST | `/api/v1/colecoes/{id}/gerar-flashcards` | 201 | `ApiResponse<ColecaoDetalheResponse>` |
| POST | `/api/v1/colecoes/{colecaoId}/flashcards` | 201 | `ApiResponse<FlashcardResponse>` |
| PUT | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | 200 | `ApiResponse<FlashcardResponse>` |
| DELETE | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | 204 | sem body |

### 3.2 Aluno

| Metodo | Path | Sucesso | Body de sucesso |
|---|---|---|---|
| GET | `/api/v1/aluno/colecoes` | 200 | `ApiResponse<ColecaoAlunoResponse[]>` |
| GET | `/api/v1/aluno/colecoes/{id}` | 200 | `ApiResponse<ColecaoDetalheAlunoResponse>` |

Nao existem endpoints POST/PUT/PATCH/DELETE para aluno no modulo Flashcards.

---

## 4. Contratos TypeScript de referencia

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

export type StatusColecao = 'RASCUNHO' | 'PUBLICADA';

export type ColecaoResponse = {
  id: string;
  titulo: string;
  tema: string | null;
  qntCards: number | null;
  status: StatusColecao;
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
  status: StatusColecao;
  turmaNome: string;
  totalFlashcards: number;
  createdAt: string;
  flashcards: FlashcardResponse[];
};

export type ColecaoAlunoResponse = {
  id: string;
  titulo: string;
  tema: string | null;
  totalFlashcards: number;
  turmaNome: string;
};

export type FlashcardAlunoResponse = {
  id: string;
  textoFrente: string;
  textoVerso: string;
  ordem: number;
};

export type ColecaoDetalheAlunoResponse = {
  id: string;
  titulo: string;
  tema: string | null;
  totalFlashcards: number;
  turmaNome: string;
  flashcards: FlashcardAlunoResponse[];
};
```

---

## 5. Requests

### 5.1 CreateColecaoRequest

```ts
export type CreateColecaoRequest = {
  titulo: string;
  tema?: string | null;
  qntCards?: number | null;
  turmaId: string;
};
```

Validacoes:

| Campo | Regras |
|---|---|
| `titulo` | obrigatorio, nao branco, maximo 255 caracteres |
| `tema` | opcional, maximo 255 caracteres |
| `qntCards` | opcional |
| `turmaId` | obrigatorio, UUID de turma existente |

Exemplo:

```json
{
  "titulo": "Revisao de Revolucao Francesa",
  "tema": "Historia",
  "qntCards": 10,
  "turmaId": "11111111-1111-1111-1111-111111111111"
}
```

### 5.2 UpdateColecaoRequest

Todos os campos sao opcionais:

```ts
export type UpdateColecaoRequest = {
  titulo?: string | null;
  tema?: string | null;
  qntCards?: number | null;
};
```

Validacoes:
- `titulo`: maximo 255 caracteres quando enviado; nao pode ficar vazio apos normalizacao no service;
- `tema`: maximo 255 caracteres quando enviado;
- so permitido para colecao em `RASCUNHO`.

### 5.3 CreateFlashcardRequest

```ts
export type CreateFlashcardRequest = {
  textoFrente: string;
  textoVerso: string;
};
```

Validacoes:
- `textoFrente`: obrigatorio, nao branco;
- `textoVerso`: obrigatorio, nao branco;
- so permitido para colecao em `RASCUNHO`;
- `ordem` e atribuida automaticamente como `max(ordem)+1`.

### 5.4 UpdateFlashcardRequest

```ts
export type UpdateFlashcardRequest = {
  textoFrente: string;
  textoVerso: string;
};
```

Validacoes:
- `textoFrente`: obrigatorio, nao branco;
- `textoVerso`: obrigatorio, nao branco;
- so permitido para colecao em `RASCUNHO`;
- flashcard precisa pertencer a colecao indicada na URL.

### 5.5 GerarFlashcardsRequest

```ts
export type GerarFlashcardsRequest = {
  tema: string;
  quantidade: number;
};
```

Validacoes:

| Campo | Regras |
|---|---|
| `tema` | obrigatorio, nao branco, maximo 255 caracteres |
| `quantidade` | obrigatorio, minimo 1, maximo 20 |

Exemplo:

```json
{
  "tema": "Revolucao Francesa",
  "quantidade": 5
}
```

---

## 6. Endpoints Professor/Admin

### 6.1 POST `/api/v1/colecoes`

Cria uma colecao em `RASCUNHO`.

Regras:
- usuario precisa resolver para perfil `Professor`;
- turma precisa existir e estar ativa;
- professor precisa estar vinculado a turma;
- admin sem perfil `Professor` recebe `400` neste endpoint.

Resposta `201`:

```json
{
  "status": 201,
  "success": true,
  "message": "Colecao criada com sucesso.",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "titulo": "Revisao de Revolucao Francesa",
    "tema": "Historia",
    "qntCards": 10,
    "status": "RASCUNHO",
    "turmaNome": "2A",
    "totalFlashcards": 0,
    "createdAt": "2026-04-21T10:00:00Z"
  },
  "errors": null,
  "path": "/api/v1/colecoes"
}
```

Erros comuns:
- `400`: validacao, turma inativa, professor nao vinculado, admin sem perfil professor;
- `401`: token ausente/invalido;
- `403`: role nao permitida;
- `404`: turma nao encontrada.

### 6.2 GET `/api/v1/colecoes`

Lista colecoes do fluxo professor/admin.

Regras:
- professor ve apenas colecoes proprias;
- admin ve todas;
- ordenacao por `createdAt` desc.

Resposta `200`: `ApiResponse<ColecaoResponse[]>`.

### 6.3 GET `/api/v1/colecoes/{id}`

Detalha uma colecao no fluxo professor/admin.

Regras:
- professor precisa ser dono da colecao;
- admin tem bypass de ownership;
- flashcards retornam ordenados por `ordem` ascendente.

Resposta `200`: `ApiResponse<ColecaoDetalheResponse>`.

Erros comuns:
- `403`: professor nao dono;
- `404`: colecao inexistente.

### 6.4 PUT `/api/v1/colecoes/{id}`

Atualiza metadados de uma colecao.

Regras:
- professor precisa ser dono ou usuario precisa ser admin;
- colecao precisa estar em `RASCUNHO`;
- campos nulos nao alteram valores existentes.

Erros comuns:
- `400`: colecao publicada, titulo vazio, validacao de campo;
- `403`: professor nao dono;
- `404`: colecao inexistente.

### 6.5 DELETE `/api/v1/colecoes/{id}`

Exclui a colecao e seus flashcards por cascade.

Regras:
- professor precisa ser dono ou usuario precisa ser admin;
- permitido tanto para `RASCUNHO` quanto para `PUBLICADA`.

Resposta:
- `204 No Content`.

### 6.6 PATCH `/api/v1/colecoes/{id}/publicar`

Publica uma colecao.

Regras:
- colecao precisa estar em `RASCUNHO`;
- precisa existir ao menos 1 flashcard;
- todos os flashcards precisam ter frente e verso preenchidos;
- professor precisa ser dono ou usuario precisa ser admin.

Resposta `200`: `ApiResponse<ColecaoResponse>` com `status = PUBLICADA`.

### 6.7 PATCH `/api/v1/colecoes/{id}/despublicar`

Retorna a colecao para `RASCUNHO`.

Regras:
- colecao precisa estar `PUBLICADA`;
- professor precisa ser dono ou usuario precisa ser admin.

Resposta `200`: `ApiResponse<ColecaoResponse>` com `status = RASCUNHO`.

### 6.8 POST `/api/v1/colecoes/{id}/gerar-flashcards`

Gera flashcards via LLM e adiciona os cards na colecao.

Regras:
- professor precisa ser dono ou usuario precisa ser admin;
- colecao precisa estar em `RASCUNHO`;
- rate limit e validado antes da chamada LLM;
- payload da LLM precisa ter raiz `flashcards`;
- cada item precisa ter `textoFrente` e `textoVerso` nao vazios;
- quantidade retornada precisa bater com `quantidade`;
- frentes duplicadas na mesma geracao sao rejeitadas;
- em resposta invalida da LLM, nenhum card parcial deve ser persistido.

Formato esperado da LLM:

```json
{
  "flashcards": [
    {
      "textoFrente": "O que foi a Queda da Bastilha?",
      "textoVerso": "Marco simbolico da Revolucao Francesa ocorrido em 14 de julho de 1789."
    }
  ]
}
```

Resposta `201`: `ApiResponse<ColecaoDetalheResponse>` com a colecao atualizada.

Erros comuns:
- `400`: colecao publicada, request invalido, payload invalido da LLM;
- `403`: professor nao dono;
- `404`: colecao inexistente;
- `429`: limite de geracao excedido;
- `503`: LLM indisponivel.

### 6.9 POST `/api/v1/colecoes/{colecaoId}/flashcards`

Adiciona flashcard manual.

Regras:
- colecao precisa estar em `RASCUNHO`;
- professor precisa ser dono ou usuario precisa ser admin;
- `ordem` e atribuida automaticamente.

Resposta `201`: `ApiResponse<FlashcardResponse>`.

### 6.10 PUT `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}`

Atualiza frente/verso de um flashcard.

Regras:
- colecao precisa estar em `RASCUNHO`;
- professor precisa ser dono ou usuario precisa ser admin;
- flashcard precisa pertencer a colecao da URL.

Resposta `200`: `ApiResponse<FlashcardResponse>`.

### 6.11 DELETE `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}`

Remove um flashcard.

Regras:
- colecao precisa estar em `RASCUNHO`;
- professor precisa ser dono ou usuario precisa ser admin;
- flashcard precisa pertencer a colecao da URL.

Resposta:
- `204 No Content`.

---

## 7. Endpoints Aluno

### 7.1 GET `/api/v1/aluno/colecoes`

Lista colecoes disponiveis para o aluno autenticado.

Regras:
- usuario precisa resolver para perfil `Aluno`;
- service busca as turmas do aluno em `AlunoTurmaRepository`;
- se aluno nao tiver turmas, retorna lista vazia;
- retorna apenas colecoes com `status = PUBLICADA`;
- retorna apenas colecoes das turmas em que o aluno esta matriculado;
- ordena colecoes por `createdAt` desc internamente, embora `createdAt` nao seja exposto no DTO de aluno.

Resposta `200`:

```json
{
  "status": 200,
  "success": true,
  "message": "Colecoes do aluno listadas com sucesso.",
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "titulo": "Revisao de Revolucao Francesa",
      "tema": "Historia",
      "totalFlashcards": 12,
      "turmaNome": "2A"
    }
  ],
  "errors": null,
  "path": "/api/v1/aluno/colecoes"
}
```

Erros comuns:
- `401`: token ausente/invalido;
- `403`: role nao permitida ou usuario sem perfil `Aluno`.

### 7.2 GET `/api/v1/aluno/colecoes/{id}`

Detalha uma colecao publicada disponivel para o aluno.

Regras:
- colecao inexistente retorna `404`;
- colecao em `RASCUNHO` retorna `403`;
- colecao de outra turma retorna `403`;
- aluno precisa estar matriculado na turma da colecao;
- flashcards retornam em `ordem` ascendente;
- nao ha status, `qntCards` nem `createdAt` no DTO de aluno.

Resposta `200`:

```json
{
  "status": 200,
  "success": true,
  "message": "Colecao detalhada com sucesso.",
  "data": {
    "id": "33333333-3333-3333-3333-333333333333",
    "titulo": "Revisao de Revolucao Francesa",
    "tema": "Historia",
    "totalFlashcards": 2,
    "turmaNome": "2A",
    "flashcards": [
      {
        "id": "44444444-4444-4444-4444-444444444444",
        "textoFrente": "O que foi a Queda da Bastilha?",
        "textoVerso": "Marco simbolico da Revolucao Francesa.",
        "ordem": 1
      },
      {
        "id": "55555555-5555-5555-5555-555555555555",
        "textoFrente": "Qual era o lema revolucionario?",
        "textoVerso": "Liberdade, igualdade e fraternidade.",
        "ordem": 2
      }
    ]
  },
  "errors": null,
  "path": "/api/v1/aluno/colecoes/33333333-3333-3333-3333-333333333333"
}
```

Erros comuns:
- `401`: token ausente/invalido;
- `403`: colecao rascunho, colecao fora das turmas do aluno, role nao permitida ou usuario sem perfil `Aluno`;
- `404`: colecao inexistente.

---

## 8. Matriz de autorizacao

| Cenario | Resultado esperado |
|---|---|
| professor cria colecao em turma vinculada | 201 |
| professor cria colecao em turma nao vinculada | 400 |
| professor lista colecoes | apenas proprias |
| admin lista colecoes | todas |
| professor detalha colecao de outro professor | 403 |
| aluno chama `/api/v1/colecoes` | 403 |
| professor chama `/api/v1/aluno/colecoes` | 403 |
| aluno lista colecoes sem turma | 200 com `data: []` |
| aluno lista colecoes com turma | apenas `PUBLICADA` das suas turmas |
| aluno detalha colecao publicada da sua turma | 200 |
| aluno detalha colecao publicada de outra turma | 403 |
| aluno detalha colecao em `RASCUNHO` | 403 |
| aluno detalha colecao inexistente | 404 |
| admin sem perfil aluno chama fluxo aluno | 403 pelo service |

---

## 9. Mapeamento de erros

| Origem | HTTP | Observacao |
|---|---|---|
| validacao Bean Validation | 400 | `MethodArgumentNotValidException` |
| regra de negocio | 400 | `BusinessException` |
| argumento invalido normalizado no service | 400 | `IllegalArgumentException` |
| autenticacao ausente/invalida | 401 | filtro/entrypoint de seguranca |
| acesso negado | 403 | `AccessDeniedException` |
| recurso inexistente | 404 | `ResourceNotFoundException` |
| conflito de integridade | 409 | `DataIntegrityViolationException` |
| rate limit de LLM | 429 | `RateLimitExceededException` |
| LLM indisponivel | 503 | `LlmUnavailableException` |
| erro inesperado | 500 | fallback global |

---

## 10. Invariantes de contrato para frontend

- Colecao sempre nasce em `RASCUNHO`.
- Publicacao so e possivel com ao menos 1 flashcard valido.
- Colecao `PUBLICADA` nao aceita atualizacao de metadados nem mutacao de cards; precisa despublicar antes.
- Exclusao de colecao remove os flashcards associados.
- O fluxo aluno e somente leitura.
- Aluno nunca recebe colecoes em `RASCUNHO` na listagem.
- Aluno nunca acessa detalhe de colecao fora de suas turmas.
- Cards sempre devem ser exibidos pela ordem recebida no array.
- O DTO de aluno e intencionalmente menor que o DTO de professor/admin.
- A listagem de aluno pode retornar `[]` sem indicar erro.

---

## 11. Estado por bloco

| Bloco | Escopo API | Estado |
|---|---|---|
| 1 | Dominio, repositorios e DTOs base | concluido |
| 2 | Professor/admin (`/api/v1/colecoes`) | concluido |
| 3 | Geracao LLM (`/api/v1/colecoes/{id}/gerar-flashcards`) | concluido |
| 4 | Consumo aluno (`/api/v1/aluno/colecoes`) | concluido |

---

## 12. Referencias de origem

- `backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java`
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/AlunoFlashcardController.java`
- `backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java`
- `backend/src/main/java/br/com/ilumina/service/Flashcard/AlunoFlashcardService.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmValidationService.java`
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/ColecoesFlashcardRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/FlashcardRepository.java`
- `tasks/bloco4-flashcard-aluno/final_receipt.md`
- `tasks/bloco4-flashcard-aluno/delivery_pack.md`
