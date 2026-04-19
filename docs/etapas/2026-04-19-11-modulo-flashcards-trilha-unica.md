# Etapa: Modulo Flashcards - Trilha unica por blocos

Data: 2026-04-19  
Ordem: 11  
Contexto: registro tecnico acumulado do modulo Flashcards em arquivo unico (documento vivo)

## 1. Objetivo da etapa

Manter um historico unico de execucao tecnica do modulo Flashcards ao longo dos blocos 1-4, evitando consolidacao manual no fim.

Este arquivo deve ser atualizado ao final de cada bloco com:
- escopo executado;
- arquivos principais alterados;
- validacao realizada;
- pendencias para o bloco seguinte.

## 2. Atualizacoes por bloco

### 2.1 Bloco 1 - Fundacao de dominio (concluido)

Objetivo do bloco:
- criar enum, entidades, repositorios e DTOs base do dominio Flashcard.

Resultado:
- concluido com correcoes pos-review aplicadas.

Escopo fechado:
- `StatusColecao`, `ColecoesFlashcard`, `Flashcard`;
- `ColecoesFlashcardRepository`, `FlashcardRepository`;
- DTOs de request/response em `dto/flashcard`;
- DTO interno `FlashcardValidado` em `dto/llm`.

Ajustes pos-review no fechamento:
- alinhamento da contagem de DTOs no task brief;
- registro explicito de que a ordem no DTO interno e derivada no servico.

Validacao:
- build e regressao backend com 136 testes, 0 falhas.

### 2.2 Bloco 2 - API professor (concluido)

Objetivo do bloco:
- implementar camada funcional professor/admin para colecoes e cards manuais no modulo Flashcards.

Resultado:
- concluido com correcoes pos-review aplicadas na etapa final.

Escopo fechado:
- `FlashcardService` com criar/listar/detalhar/atualizar/publicar/despublicar/excluir colecao;
- CRUD manual de flashcards (adicionar/editar/remover);
- `FlashcardController` em `/api/v1/colecoes` com seguranca por role;
- suite de integracao dedicada com cenarios de sucesso, erro de dominio e autorizacao.

Ajustes pos-review no fechamento:
- contrato de professor sem vinculo com turma alinhado para erro de negocio `400`;
- cobertura ampliada para admin, `401` sem autenticacao e `PUT` em `RASCUNHO`/`PUBLICADA`.

Validacao:
- suite dedicada Flashcard: 23 testes, 0 falhas;
- regressao backend: 159 testes, 0 falhas.

### 2.3 Bloco 3 - Geracao LLM (nao iniciado)

Escopo alvo:
- criar prompt de geracao de flashcards;
- estender `LlmService` e `LlmValidationService`;
- adicionar endpoint de geracao e testes de integracao com mock.

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

### 3.3 Blocos futuros

- preencher ao final de cada bloco concluido.

## 4. Invariantes acumuladas

- colecao inicia em `RASCUNHO`;
- colecao exige professor e turma;
- card exige colecao;
- composicao com `cascade = ALL` + `orphanRemoval = true`;
- ordenacao por `ordem` no agregado da colecao.

## 5. Testes e validacao acumulada

### Bloco 1
- regressao global backend executada;
- resultado final: 136 testes, 0 falhas, 0 erros, 0 skipped.

### Bloco 2
- suite dedicada de integracao de Flashcards executada;
- resultado: 23 testes, 0 falhas, 0 erros, 0 skipped;
- regressao global backend executada;
- resultado: 159 testes, 0 falhas, 0 erros, 0 skipped.

### Blocos 3 e 4
- pendente.

## 6. Pendencias abertas

- implementar geracao via LLM (BLOCO 3);
- implementar camada aluno (BLOCO 4);
- adicionar suites dedicadas dos blocos 3 e 4 conforme os novos fluxos.

## 7. Regra de manutencao deste documento

Ao finalizar cada bloco:
1. atualizar secao 2 com o status e resumo do bloco;
2. atualizar secao 3 com arquivos centrais alterados;
3. atualizar secao 5 com evidencias de testes;
4. revisar secao 6 para remover pendencias fechadas e adicionar novas.

## 8. Referencias de origem

- `docs/planejamento/2026-04-13-guia-implementacao-modulo-flashcards.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/final_receipt.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/review_memo.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/review_memo.md`
- `Tasks/bloco2-flashcard-professor/final_receipt.md`
