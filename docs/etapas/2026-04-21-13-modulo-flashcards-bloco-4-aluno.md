# Etapa 13 - Modulo Flashcards BLOCO 4 (Consumo Aluno)

Data: 2026-04-21
Status: concluida

---

## 1. Objetivo

Concluir o BLOCO 4 do modulo Flashcards com a visao segura do aluno para consumo de colecoes publicadas.

A entrega deveria permitir:
- listar colecoes publicadas disponiveis nas turmas do aluno;
- detalhar uma colecao com flashcards em ordem;
- bloquear acesso a colecao em rascunho;
- bloquear acesso a colecao de outra turma;
- manter o fluxo professor/admin sem regressao;
- nao criar mutacoes para aluno.

---

## 2. Escopo executado

Arquivos criados:
- `backend/src/main/java/br/com/ilumina/service/Flashcard/AlunoFlashcardService.java`
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/AlunoFlashcardController.java`
- `backend/src/test/java/br/com/ilumina/controller/Flashcard/AlunoFlashcardControllerIntegrationTest.java`

Arquivos existentes preservados:
- `FlashcardController`
- `FlashcardService`
- entidades e repositories de Flashcards
- configuracao global de seguranca

---

## 3. Decisao tecnica aplicada

Foi aplicada a estrategia de service/controller dedicados ao aluno, espelhando o padrao ja consolidado em `AlunoProvaService` e `AlunoProvaController`.

Motivos:
- separar autoria de consumo;
- manter ownership de professor/admin fora do fluxo aluno;
- concentrar regra critica no service;
- reduzir risco de exposicao indevida de conteudo.

---

## 4. Fluxo implementado

### 4.1 Listagem

Endpoint:
- `GET /api/v1/aluno/colecoes`

Fluxo:
1. controller exige `ADMIN` ou `ALUNO`;
2. service resolve aluno por email autenticado;
3. service busca turmas do aluno;
4. se nao houver turmas, retorna lista vazia;
5. repository busca colecoes por turmas + `StatusColecao.PUBLICADA`;
6. service ordena por `createdAt` desc;
7. resposta usa `ColecaoAlunoResponse`.

### 4.2 Detalhe

Endpoint:
- `GET /api/v1/aluno/colecoes/{id}`

Fluxo:
1. service resolve aluno por email autenticado;
2. service busca colecao por id;
3. se nao existir, retorna 404;
4. se nao estiver `PUBLICADA`, retorna 403;
5. se aluno nao estiver matriculado na turma da colecao, retorna 403;
6. flashcards sao carregados por `ordem ASC`;
7. resposta usa `ColecaoDetalheAlunoResponse`.

---

## 5. Invariantes garantidas

- Aluno lista apenas colecoes `PUBLICADA` das turmas em que esta matriculado.
- Aluno sem turmas recebe `data: []`.
- Colecao em `RASCUNHO` nao fica disponivel para aluno.
- Colecao de outra turma nao fica disponivel para aluno.
- Colecao inexistente retorna 404.
- Cards no detalhe retornam em ordem crescente.
- Professor nao acessa endpoint de aluno.
- Aluno nao acessa endpoint professor/admin.
- Endpoint de aluno e somente leitura.

---

## 6. Testes implementados

Classe:
- `AlunoFlashcardControllerIntegrationTest`

Cenarios:
1. listagem retorna apenas publicadas das turmas do aluno;
2. aluno sem turmas retorna lista vazia;
3. detalhe de colecao publicada retorna OK e cards em ordem;
4. detalhe de colecao de outra turma retorna 403;
5. detalhe de colecao rascunho retorna 403;
6. detalhe de colecao inexistente retorna 404;
7. professor tentando endpoint de aluno retorna 403;
8. aluno tentando endpoint professor retorna 403.

---

## 7. Evidencia de validacao

Suite alvo registrada no fechamento:

```bash
mvn -Dtest=br.com.ilumina.controller.Flashcard.AlunoFlashcardControllerIntegrationTest,br.com.ilumina.controller.Flashcard.FlashcardControllerIntegrationTest,br.com.ilumina.controller.Prova.AlunoProvaControllerIntegrationTest test
```

Resultado:
- BUILD SUCCESS
- 55 testes executados
- 0 falhas
- 0 erros

---

## 8. Resultado do review

Review tecnico:
- recomendacao: pode subir com ressalvas;
- problemas graves: nenhum comprovado;
- problemas medios: nenhum relevante;
- principal ressalva inicial: reexecucao independente dos testes nao havia sido possivel naquela etapa;
- pos-review: suite alvo reexecutada com 55/55 testes passando.

---

## 9. Riscos residuais aceitos

- Politica de `ADMIN` no endpoint de aluno segue padrao de provas: passa no controller, mas precisa resolver para perfil `Aluno` no service.
- Listagem ordena por `createdAt` desc, mas o DTO de aluno nao expoe esse campo.
- Nao ha teste explicito de metodos de escrita no endpoint de aluno; o controller nao expoe mappings de escrita.
- Custo de `countByColecaoId` por colecao e aceitavel no escopo atual.

---

## 10. Resultado funcional

BLOCO 4 considerado entregue:
- consumo por aluno implementado;
- isolamento por turma preservado;
- rascunho protegido;
- inexistente distinguido corretamente como 404;
- regressao professor/admin e aluno-prova validada;
- documentacao consolidada atualizada em API, arquitetura e feature.

---

## 11. Referencias

- `tasks/bloco4-flashcard-aluno/decision_memo.md`
- `tasks/bloco4-flashcard-aluno/execution_receipt.md`
- `tasks/bloco4-flashcard-aluno/review_memo.md`
- `tasks/bloco4-flashcard-aluno/final_receipt.md`
- `tasks/bloco4-flashcard-aluno/delivery_pack.md`
- `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- `docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md`
- `docs/features/2026-04-19-feature-modulo-flashcards-unificada.md`
