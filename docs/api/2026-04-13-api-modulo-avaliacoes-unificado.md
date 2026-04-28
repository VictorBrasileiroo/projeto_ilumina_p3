# API - Modulo Avaliacoes (Guia Unificado para Integracao Frontend)

Data: 2026-04-13  
Versao: v2  
Escopo: Blocos 1, 2, 3 e 4 (professor/admin + aluno)

---

## 1. Objetivo

Este documento e a referencia principal para integracao frontend com o modulo de avaliacoes.

Cobertura:
- contratos de request/response por endpoint;
- regras de validacao que impactam UX/formulario;
- exemplos de erros reais retornados pelo backend;
- diferenca de payload entre visao professor e visao aluno.

---

## 2. Convencoes de integracao

### 2.1 Base URLs

- Professor/Admin: `/api/v1/provas`
- Aluno/Admin: `/api/v1/aluno/provas`

### 2.2 Headers obrigatorios

```http
Authorization: Bearer <jwt>
Content-Type: application/json
Accept: application/json
```

### 2.3 Autorizacao por role

- Fluxo professor: `ROLE_PROFESSOR` ou `ROLE_ADMIN`
- Fluxo aluno: `ROLE_ALUNO` ou `ROLE_ADMIN`

### 2.4 Envelope de resposta padrao

Todos os endpoints (exceto `204 No Content`) usam `ApiResponse<T>`:

```json
{
  "timestamp": "2026-04-13T15:30:00Z",
  "status": 200,
  "success": true,
  "message": "Provas listadas com sucesso.",
  "data": [],
  "errors": null,
  "path": "/api/v1/provas"
}
```

Em erro:

```json
{
  "timestamp": "2026-04-13T15:31:00Z",
  "status": 400,
  "success": false,
  "message": "Erro de validação.",
  "data": null,
  "errors": [
    "titulo: O título é obrigatório."
  ],
  "path": "/api/v1/provas"
}
```

### 2.5 Formatos e tipos

- IDs: UUID string
- Datas: `OffsetDateTime` (ISO-8601 com timezone)
- Status de prova: `RASCUNHO` ou `PUBLICADA`
- Letras de alternativa/gabarito: `A`, `B`, `C`, `D`

### 2.6 Endpoints com 204

Retornam sem body:
- `DELETE /api/v1/provas/{id}`
- `DELETE /api/v1/provas/{provaId}/questoes/{questaoId}`

---

## 3. Catalogo rapido de endpoints

### 3.1 Professor/Admin

| Metodo | Path | Sucesso | Data retornado |
|---|---|---|---|
| POST | `/api/v1/provas` | 201 | `ProvaResponse` |
| GET | `/api/v1/provas` | 200 | `ProvaResponse[]` |
| GET | `/api/v1/provas/{id}` | 200 | `ProvaDetalheResponse` |
| PUT | `/api/v1/provas/{id}` | 200 | `ProvaResponse` |
| DELETE | `/api/v1/provas/{id}` | 204 | sem body |
| POST | `/api/v1/provas/{provaId}/questoes` | 201 | `QuestaoResponse` |
| PUT | `/api/v1/provas/{provaId}/questoes/{questaoId}` | 200 | `QuestaoResponse` |
| DELETE | `/api/v1/provas/{provaId}/questoes/{questaoId}` | 204 | sem body |
| PUT | `/api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId}` | 200 | `AlternativaResponse` |
| PATCH | `/api/v1/provas/{id}/publicar` | 200 | `ProvaResponse` |
| PATCH | `/api/v1/provas/{id}/despublicar` | 200 | `ProvaResponse` |
| POST | `/api/v1/provas/{id}/gerar-questoes` | 201 | `ProvaDetalheResponse` |

### 3.2 Aluno/Admin

| Metodo | Path | Sucesso | Data retornado |
|---|---|---|---|
| GET | `/api/v1/aluno/provas` | 200 | `ProvaAlunoResponse[]` |
| GET | `/api/v1/aluno/provas/{id}` | 200 | `ProvaDetalheAlunoResponse` |
| POST | `/api/v1/aluno/provas/{id}/respostas` | 201 | `ResultadoProvaResponse` |
| GET | `/api/v1/aluno/provas/{id}/resultado` | 200 | `ResultadoProvaResponse` |

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

export type ProvaResponse = {
  id: string;
  titulo: string;
  disciplina: string | null;
  status: 'RASCUNHO' | 'PUBLICADA';
  turmaId: string;
  turmaNome: string;
  professorId: string;
  professorNome: string;
  totalQuestoes: number;
  createdAt: string;
  updatedAt: string;
};

export type AlternativaResponse = {
  id: string;
  letra: 'A' | 'B' | 'C' | 'D';
  texto: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestaoResponse = {
  id: string;
  enunciado: string;
  gabarito: 'A' | 'B' | 'C' | 'D';
  pontuacao: number;
  ordem: number;
  alternativas: AlternativaResponse[];
  createdAt: string;
  updatedAt: string;
};

export type ProvaDetalheResponse = {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string | null;
  qntQuestoes: number | null;
  status: 'RASCUNHO' | 'PUBLICADA';
  turmaId: string;
  turmaNome: string;
  professorId: string;
  professorNome: string;
  questoes: QuestaoResponse[];
  createdAt: string;
  updatedAt: string;
};

export type ProvaAlunoResponse = {
  id: string;
  titulo: string;
  disciplina: string | null;
  createdAt: string;
  turmaNome: string;
  totalQuestoes: number;
  jaRespondeu: boolean;
};

export type AlternativaAlunoResponse = {
  id: string;
  letra: 'A' | 'B' | 'C' | 'D';
  texto: string;
};

export type QuestaoAlunoResponse = {
  id: string;
  enunciado: string;
  ordem: number;
  alternativas: AlternativaAlunoResponse[];
};

export type ProvaDetalheAlunoResponse = {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string | null;
  turmaId: string;
  turmaNome: string;
  totalQuestoes: number;
  questoes: QuestaoAlunoResponse[];
  createdAt: string;
};

export type QuestaoResultadoResponse = {
  questaoId: string;
  enunciado: string;
  letraEscolhida: 'A' | 'B' | 'C' | 'D';
  gabarito: 'A' | 'B' | 'C' | 'D';
  acertou: boolean;
  pontuacao: number;
};

export type ResultadoProvaResponse = {
  provaId: string;
  provaTitle: string;
  totalQuestoes: number;
  totalAcertos: number;
  notaFinal: number;
  respondidoEm: string;
  questoes: QuestaoResultadoResponse[];
};
```

---

## 5. Contratos de request

### 5.1 CreateProvaRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `titulo` | string | sim | max 255 |
| `descricao` | string | nao | max 2000 |
| `disciplina` | string | nao | max 100 |
| `qntQuestoes` | number | nao | usado no planejamento da prova/LLM |
| `turmaId` | uuid | sim | turma existente |

### 5.2 UpdateProvaRequest

Todos os campos opcionais:
- `titulo`, `descricao`, `disciplina`, `qntQuestoes`, `turmaId`

### 5.3 CreateQuestaoRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `enunciado` | string | sim | nao vazio |
| `gabarito` | string | sim | regex `[ABCD]` |
| `pontuacao` | number | nao | decimal |
| `ordem` | number | sim | minimo 1 |
| `alternativas` | array | sim | min 2, max 4 |

Estrutura de alternativa no create:

```json
{
  "texto": "4",
  "letra": "B"
}
```

### 5.4 UpdateQuestaoRequest

Todos os campos opcionais:
- `enunciado` (max 5000)
- `gabarito` (`[ABCD]`)
- `pontuacao`
- `ordem`

### 5.5 UpdateAlternativaRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `texto` | string | sim | nao vazio |

### 5.6 GerarQuestoesRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `tema` | string | sim | nao vazio |
| `quantidade` | number | nao | min 1, max 20 |

### 5.7 SubmissaoRespostasRequest

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `respostas` | array | sim | nao vazio |

Item de `respostas`:

| Campo | Tipo | Obrigatorio | Regras |
|---|---|---|---|
| `questaoId` | uuid | sim | questao da prova |
| `letraEscolhida` | string | sim | regex `[ABCD]` |

---

## 6. Endpoints detalhados - Professor/Admin

## 6.1 POST /api/v1/provas

Cria prova em status inicial `RASCUNHO`.

### Request

Path params: nenhum  
Body: `CreateProvaRequest`

Exemplo:

```json
{
  "titulo": "Prova Bimestral de Matematica",
  "descricao": "Conteudo do capitulo 1 ao 5",
  "disciplina": "Matematica",
  "qntQuestoes": 10,
  "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd"
}
```

### Response 201

`ApiResponse<ProvaResponse>`

```json
{
  "timestamp": "2026-04-13T18:10:00Z",
  "status": 201,
  "success": true,
  "message": "Prova criada com sucesso.",
  "data": {
    "id": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
    "titulo": "Prova Bimestral de Matematica",
    "disciplina": "Matematica",
    "status": "RASCUNHO",
    "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd",
    "turmaNome": "1A",
    "professorId": "6f3f1b3f-e7d5-4f2e-9f2d-b05b3f8f04a4",
    "professorNome": "Ana Souza",
    "totalQuestoes": 0,
    "createdAt": "2026-04-13T18:10:00Z",
    "updatedAt": "2026-04-13T18:10:00Z"
  },
  "errors": null,
  "path": "/api/v1/provas"
}
```

### Erros comuns

- 400: validacao de campos, professor sem vinculo com turma, admin sem perfil professor no dominio.
- 403: sem permissao.
- 404: turma nao encontrada.

---

## 6.2 GET /api/v1/provas

Lista provas do contexto do usuario autenticado.

### Request

Sem query params no estado atual.

### Response 200

`ApiResponse<ProvaResponse[]>`

```json
{
  "timestamp": "2026-04-13T18:11:00Z",
  "status": 200,
  "success": true,
  "message": "Provas listadas com sucesso.",
  "data": [
    {
      "id": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
      "titulo": "Prova Bimestral de Matematica",
      "disciplina": "Matematica",
      "status": "RASCUNHO",
      "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd",
      "turmaNome": "1A",
      "professorId": "6f3f1b3f-e7d5-4f2e-9f2d-b05b3f8f04a4",
      "professorNome": "Ana Souza",
      "totalQuestoes": 10,
      "createdAt": "2026-04-13T18:10:00Z",
      "updatedAt": "2026-04-13T18:10:00Z"
    }
  ],
  "errors": null,
  "path": "/api/v1/provas"
}
```

---

## 6.3 GET /api/v1/provas/{id}

Detalha prova com questoes e alternativas.

### Request

Path params:

| Param | Tipo | Obrigatorio |
|---|---|---|
| `id` | uuid | sim |

### Response 200

`ApiResponse<ProvaDetalheResponse>`

```json
{
  "timestamp": "2026-04-13T18:12:00Z",
  "status": 200,
  "success": true,
  "message": "Prova detalhada com sucesso.",
  "data": {
    "id": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
    "titulo": "Prova Bimestral de Matematica",
    "descricao": "Conteudo do capitulo 1 ao 5",
    "disciplina": "Matematica",
    "qntQuestoes": 10,
    "status": "RASCUNHO",
    "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd",
    "turmaNome": "1A",
    "professorId": "6f3f1b3f-e7d5-4f2e-9f2d-b05b3f8f04a4",
    "professorNome": "Ana Souza",
    "questoes": [
      {
        "id": "a7a9d32a-58d6-44ad-bf64-41f8f6f9e9bd",
        "enunciado": "Quanto e 2 + 2?",
        "gabarito": "B",
        "pontuacao": 2.5,
        "ordem": 1,
        "alternativas": [
          {
            "id": "d1aab4f0-bd5e-4ed8-9c87-7231afcf2f7d",
            "letra": "A",
            "texto": "3",
            "createdAt": "2026-04-13T18:12:00Z",
            "updatedAt": "2026-04-13T18:12:00Z"
          }
        ],
        "createdAt": "2026-04-13T18:12:00Z",
        "updatedAt": "2026-04-13T18:12:00Z"
      }
    ],
    "createdAt": "2026-04-13T18:10:00Z",
    "updatedAt": "2026-04-13T18:12:00Z"
  },
  "errors": null,
  "path": "/api/v1/provas/88d4d239-1f23-4d37-9f31-2b0f20f7a8a8"
}
```

---

## 6.4 PUT /api/v1/provas/{id}

Atualiza campos da prova (patch-style via body opcional).

### Request

Path params: `id` (uuid)  
Body: `UpdateProvaRequest` (todos os campos opcionais)

Exemplo:

```json
{
  "titulo": "Prova Bimestral Atualizada",
  "descricao": "Descricao revisada"
}
```

### Response 200

`ApiResponse<ProvaResponse>`

Mensagem: `Prova atualizada com sucesso.`

### Erros comuns

- 400: regras de negocio (ex.: prova publicada, turma inativa, professor sem vinculo).
- 403: ownership/permissao.
- 404: prova ou turma nao encontrada.

---

## 6.5 DELETE /api/v1/provas/{id}

Exclui prova.

### Response 204

Sem body.

### Erros comuns

- 400: prova em estado que nao permite exclusao.
- 403: ownership/permissao.
- 404: prova nao encontrada.

---

## 6.6 POST /api/v1/provas/{provaId}/questoes

Adiciona questao na prova.

### Request

Path params:

| Param | Tipo |
|---|---|
| `provaId` | uuid |

Body: `CreateQuestaoRequest`

```json
{
  "enunciado": "Quanto e 2 + 2?",
  "gabarito": "B",
  "pontuacao": 2.5,
  "ordem": 1,
  "alternativas": [
    { "texto": "3", "letra": "A" },
    { "texto": "4", "letra": "B" },
    { "texto": "5", "letra": "C" }
  ]
}
```

### Response 201

`ApiResponse<QuestaoResponse>`

Mensagem: `Questão adicionada com sucesso.`

### Erros comuns

- 400: ordem duplicada, ordem < 1, gabarito invalido, alternativas invalidas.
- 403: ownership/permissao.
- 404: prova nao encontrada.

---

## 6.7 PUT /api/v1/provas/{provaId}/questoes/{questaoId}

Atualiza dados da questao.

### Request

Path params:

| Param | Tipo |
|---|---|
| `provaId` | uuid |
| `questaoId` | uuid |

Body: `UpdateQuestaoRequest` (campos opcionais)

```json
{
  "enunciado": "Quanto e 3 + 2?",
  "gabarito": "C",
  "ordem": 2
}
```

### Response 200

`ApiResponse<QuestaoResponse>`

Mensagem: `Questão atualizada com sucesso.`

### Erros comuns

- 400: ordem duplicada, gabarito invalido, prova publicada.
- 403: ownership/permissao.
- 404: prova/questao nao encontrada.

---

## 6.8 DELETE /api/v1/provas/{provaId}/questoes/{questaoId}

Remove questao e reordena sequencia.

### Response 204

Sem body.

### Erros comuns

- 400: prova publicada.
- 403: ownership/permissao.
- 404: prova/questao nao encontrada.

---

## 6.9 PUT /api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId}

Atualiza apenas texto da alternativa.

### Request

Path params: `provaId`, `questaoId`, `altId` (uuid)

Body:

```json
{
  "texto": "4"
}
```

### Response 200

`ApiResponse<AlternativaResponse>`

Mensagem: `Alternativa atualizada com sucesso.`

### Erros comuns

- 400: alternativa nao pertence a questao, texto vazio, prova publicada.
- 403: ownership/permissao.
- 404: prova/questao/alternativa nao encontrada.

---

## 6.10 PATCH /api/v1/provas/{id}/publicar

Publica prova apos validacoes de integridade.

### Response 200

`ApiResponse<ProvaResponse>`

Mensagem: `Prova publicada com sucesso.`

### Erros comuns

- 400: prova sem questoes, questoes com alternativas invalidas, gabarito inconsistente, prova ja publicada.
- 403: ownership/permissao.
- 404: prova nao encontrada.

---

## 6.11 PATCH /api/v1/provas/{id}/despublicar

Retorna prova para `RASCUNHO`.

### Response 200

`ApiResponse<ProvaResponse>`

Mensagem: `Prova despublicada com sucesso.`

### Erros comuns

- 400: prova ja em rascunho.
- 403: ownership/permissao.
- 404: prova nao encontrada.

---

## 6.12 POST /api/v1/provas/{id}/gerar-questoes

Gera questoes por tema via LLM.

### Request

Path params: `id` (uuid)

Body:

```json
{
  "tema": "Revolucao Francesa",
  "quantidade": 5
}
```

`quantidade` e opcional.

### Response 201

`ApiResponse<ProvaDetalheResponse>`

Mensagem: `Questões geradas com sucesso.`

### Erros comuns

- 400: prova publicada, quantidade acima do restante, payload IA invalido, quantidade planejada nao definida.
- 403: ownership/permissao.
- 404: prova nao encontrada.
- 429: rate limit excedido.
- 503: indisponibilidade LLM/chave ausente.

Exemplo de erro 429:

```json
{
  "timestamp": "2026-04-13T18:40:00Z",
  "status": 429,
  "success": false,
  "message": "Limite de geração excedido. Tente novamente em instantes.",
  "data": null,
  "errors": [
    "Limite de geração excedido. Tente novamente em instantes."
  ],
  "path": "/api/v1/provas/88d4d239-1f23-4d37-9f31-2b0f20f7a8a8/gerar-questoes"
}
```

---

## 7. Endpoints detalhados - Aluno/Admin

## 7.1 GET /api/v1/aluno/provas

Lista provas publicadas disponiveis para as turmas do aluno.

### Response 200

`ApiResponse<ProvaAlunoResponse[]>`

```json
{
  "timestamp": "2026-04-13T19:00:00Z",
  "status": 200,
  "success": true,
  "message": "Provas do aluno listadas com sucesso.",
  "data": [
    {
      "id": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
      "titulo": "Prova Bimestral de Matematica",
      "disciplina": "Matematica",
      "createdAt": "2026-04-13T18:10:00Z",
      "turmaNome": "1A",
      "totalQuestoes": 10,
      "jaRespondeu": false
    }
  ],
  "errors": null,
  "path": "/api/v1/aluno/provas"
}
```

---

## 7.2 GET /api/v1/aluno/provas/{id}

Detalha prova para resolucao do aluno. Nao retorna gabarito.

### Response 200

`ApiResponse<ProvaDetalheAlunoResponse>`

```json
{
  "timestamp": "2026-04-13T19:01:00Z",
  "status": 200,
  "success": true,
  "message": "Prova detalhada com sucesso.",
  "data": {
    "id": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
    "titulo": "Prova Bimestral de Matematica",
    "descricao": "Conteudo do capitulo 1 ao 5",
    "disciplina": "Matematica",
    "turmaId": "2f8f9dd5-3f75-4b8f-9e6f-c31f691bd8dd",
    "turmaNome": "1A",
    "totalQuestoes": 10,
    "questoes": [
      {
        "id": "a7a9d32a-58d6-44ad-bf64-41f8f6f9e9bd",
        "enunciado": "Quanto e 2 + 2?",
        "ordem": 1,
        "alternativas": [
          { "id": "d1aab4f0-bd5e-4ed8-9c87-7231afcf2f7d", "letra": "A", "texto": "3" },
          { "id": "7fcf608f-36cb-4933-9069-2d0f1ff5a2f5", "letra": "B", "texto": "4" }
        ]
      }
    ],
    "createdAt": "2026-04-13T18:10:00Z"
  },
  "errors": null,
  "path": "/api/v1/aluno/provas/88d4d239-1f23-4d37-9f31-2b0f20f7a8a8"
}
```

### Erros comuns

- 403: acesso fora de escopo (turma diferente) ou prova nao publicada.
- 404: prova nao encontrada.

---

## 7.3 POST /api/v1/aluno/provas/{id}/respostas

Submete respostas e retorna resultado calculado.

### Request

Body: `SubmissaoRespostasRequest`

```json
{
  "respostas": [
    {
      "questaoId": "a7a9d32a-58d6-44ad-bf64-41f8f6f9e9bd",
      "letraEscolhida": "B"
    }
  ]
}
```

### Response 201

`ApiResponse<ResultadoProvaResponse>`

```json
{
  "timestamp": "2026-04-13T19:02:00Z",
  "status": 201,
  "success": true,
  "message": "Respostas submetidas com sucesso.",
  "data": {
    "provaId": "88d4d239-1f23-4d37-9f31-2b0f20f7a8a8",
    "provaTitle": "Prova Bimestral de Matematica",
    "totalQuestoes": 10,
    "totalAcertos": 7,
    "notaFinal": 17.5,
    "respondidoEm": "2026-04-13T19:02:00Z",
    "questoes": [
      {
        "questaoId": "a7a9d32a-58d6-44ad-bf64-41f8f6f9e9bd",
        "enunciado": "Quanto e 2 + 2?",
        "letraEscolhida": "B",
        "gabarito": "B",
        "acertou": true,
        "pontuacao": 2.5
      }
    ]
  },
  "errors": null,
  "path": "/api/v1/aluno/provas/88d4d239-1f23-4d37-9f31-2b0f20f7a8a8/respostas"
}
```

### Erros comuns

- 400: payload invalido, letra fora de A-D, questao duplicada no payload, questao fora da prova, faltam questoes.
- 403: prova nao publicada ou fora do escopo do aluno.
- 404: prova nao encontrada.
- 409: tentativa duplicada do mesmo aluno para a mesma prova.

Exemplo de 409:

```json
{
  "timestamp": "2026-04-13T19:03:00Z",
  "status": 409,
  "success": false,
  "message": "Conflito de integridade dos dados.",
  "data": null,
  "errors": [
    "duplicate key value violates unique constraint \"uk_resposta_aluno_aluno_prova\""
  ],
  "path": "/api/v1/aluno/provas/88d4d239-1f23-4d37-9f31-2b0f20f7a8a8/respostas"
}
```

---

## 7.4 GET /api/v1/aluno/provas/{id}/resultado

Consulta resultado ja salvo da prova.

### Response 200

`ApiResponse<ResultadoProvaResponse>`

Mensagem: `Resultado consultado com sucesso.`

### Erros comuns

- 403: fora de escopo do aluno.
- 404: prova inexistente ou resultado ainda nao existe para este aluno.

---

## 8. Mapa de erros para tratamento frontend

| HTTP | Quando usar no frontend |
|---|---|
| 400 | Exibir mensagem de validacao do formulario/fluxo |
| 401 | Redirecionar para login e limpar token local |
| 403 | Exibir tela de acesso negado/sem permissao |
| 404 | Exibir estado de recurso inexistente |
| 409 | Exibir conflito (ex.: ja respondeu esta prova) |
| 429 | Exibir throttling e retry com backoff |
| 503 | Exibir indisponibilidade temporaria e botao tentar novamente |
| 500 | Exibir erro generico e registrar telemetry |

Observacao importante:
- para alguns 403, o `message` pode vir generico (`Acesso negado.`) e o detalhe util aparece em `errors[0]`.

---

## 9. Fluxos recomendados para integracao

### 9.1 Fluxo professor (manual)

1. `POST /api/v1/provas`
2. `POST /api/v1/provas/{provaId}/questoes` (repetir)
3. `PATCH /api/v1/provas/{id}/publicar`

### 9.2 Fluxo professor (com IA)

1. `POST /api/v1/provas`
2. `POST /api/v1/provas/{id}/gerar-questoes`
3. revisar com `GET /api/v1/provas/{id}`
4. `PATCH /api/v1/provas/{id}/publicar`

### 9.3 Fluxo aluno

1. `GET /api/v1/aluno/provas`
2. `GET /api/v1/aluno/provas/{id}`
3. `POST /api/v1/aluno/provas/{id}/respostas`
4. `GET /api/v1/aluno/provas/{id}/resultado` (reconsulta posterior)

---

## 10. Limites e observacoes tecnicas

- Sem paginacao nativa nos endpoints atuais.
- Rate limit da LLM e in-memory por instancia.
- Projeto ainda sem migracoes versionadas (Flyway/Liquibase).
- Gabarito nunca deve ser lido de endpoint de detalhe do aluno; somente no endpoint de resultado.

---

## 11. Referencias de origem

- `docs/api/2026-04-09-api-modulo-avaliacoes-bloco-2-api-publicacao.md`
- `docs/api/2026-04-09-api-modulo-avaliacoes-bloco-3-geracao-llm.md`
- `docs/api/2026-04-09-api-modulo-aluno-bloco-4.md`
- `backend/src/main/java/br/com/ilumina/controller/Prova/ProvaController.java`
- `backend/src/main/java/br/com/ilumina/controller/Prova/AlunoProvaController.java`
- `backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java`
