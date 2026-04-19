# Estado Atual do Sistema - Modulo Flashcards

Data: 2026-04-19  
Escopo: consolidacao arquitetural do modulo Flashcards em arquivo unico (documento vivo)

---

## 1. Resumo executivo

O modulo Flashcards evoluiu da fundacao de dominio (BLOCO 1) para operacao professor/admin (BLOCO 2):
- entidades, repositorios e DTOs base consolidados;
- API professor/admin implementada em `/api/v1/colecoes`;
- regras de ownership, editabilidade em `RASCUNHO` e publicacao ativas;
- cobertura de integracao dedicada e regressao global validadas.

Estado de maturidade atual:
- Bloco 1: concluido;
- Bloco 2: concluido;
- Bloco 3: nao iniciado;
- Bloco 4: nao iniciado.

Este documento sera atualizado ao final de cada bloco para manter um unico historico arquitetural do modulo.

---

## 2. Linha do tempo de maturidade

| Bloco | Entrega principal | Maturidade adicionada |
|---|---|---|
| 1 | Entidades + repositorios + DTOs base | Fundacao do agregado de colecoes/cards |
| 2 | API professor (service + controller + testes) | Operacao professor/admin de ponta a ponta |
| 3 | Geracao LLM e validacao de flashcards | Nao iniciado |
| 4 | API aluno (leitura de colecoes) | Nao iniciado |

---

## 3. Arquitetura em camadas (estado consolidado)

### 3.1 Controller layer

- `FlashcardController` implementado (professor/admin)
- `AlunoFlashcardController` planejado para BLOCO 4

### 3.2 Service layer

- `FlashcardService` implementado com CRUD de colecao/card, publicar/despublicar e guards de dominio
- `AlunoFlashcardService` planejado para BLOCO 4

### 3.3 Repository layer

Consolidado nos BLOCOS 1 e 2:
- `ColecoesFlashcardRepository`
- `FlashcardRepository`

### 3.4 Domain/entity layer

Implementado no BLOCO 1 e reutilizado no BLOCO 2:
- `StatusColecao`
- `ColecoesFlashcard`
- `Flashcard`

Padrao preservado:
- heranca de `BaseEntity` (UUID + auditoria);
- FKs obrigatorias para `Professor` e `Turma`;
- composicao com `cascade = ALL` + `orphanRemoval = true`;
- ordenacao por `ordem` no agregado da colecao.

---

## 4. Modelo de dados atual

### 4.1 Estruturas centrais ja implementadas

- `colecoes_flashcard`: metadados da colecao (titulo, tema, qnt_cards, status, professor, turma)
- `flashcards`: cards da colecao (texto_frente, texto_verso, ordem, id_colecao)

### 4.2 Relacoes-chave

- `Professor 1:N ColecoesFlashcard`
- `Turma 1:N ColecoesFlashcard`
- `ColecoesFlashcard 1:N Flashcard`

### 4.3 Contratos DTO atuais (BLOCO 1)

- requests de colecao/card para professor (`Create*` e `Update*`);
- responses de colecao/card para professor (`ColecaoResponse`, `ColecaoDetalheResponse`, `FlashcardResponse`);
- responses de aluno ja modeladas para BLOCO 4;
- DTO interno LLM `FlashcardValidado` (texto, com ordem derivada no servico) para BLOCO 3.

---

## 5. Fluxos arquiteturais principais

### 5.1 Fluxo professor/admin (BLOCO 2)

1. usuario autenticado com `ROLE_PROFESSOR` ou `ROLE_ADMIN` chama `/api/v1/colecoes`.
2. controller extrai `Authentication.getName()` e delega ao service.
3. service resolve professor por email e valida escopo (ownership para nao-admin).
4. mutacoes aplicam guard de `RASCUNHO` e validacoes de integridade.
5. sucesso retorna `ApiResponse<T>` e erros passam pelo `GlobalExceptionHandler`.

### 5.2 Fluxo LLM (BLOCO 3 - planejado)

- gerar cards por tema/quantidade com validacao defensiva antes de persistir.

### 5.3 Fluxo aluno (BLOCO 4 - planejado)

- listar colecoes publicadas para turmas do aluno;
- detalhar cards em ordem sem capacidades de mutacao.

---

## 6. Seguranca e autorizacao

Autorizacao implementada no BLOCO 2:
- professor/admin em `/api/v1/colecoes`.

Autorizacao planejada:
- aluno/admin em `/api/v1/aluno/colecoes` (BLOCO 4).

Invariantes de acesso esperadas:
- ownership da colecao por professor criador;
- visibilidade por turma para aluno;
- edicao apenas em status `RASCUNHO`.

---

## 7. Invariantes consolidadas do modulo

- colecao nasce em `RASCUNHO`;
- colecao exige professor e turma;
- professor sem vinculo da turma na criacao recebe erro de negocio (`400`);
- admin sem perfil professor nao cria colecao nova (erro de negocio `400`);
- professor nao dono recebe `403` em operacoes de recurso existente;
- card exige colecao;
- composicao evita orfaos;
- ordenacao por `ordem` e parte do modelo.

---

## 8. Qualidade e validacao

Evidencias consolidadas:
- BLOCO 1: regressao backend `136` testes, `0` falhas, `0` erros.
- BLOCO 2: suite dedicada Flashcard `23` testes, `0` falhas, `0` erros.
- BLOCO 2: regressao backend `159` testes, `0` falhas, `0` erros.

---

## 9. Riscos residuais e pontos de atencao

- insercoes concorrentes de cards podem disputar a mesma `ordem` (`max(ordem) + 1`) sem lock/versionamento;
- desempenho de detalhe/listagem pode demandar ajuste sob volume alto;
- regras de geracao por LLM ainda dependem do BLOCO 3.

---

## 10. Proximas atualizacoes previstas

Quando atualizar este documento:
1. ao fechar BLOCO 3 (LLM);
2. ao fechar BLOCO 4 (visao aluno).

Em cada atualizacao, registrar:
- mudancas arquiteturais;
- novos fluxos consolidados;
- riscos mitigados/residuais;
- validacao de testes.

---

## 11. Referencias de origem

- `docs/planejamento/2026-04-13-guia-implementacao-modulo-flashcards.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/final_receipt.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/review_memo.md`
- `Tasks/bloco1-flashcard-fundacao-dominio/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/execution_receipt.md`
- `Tasks/bloco2-flashcard-professor/review_memo.md`
- `Tasks/bloco2-flashcard-professor/final_receipt.md`
