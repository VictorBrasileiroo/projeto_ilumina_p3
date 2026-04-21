# Feature Unificada - Modulo Flashcards

Data de atualizacao: 2026-04-20
Escopo: consolidacao funcional do modulo Flashcards em arquivo unico (documento vivo)

---

## 1. Objetivo da feature unificada

Consolidar em um unico documento a evolucao funcional do modulo Flashcards, reunindo:
- fundacao de dominio;
- API professor/admin;
- geracao automatica por IA;
- visao de consumo para aluno.

Este arquivo deve ser atualizado a cada bloco para evitar consolidacao manual no fim da trilha.

---

## 2. Problema de negocio alvo

Sem o modulo Flashcards, a plataforma entrega apenas avaliacao formal.
A feature resolve a trilha de revisao assincrona por turma, permitindo:
1. criacao de colecoes pelo professor;
2. adicao manual e/ou geracao por IA;
3. publicacao para turma;
4. estudo em formato frente/verso.

---

## 3. Escopo entregue por bloco

| Bloco | Entrega | Status |
|---|---|---|
| 1 | Entidades, repositorios e DTOs base | Concluido |
| 2 | API professor/admin para CRUD e publicacao | Concluido |
| 3 | Geracao LLM e validacao de resposta | Concluido |
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

- DTOs de request/response em `dto/flashcard`.
- DTO interno `FlashcardValidado` em `dto/llm`.

### 4.4 API professor/admin (BLOCO 2)

- `FlashcardController` em `/api/v1/colecoes`.
- `FlashcardService` com CRUD manual de colecao/cards.
- publicar/despublicar colecao.
- exclusao de colecao com cascade.

### 4.5 Geracao via LLM (BLOCO 3)

- prompt `gerar-flashcards-main.txt` adicionado em resources.
- extensao de `LlmService`/`LlmServiceImpl` com `gerarFlashcards`.
- `LlmValidationService.validarFlashcards` para payload com raiz `flashcards`.
- endpoint `POST /api/v1/colecoes/{id}/gerar-flashcards`.
- fluxo com ownership + `RASCUNHO` + rate limit + validacao antes de persistencia.

### 4.6 Testes

- suite de integracao de Flashcards ampliada para BLOCO 3.
- cobertura de sucesso e caminhos operacionais criticos (`400`, `403`, `404`, `429`, `503`).
- regressao de Provas preservada apos extensoes em camada LLM compartilhada.

---

## 5. Regras de negocio da feature

- Colecao nasce em `RASCUNHO`.
- Apenas professor criador pode mutar/publicar/excluir (admin com bypass previsto).
- Colecao publicada nao e editavel sem despublicar.
- `textoFrente` e `textoVerso` sao obrigatorios.
- Ordem de exibicao dos cards e definida por `ordem`.
- Geracao LLM so persiste quando payload valida estrutura e conteudo esperados.

---

## 6. Correcoes pos-review acumuladas

Correcoes aplicadas no fechamento do BLOCO 1:
1. alinhamento documental da contagem de DTOs;
2. registro explicito de que a ordem no DTO interno e derivada no service.

Correcoes aplicadas no fechamento do BLOCO 2:
3. alinhamento de contrato no cenario de professor sem vinculo (`400`);
4. ampliacao de cobertura para admin, `401` sem autenticacao e `PUT` em `RASCUNHO`/`PUBLICADA`.

Correcoes aplicadas no fechamento do BLOCO 3:
5. ajuste de mensagens de indisponibilidade na camada LLM para dominio correto (`questoes`/`flashcards`);
6. ampliacao de cobertura de integracao para sucesso admin, `429` e `503` no endpoint de geracao.

---

## 7. Qualidade e validacao consolidada

Evidencias recentes:
- suite `FlashcardControllerIntegrationTest`: 32 testes, 0 falhas, 0 erros.
- suite alvo de regressao (`LlmValidationServiceTest`, `FlashcardControllerIntegrationTest`, `ProvaControllerIntegrationTest`): 94 testes, 0 falhas, 0 erros.

---

## 8. Fora de escopo consolidado (ate o momento)

- dashboard de desempenho de flashcards;
- rastreamento de cards estudados;
- classificacao dificil/facil (spaced repetition);
- importacao de cards por arquivo;
- flashcards com imagem.

---

## 9. Riscos residuais conhecidos

- risco de concorrencia na atribuicao de `ordem` em insercoes/geracoes simultaneas (`max(ordem)+1`);
- ausencia de fallback de prompt para flashcards nesta rodada (decisao de escopo);
- consumo por aluno ainda pendente de BLOCO 4.

---

## 10. Resultado atual da feature

Classificacao operacional atual:
- em andamento.

Estado:
- BLOCO 1, BLOCO 2 e BLOCO 3 concluidos;
- falta BLOCO 4 (API aluno) para fechamento completo da trilha funcional.

---

## 11. Referencias de origem

- docs/api/2026-04-19-api-modulo-flashcards-unificado.md
- docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md
- Tasks/bloco3-flashcard-llm/execution_receipt.md
- Tasks/bloco3-flashcard-llm/review_memo.md
- Tasks/bloco3-flashcard-llm/final_receipt.md
