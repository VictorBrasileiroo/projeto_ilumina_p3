# Etapa: Modulo Flashcards - Trilha unica por blocos

Data de atualizacao: 2026-04-20
Ordem: 11
Contexto: registro tecnico acumulado do modulo Flashcards em arquivo unico (documento vivo)

## 1. Objetivo da etapa

Manter um historico unico de execucao tecnica do modulo Flashcards ao longo dos blocos 1-4.

Este arquivo deve ser atualizado ao final de cada bloco com:
- escopo executado;
- arquivos principais alterados;
- validacao realizada;
- pendencias para o bloco seguinte.

## 2. Atualizacoes por bloco

### 2.1 Bloco 1 - Fundacao de dominio (concluido)

Escopo fechado:
- `StatusColecao`, `ColecoesFlashcard`, `Flashcard`;
- `ColecoesFlashcardRepository`, `FlashcardRepository`;
- DTOs de request/response em `dto/flashcard`;
- DTO interno `FlashcardValidado` em `dto/llm`.

Validacao:
- regressao backend com 136 testes, 0 falhas.

### 2.2 Bloco 2 - API professor/admin (concluido)

Escopo fechado:
- `FlashcardService` com criar/listar/detalhar/atualizar/publicar/despublicar/excluir colecao;
- CRUD manual de flashcards (adicionar/editar/remover);
- `FlashcardController` em `/api/v1/colecoes` com seguranca por role;
- suite de integracao dedicada.

Validacao:
- suite Flashcard: 23 testes, 0 falhas;
- regressao backend: 159 testes, 0 falhas.

### 2.3 Bloco 3 - Geracao LLM (concluido)

Escopo fechado:
- prompt `gerar-flashcards-main.txt`;
- extensao `LlmService` e `LlmServiceImpl` com `gerarFlashcards`;
- validacao `LlmValidationService.validarFlashcards`;
- endpoint `POST /api/v1/colecoes/{id}/gerar-flashcards`;
- rate limit e validacao sem persistencia parcial;
- ajuste de mensagens de indisponibilidade por dominio;
- ampliacao de testes para `429` e `503`.

Validacao:
- suite alvo (`LlmValidationServiceTest`, `FlashcardControllerIntegrationTest`, `ProvaControllerIntegrationTest`): 94 testes, 0 falhas, 0 erros.

### 2.4 Bloco 4 - Visao aluno (nao iniciado)

Escopo alvo:
- implementar `AlunoFlashcardService`;
- implementar `AlunoFlashcardController`;
- criar testes de listagem/detalhe e seguranca de acesso.

## 3. Arquivos centrais alterados por bloco

### 3.1 Bloco 1

- `backend/src/main/java/br/com/ilumina/entity/Flashcard/StatusColecao.java`
- `backend/src/main/java/br/com/ilumina/entity/Flashcard/ColecoesFlashcard.java`
- `backend/src/main/java/br/com/ilumina/entity/Flashcard/Flashcard.java`
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/ColecoesFlashcardRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/FlashcardRepository.java`
- `backend/src/main/java/br/com/ilumina/dto/flashcard/*.java`
- `backend/src/main/java/br/com/ilumina/dto/llm/FlashcardValidado.java`

### 3.2 Bloco 2

- `backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java`
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java`
- `backend/src/test/java/br/com/ilumina/controller/Flashcard/FlashcardControllerIntegrationTest.java`

### 3.3 Bloco 3

- `backend/src/main/resources/prompts/gerar-flashcards-main.txt`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmService.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmServiceImpl.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmValidationService.java`
- `backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java`
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java`
- `backend/src/test/java/br/com/ilumina/service/Llm/LlmServiceMock.java`
- `backend/src/test/java/br/com/ilumina/controller/Flashcard/FlashcardControllerIntegrationTest.java`
- `backend/src/test/java/br/com/ilumina/service/Llm/LlmValidationServiceTest.java`

## 4. Invariantes acumuladas

- colecao inicia em `RASCUNHO`;
- colecao exige professor e turma;
- card exige colecao;
- composicao com `cascade = ALL` + `orphanRemoval = true`;
- ordenacao por `ordem` no agregado da colecao;
- geracao LLM nao persiste em payload invalido;
- rate limit aplicado no fluxo de geracao.

## 5. Pendencias abertas

- implementar BLOCO 4 (visao aluno);
- avaliar backlog tecnico pos-BLOCO 4 (fallback de prompt e hardening de concorrencia).

## 6. Referencias de origem

- Tasks/bloco1-flashcard-fundacao-dominio/final_receipt.md
- Tasks/bloco2-flashcard-professor/final_receipt.md
- Tasks/bloco3-flashcard-llm/final_receipt.md
- docs/features/2026-04-19-feature-modulo-flashcards-unificada.md
