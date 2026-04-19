# Feature Unificada - Modulo Flashcards

Data: 2026-04-19  
Escopo: consolidacao funcional do modulo Flashcards em arquivo unico (documento vivo)

---

## 1. Objetivo da feature unificada

Consolidar em um unico documento a evolucao funcional do modulo Flashcards, reunindo:
- fundacao de dominio;
- API professor;
- geracao automatica por IA;
- visao de consumo para aluno.

Este arquivo sera atualizado a cada bloco para evitar a necessidade de um documento agrupador no final.

---

## 2. Problema de negocio alvo

Sem o modulo Flashcards, a plataforma entrega apenas avaliacao formal.
A feature resolve a trilha de revisao assincrona por turma, permitindo:
1. criacao de colecoes pelo professor;
2. adicao manual e/ou geracao por IA;
3. publicacao para a turma;
4. estudo pelo aluno em formato frente/verso.

---

## 3. Escopo entregue por bloco

| Bloco | Entrega | Status |
|---|---|---|
| 1 | Entidades, repositorios e DTOs base | Concluido |
| 2 | API professor/admin para CRUD e publicacao | Concluido |
| 3 | Geracao LLM e validacao de resposta | Nao iniciado |
| 4 | API aluno para listagem e detalhe | Nao iniciado |

---

## 4. Entregaveis consolidados

### 4.1 Dominio

- `StatusColecao`
- `ColecoesFlashcard`
- `Flashcard`

### 4.2 Persistencia

- `ColecoesFlashcardRepository`
- `FlashcardRepository`

### 4.3 Contratos DTO

- DTOs de request/response em `dto/flashcard` para professor e aluno.
- DTO interno `FlashcardValidado` em `dto/llm`.

### 4.4 API professor/admin (BLOCO 2)

- `FlashcardController` em `/api/v1/colecoes`;
- `FlashcardService` com CRUD de colecao/card manual;
- publicar/despublicar colecao;
- exclusao de colecao com cascade.

### 4.5 Testes

- BLOCO 1: regressao global backend validada;
- BLOCO 2: suite dedicada de integracao + regressao global backend validada.

---

## 5. Regras de negocio alvo da feature

- Colecao nasce em `RASCUNHO`.
- Apenas professor criador pode mutar/publicar/excluir.
- Colecao publicada nao e editavel sem despublicar.
- Aluno so visualiza colecoes publicadas de turmas em que esta matriculado.
- `textoFrente` e `textoVerso` sao obrigatorios.
- Ordem de exibicao dos cards e definida por `ordem`.

---

## 6. Correcoes pos-review acumuladas

Correcoes aplicadas no fechamento do BLOCO 1:
1. Alinhamento documental da contagem de DTOs (`11 em dto/flashcard + 1 em dto/llm`).
2. Registro explicito no DTO interno de que a ordem e derivada deterministicamente na camada de servico.

Correcoes aplicadas no fechamento do BLOCO 2:
3. Alinhamento de contrato no cenario de professor nao vinculado a turma para erro de negocio `400`.
4. Ampliacao da cobertura de integracao para cenarios de admin, `401` sem autenticacao e `PUT` de colecao em `RASCUNHO`/`PUBLICADA`.

---

## 7. Qualidade e validacao consolidada

Evidencia atual:
- BLOCO 1: regressao backend `136` testes, `0` falhas, `0` erros.
- BLOCO 2: suite `FlashcardControllerIntegrationTest` com `23` testes, `0` falhas, `0` erros.
- BLOCO 2: regressao backend `159` testes, `0` falhas, `0` erros.

---

## 8. Fora de escopo consolidado (ate o momento)

- dashboard de desempenho de flashcards;
- rastreamento de cards virados/estudados;
- classificacao dificil/facil (spaced repetition);
- importacao de cards por arquivo;
- flashcards com imagem.

---

## 9. Riscos residuais conhecidos

- risco de concorrencia na atribuicao de `ordem` em insercoes simultaneas de card (`max(ordem)+1`);
- regras de consumo para aluno ainda dependentes do BLOCO 4;
- regras de LLM ainda dependentes da implementacao do BLOCO 3.

---

## 10. Resultado atual da feature

Classificacao operacional atual:
- em andamento.

Estado:
- fundacao tecnica e API professor/admin prontas;
- faltam BLOCO 3 (LLM) e BLOCO 4 (visao aluno).

---

## 11. Referencias de origem

- `docs/planejamento/2026-04-13-guia-implementacao-modulo-flashcards.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/final_receipt.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/review_memo.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/review_memo.md`
- `Tasks/bloco2-flashcard-professor/final_receipt.md`
