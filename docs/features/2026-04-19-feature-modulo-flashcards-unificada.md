# Feature Unificada - Modulo Flashcards

Data de atualizacao: 2026-04-21
Escopo: feature funcional completa do modulo Flashcards no backend

---

## 1. Objetivo da feature

O modulo Flashcards adiciona uma trilha de estudo e revisao assincrona a plataforma Ilumina.

Ele permite que professores criem colecoes de cards frente/verso, manualmente ou com apoio de LLM, publiquem essas colecoes para turmas e disponibilizem o consumo seguro para alunos matriculados.

Resultado funcional atual:
- professor/admin consegue gerir colecoes e cards;
- professor/admin consegue gerar cards por IA;
- aluno consegue listar e detalhar colecoes publicadas de suas turmas;
- conteudo rascunho e conteudo de outras turmas ficam bloqueados.

---

## 2. Problema de negocio resolvido

Antes da feature, a plataforma ja cobria avaliacoes formais, mas nao tinha um mecanismo de estudo leve e recorrente.

Flashcards resolve:
- revisao rapida por turma;
- preparacao para provas;
- reutilizacao de conteudo pelo professor;
- criacao acelerada por IA;
- consumo controlado por matricula.

O modulo nao substitui Avaliacoes; ele complementa a jornada de aprendizagem com estudo frente/verso sem submissao de respostas.

---

## 3. Personas e capacidades

### 3.1 Professor

Pode:
- criar colecoes para turmas em que esta vinculado;
- editar metadados em rascunho;
- adicionar, editar e remover flashcards em rascunho;
- gerar flashcards por LLM;
- publicar e despublicar colecoes;
- excluir colecoes proprias.

Nao pode:
- editar colecao publicada sem despublicar;
- operar colecao de outro professor.

### 3.2 Admin

Pode:
- listar todas as colecoes;
- detalhar colecoes;
- operar publicacao/despublicacao e cards no fluxo professor/admin;
- ignorar ownership de professor na maioria dos fluxos de gestao.

Observacao:
- no endpoint de aluno, `ADMIN` segue o padrao de provas: a role passa no controller, mas o service exige perfil `Aluno`.

### 3.3 Aluno

Pode:
- listar colecoes publicadas das turmas em que esta matriculado;
- detalhar uma colecao disponivel;
- estudar os flashcards em ordem.

Nao pode:
- criar, editar, excluir, publicar ou despublicar colecoes;
- acessar colecao em rascunho;
- acessar colecao de outra turma;
- acessar endpoints professor/admin.

---

## 4. Escopo entregue por bloco

| Bloco | Entrega | Status |
|---|---|---|
| 1 | Entidades, repositories e DTOs base | concluido |
| 2 | API professor/admin para CRUD, cards e publicacao | concluido |
| 3 | Geracao LLM e validacao defensiva | concluido |
| 4 | API aluno para listagem e detalhe | concluido |

---

## 5. Jornadas funcionais

### 5.1 Criacao e preparo de colecao

1. Professor cria colecao vinculada a uma turma.
2. Colecao nasce em `RASCUNHO`.
3. Professor adiciona cards manualmente ou gera cards por LLM.
4. Professor revisa conteudo.
5. Professor publica.

Criticos:
- professor precisa estar vinculado a turma;
- colecao publicada nao aceita mutacao de cards/metadados;
- cards exigem frente e verso.

### 5.2 Geracao assistida por LLM

1. Professor escolhe tema e quantidade.
2. Backend valida ownership, status e rate limit.
3. Backend chama LLM com prompt dedicado.
4. Backend valida a resposta antes de persistir.
5. Cards validos entram na colecao em ordem sequencial.

Garantias:
- sem persistencia parcial em payload invalido;
- quantidade retornada precisa bater com a solicitada;
- frente/verso vazios ou duplicidade de frente invalidam a resposta.

### 5.3 Publicacao para turma

1. Professor solicita publicacao.
2. Backend exige status `RASCUNHO`.
3. Backend exige ao menos 1 flashcard valido.
4. Colecao passa para `PUBLICADA`.

Efeito:
- alunos matriculados na turma passam a enxergar a colecao no endpoint de aluno.

### 5.4 Consumo por aluno

1. Aluno autenticado chama `GET /api/v1/aluno/colecoes`.
2. Backend resolve aluno por email.
3. Backend busca turmas do aluno.
4. Backend retorna apenas colecoes `PUBLICADA` dessas turmas.
5. Aluno detalha a colecao e recebe flashcards ordenados por `ordem`.

Garantias:
- aluno sem turma recebe lista vazia;
- rascunho retorna 403 no detalhe;
- outra turma retorna 403 no detalhe;
- inexistente retorna 404.

---

## 6. Entregaveis consolidados

### 6.1 Dominio

- `StatusColecao`
- `ColecoesFlashcard`
- `Flashcard`

### 6.2 Persistencia

- `ColecoesFlashcardRepository`
- `FlashcardRepository`

### 6.3 DTOs de professor/admin

- `CreateColecaoRequest`
- `UpdateColecaoRequest`
- `ColecaoResponse`
- `ColecaoDetalheResponse`
- `CreateFlashcardRequest`
- `UpdateFlashcardRequest`
- `FlashcardResponse`
- `GerarFlashcardsRequest`

### 6.4 DTOs de aluno

- `ColecaoAlunoResponse`
- `ColecaoDetalheAlunoResponse`
- `FlashcardAlunoResponse`

### 6.5 API professor/admin

- `FlashcardController`
- `FlashcardService`
- base path `/api/v1/colecoes`

### 6.6 API aluno

- `AlunoFlashcardController`
- `AlunoFlashcardService`
- base path `/api/v1/aluno/colecoes`

### 6.7 LLM

- `LlmService.gerarFlashcards`
- `LlmValidationService.validarFlashcards`
- `RateLimiterService`
- prompt dedicado de flashcards

### 6.8 Testes

- `FlashcardControllerIntegrationTest`
- `AlunoFlashcardControllerIntegrationTest`
- regressao correlata com `AlunoProvaControllerIntegrationTest`
- validacoes LLM em suite dedicada

---

## 7. Regras de negocio

- Colecao nasce em `RASCUNHO`.
- Colecao pertence a um professor e a uma turma.
- Professor so cria colecao para turma em que esta vinculado.
- Professor so opera colecoes proprias, salvo admin.
- Admin pode listar e operar colecoes no fluxo professor/admin.
- Colecao publicada nao aceita alteracao de metadados nem cards.
- Publicacao exige ao menos 1 flashcard.
- `textoFrente` e `textoVerso` sao obrigatorios.
- Ordem dos cards e definida pelo campo `ordem`.
- LLM so persiste resposta validada.
- Aluno so enxerga colecoes `PUBLICADA`.
- Aluno so enxerga colecoes das turmas em que esta matriculado.
- Fluxo aluno e somente leitura.

---

## 8. Criterios de aceite consolidados

### Professor/Admin

- Criar colecao em rascunho.
- Bloquear criacao para turma inexistente ou inativa.
- Bloquear criacao quando professor nao esta vinculado a turma.
- Listar apenas colecoes proprias para professor.
- Listar todas para admin.
- Detalhar colecao com cards ordenados.
- Publicar somente colecao valida.
- Bloquear edicao de colecao publicada.
- Gerar flashcards por LLM com sucesso.
- Bloquear geracao em colecao publicada.
- Bloquear payload invalido sem persistencia parcial.
- Retornar 429 em rate limit.
- Retornar 503 quando LLM esta indisponivel.

### Aluno

- Listar apenas colecoes publicadas das turmas do aluno.
- Retornar lista vazia para aluno sem turmas.
- Detalhar colecao publicada da turma do aluno.
- Retornar cards em ordem crescente.
- Bloquear colecao de outra turma com 403.
- Bloquear colecao rascunho com 403.
- Retornar 404 para colecao inexistente.
- Bloquear professor no endpoint de aluno.
- Bloquear aluno no endpoint professor/admin.

---

## 9. Fora de escopo da feature atual

- progresso individual de estudo;
- submissao de respostas;
- avaliacao de acerto/erro em flashcards;
- spaced repetition;
- dashboards de desempenho;
- importacao por arquivo;
- cards com imagem/audio;
- filtros avancados e paginacao;
- alteracao de Swagger/OpenAPI anotado no controller.

---

## 10. Qualidade e validacao consolidada

Evidencias recentes:
- BLOCO 3: suite alvo com 94 testes, 0 falhas, 0 erros;
- BLOCO 4: suite alvo com 55 testes, 0 falhas, 0 erros;
- review do BLOCO 4 sem problemas graves ou medios comprovados.

Cobertura BLOCO 4:
- 8 cenarios de integracao obrigatorios;
- sucesso de listagem e detalhe;
- negacoes por turma/status/perfil;
- 404 para inexistente;
- regressao de professor/aluno.

---

## 11. Correcoes pos-review acumuladas

Correcoes aplicadas no fechamento do BLOCO 1:
1. alinhamento documental da contagem de DTOs;
2. registro explicito de que a ordem no DTO interno e derivada no service.

Correcoes aplicadas no fechamento do BLOCO 2:
3. alinhamento de contrato no cenario de professor sem vinculo (`400`);
4. ampliacao de cobertura para admin, `401` sem autenticacao e `PUT` em `RASCUNHO`/`PUBLICADA`.

Correcoes aplicadas no fechamento do BLOCO 3:
5. ajuste de mensagens de indisponibilidade na camada LLM para dominio correto (`questoes`/`flashcards`);
6. ampliacao de cobertura de integracao para sucesso admin, `429` e `503`.

Fechamento do BLOCO 4:
7. nenhuma correcao funcional pos-review foi necessaria;
8. suite alvo foi reexecutada na etapa final com 55/55 testes passando.

---

## 12. Riscos residuais conhecidos

| Risco | Impacto | Status |
|---|---|---|
| Concorrencia em `max(ordem)+1` | pode gerar conflito/logica de ordem em insercoes simultaneas | conhecido, nao bloqueante |
| N+1 em contagem de cards por colecao | custo em listagens grandes | aceitavel no volume inicial |
| Rate limiter em memoria | nao distribuido | aceitavel no momento |
| Politica de admin no endpoint aluno | pode exigir decisao de produto | segue padrao de provas |
| Sem progresso de estudo | feature ainda nao mede uso | fora de escopo |

---

## 13. Resultado atual da feature

Classificacao operacional:
- concluida no backend para os blocos 1 a 4.

Pronto para:
- integracao frontend de professor/admin;
- integracao frontend de aluno;
- futura evolucao de UX, progresso e estudo adaptativo.

---

## 14. Referencias de origem

- `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- `docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md`
- `docs/etapas/2026-04-20-12-modulo-flashcards-bloco-3-geracao-llm.md`
- `docs/etapas/2026-04-21-13-modulo-flashcards-bloco-4-aluno.md`
- `tasks/bloco4-flashcard-aluno/final_receipt.md`
- `tasks/bloco4-flashcard-aluno/delivery_pack.md`
