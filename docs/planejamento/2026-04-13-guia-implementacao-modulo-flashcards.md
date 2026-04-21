# Guia de Implementacao - Modulo Flashcards

Data de atualizacao: 2026-04-20
Status do guia: atualizado para contexto pos BLOCO 3

---

## 1. Objetivo do documento

Este guia passou de plano de implementacao inicial para plano de fechamento do modulo.
Ele registra:
- o que ja foi concluido nos blocos 1, 2 e 3;
- o que falta para fechar o modulo (BLOCO 4);
- backlog tecnico opcional para rodada futura.

---

## 2. Estado atual confirmado

Concluido:
- BLOCO 1: fundacao de dominio (entidades/repositorios/DTOs).
- BLOCO 2: API professor/admin para CRUD/publicacao.
- BLOCO 3: geracao via LLM com validacao defensiva, rate limit e testes operacionais.

Pendente:
- BLOCO 4: API aluno para listagem e detalhe de colecoes publicadas.

---

## 3. Escopo remanescente (BLOCO 4)

### 3.1 Entregas esperadas

- `AlunoFlashcardService` com regras de visibilidade por matricula.
- `AlunoFlashcardController` em `/api/v1/aluno/colecoes`.
- endpoint de listagem de colecoes publicadas do aluno.
- endpoint de detalhe de colecao publicada com cards em ordem.
- testes de integracao cobrindo acesso permitido/negado e contratos HTTP.

### 3.2 Regras obrigatorias

- aluno so acessa colecoes publicadas.
- aluno so acessa colecoes das turmas em que esta matriculado.
- endpoint de aluno nao pode expor rotas de mutacao.

### 3.3 Fora de escopo nesta rodada

- rastreamento de estudo por card;
- desempenho por aluno;
- repeticao espacada;
- avaliacao tipo quiz em flashcards.

---

## 4. Dependencias e precondicoes

- manter padrao de seguranca e envelope `ApiResponse<T>`.
- preservar regressao dos modulos existentes (especialmente Provas e Flashcards professor).
- manter consistencia de mensagens e codigos de erro com `GlobalExceptionHandler`.

---

## 5. Estrategia recomendada de execucao (BLOCO 4)

1. Criar DTOs de resposta de aluno (se necessario ajustar os existentes).
2. Implementar `AlunoFlashcardService` com filtros de turma e status.
3. Implementar `AlunoFlashcardController` com `@PreAuthorize` apropriado.
4. Cobrir testes de integracao (happy path + autorizacao + isolamento por turma).
5. Rodar regressao alvo e registrar receipt.

---

## 6. Matriz de risco atual

| Risco | Nivel | Mitigacao |
|---|---|---|
| Exposicao indevida de colecao para aluno de outra turma | Alto | Validar matricula no service + testes de negacao |
| Regressao em fluxo professor ao adicionar endpoints aluno | Medio | Manter contratos existentes e rodar suite de regressao |
| Divergencia de contrato API entre docs e codigo | Medio | Atualizar docs/api no mesmo PR |

---

## 7. Backlog tecnico opcional (pos BLOCO 4)

- fallback de prompt para flashcards em resposta invalida da LLM;
- hardening de concorrencia para atribuicao de `ordem`;
- melhoria de observabilidade (logs de dominio por tipo de geracao).

---

## 8. Referencias de origem

- docs/api/2026-04-19-api-modulo-flashcards-unificado.md
- docs/features/2026-04-19-feature-modulo-flashcards-unificada.md
- docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md
- Tasks/bloco3-flashcard-llm/final_receipt.md
