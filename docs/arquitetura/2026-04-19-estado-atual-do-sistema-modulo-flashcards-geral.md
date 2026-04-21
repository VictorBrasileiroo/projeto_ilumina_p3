# Estado Atual do Sistema - Modulo Flashcards

Data de atualizacao: 2026-04-20
Escopo: consolidacao arquitetural do modulo Flashcards em arquivo unico (documento vivo)

---

## 1. Resumo executivo

O modulo Flashcards evoluiu da fundacao de dominio para operacao professor/admin e geracao via LLM:
- entidades, repositorios e DTOs base consolidados;
- API professor/admin implementada em `/api/v1/colecoes`;
- endpoint de geracao LLM implementado (`/gerar-flashcards`);
- validacao defensiva de payload da IA antes de persistencia;
- cobertura de integracao com cenarios de sucesso e erros operacionais criticos.

Estado de maturidade:
- Bloco 1: concluido
- Bloco 2: concluido
- Bloco 3: concluido
- Bloco 4: nao iniciado

---

## 2. Linha do tempo de maturidade

| Bloco | Entrega principal | Maturidade adicionada |
|---|---|---|
| 1 | Entidades + repositorios + DTOs base | Fundacao do agregado de colecoes/cards |
| 2 | API professor/admin | Operacao de ponta a ponta para CRUD/publicacao |
| 3 | Geracao LLM + validacao | Automacao assistida por IA com integridade de persistencia |
| 4 | API aluno (leitura) | Pendente |

---

## 3. Arquitetura em camadas (estado consolidado)

### 3.1 Controller layer

- `FlashcardController` implementado (professor/admin)
- `AlunoFlashcardController` planejado para BLOCO 4

### 3.2 Service layer

- `FlashcardService` implementado com:
  - CRUD de colecao/card manual
  - publicar/despublicar
  - gerar flashcards via LLM
  - ownership e guard de editabilidade
- `AlunoFlashcardService` planejado para BLOCO 4

### 3.3 LLM layer (compartilhada)

- `LlmService` estendido com `gerarFlashcards(...)`
- `LlmServiceImpl` com execucao JSON para questoes e flashcards
- `LlmValidationService` com `validarFlashcards(...)`
- `RateLimiterService` aplicado no fluxo de geracao

### 3.4 Repository layer

- `ColecoesFlashcardRepository`
- `FlashcardRepository`

### 3.5 Domain layer

- `StatusColecao`
- `ColecoesFlashcard`
- `Flashcard`

Padroes preservados:
- heranca de `BaseEntity` (UUID + auditoria)
- composicao `ColecoesFlashcard -> Flashcard` com `cascade = ALL` e `orphanRemoval = true`
- ordenacao por `ordem` no agregado

---

## 4. Fluxos arquiteturais principais

### 4.1 Fluxo professor/admin manual

1. chamada em `/api/v1/colecoes`.
2. controller delega para `FlashcardService`.
3. service resolve ownership e status.
4. mutacoes em `RASCUNHO`.
5. retorno padrao em `ApiResponse<T>`.

### 4.2 Fluxo geracao LLM (BLOCO 3)

1. `POST /api/v1/colecoes/{id}/gerar-flashcards`.
2. validacao de ownership e status `RASCUNHO`.
3. validacao de rate limit.
4. chamada `LlmService.gerarFlashcards` com prompt dedicado.
5. validacao de payload em `LlmValidationService.validarFlashcards`.
6. persistencia transacional sem parcialidade.
7. retorno `201` com `ColecaoDetalheResponse` atualizado.

### 4.3 Fluxo aluno (BLOCO 4)

Pendente:
- listagem de colecoes publicadas por turma do aluno;
- detalhe em ordem de cards sem mutacao.

---

## 5. Seguranca e invariantes

Invariantes ativas:
- colecao nasce em `RASCUNHO`;
- apenas dono (ou admin) muta/publica/gera/exclui;
- colecao publicada nao aceita mutacao de cards;
- `textoFrente` e `textoVerso` obrigatorios;
- geracao LLM nao persiste em payload invalido;
- ordem de exibicao por `ordem`.

Autorizacao:
- professor/admin nos endpoints de `/api/v1/colecoes`.
- aluno/admin planejado para `/api/v1/aluno/colecoes`.

---

## 6. Qualidade e validacao

Evidencias recentes:
- `FlashcardControllerIntegrationTest`: 32 testes, 0 falhas, 0 erros.
- suite alvo (`LlmValidationServiceTest`, `FlashcardControllerIntegrationTest`, `ProvaControllerIntegrationTest`): 94 testes, 0 falhas, 0 erros.

Cobertura consolidada do BLOCO 3:
- sucesso com persistencia;
- bloqueio em colecao publicada;
- ownership (`403`);
- inexistente (`404`);
- payload invalido sem persistencia (`400`);
- rate limit (`429`);
- indisponibilidade LLM (`503`).

---

## 7. Riscos residuais

- concorrencia na atribuicao de `ordem` por estrategia `max(ordem)+1` em geracoes simultaneas;
- sem fallback de prompt para flashcards nesta rodada (decisao de escopo);
- consumo por aluno ainda pendente (BLOCO 4).

---

## 8. Proximas atualizacoes previstas

Atualizar este documento quando:
1. BLOCO 4 for concluido;
2. houver mudanca de contrato LLM (ex.: fallback de prompt);
3. houver alteracao na estrategia de ordenacao/confiabilidade em concorrencia.

---

## 9. Referencias de origem

- docs/api/2026-04-19-api-modulo-flashcards-unificado.md
- docs/features/2026-04-19-feature-modulo-flashcards-unificada.md
- Tasks/bloco3-flashcard-llm/execution_receipt.md
- Tasks/bloco3-flashcard-llm/review_memo.md
- Tasks/bloco3-flashcard-llm/final_receipt.md
