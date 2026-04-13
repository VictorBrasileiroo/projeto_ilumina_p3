# Estado Atual do Sistema - Modulo Avaliacoes 

Data: 2026-04-13  

---

## 1. Resumo executivo

O modulo de avaliacoes evoluiu de fundacao para operacao completa de ponta a ponta:
- autoria de prova por professor/admin (manual + IA);
- publicacao para turmas;
- realizacao de prova por aluno;
- persistencia de resultado por tentativa unica.

Estado funcional consolidado:
- Bloco 1: dominio e contratos base;
- Bloco 2: API de autoria/publicacao;
- Bloco 3: geracao LLM com validacao defensiva;
- Bloco 4: fluxo aluno (listar, detalhar, responder, consultar resultado).

---

## 2. Linha do tempo de maturidade

| Bloco | Entrega principal | Maturidade adicionada |
|---|---|---|
| 1 | Entidades + repositorios + DTOs | Fundacao do agregado Prova |
| 2 | Services + controllers + testes de integracao | Operacao professor/admin |
| 3 | Integracao LLM + fallback + rate limit | Escalabilidade de autoria |
| 4 | Dominio de resposta do aluno + endpoints de resultado | Fechamento do ciclo de avaliacao |

---

## 3. Arquitetura em camadas (estado consolidado)

### 3.1 Controller layer

- `ProvaController` (professor/admin)
- `AlunoProvaController` (aluno/admin)
- Controllers de suporte do sistema (auth, aluno, professor, turma)

### 3.2 Service layer

- `ProvaService` (CRUD, regras de status, publicacao, geracao)
- `AlunoProvaService` (escopo do aluno, submissao e resultado)
- `LlmService` + `LlmValidationService` + `RateLimiterService`

### 3.3 Repository layer

- `ProvaRepository`, `QuestaoRepository`, `AlternativaRepository`
- `RespostaAlunoRepository` (+ repositorio de itens)
- repositorios de identidade e matricula (`User`, `Aluno`, `Turma`)

### 3.4 Domain/entity layer

Nucleo de avaliacao:
- `Prova`
- `Questao`
- `Alternativa`
- `StatusProva`
- `RespostaAluno`
- `ItemRespostaAluno`

Contexto de identidade/acesso:
- `User`, `UserRole`, `Aluno`, `Professor`, `Turma`, associacoes

---

## 4. Modelo de dados consolidado

### 4.1 Estruturas centrais

- `provas`: metadados da prova (titulo, disciplina, status, professor, turma)
- `questoes`: enunciado, gabarito, ordem, pontuacao
- `alternativas`: opcoes A-D por questao
- `resposta_aluno`: cabecalho da tentativa (aluno, prova, nota, total acertos)
- `item_resposta_aluno`: detalhe por questao respondida

### 4.2 Relacoes-chave

- `Professor 1:N Prova`
- `Turma 1:N Prova`
- `Prova 1:N Questao`
- `Questao 1:N Alternativa`
- `Aluno 1:N RespostaAluno`
- `Prova 1:N RespostaAluno`
- `RespostaAluno 1:N ItemRespostaAluno`

### 4.3 Constraints criticas

- `UNIQUE(aluno_id, prova_id)` em `resposta_aluno` (tentativa unica)
- `UNIQUE(resposta_aluno_id, questao_id)` em itens
- validacao de letras de alternativa/gabarito em `A..D`

---

## 5. Fluxos arquiteturais principais

### 5.1 Fluxo A - Autoria manual

Professor/admin:
1. cria prova (RASCUNHO)
2. adiciona/edita questoes e alternativas
3. publica prova

Guards:
- ownership
- status `RASCUNHO`
- integridade da prova antes de publicar

### 5.2 Fluxo B - Autoria por IA (LLM)

Professor/admin:
1. chama `POST /api/v1/provas/{id}/gerar-questoes`
2. backend valida elegibilidade e quantidade restante
3. aplica rate limit
4. chama prompt principal
5. valida RN-06
6. fallback se necessario
7. persiste em transacao unica

### 5.3 Fluxo C - Realizacao pelo aluno

Aluno/admin:
1. lista provas publicadas da turma
2. detalha prova (sem gabarito)
3. submete respostas (tentativa unica)
4. consulta resultado (com gabarito)

---

## 6. Seguranca e autorizacao

Autenticacao:
- JWT obrigatorio nos endpoints do modulo.

Autorizacao por perfil:
- professor/admin no fluxo `/api/v1/provas`
- aluno/admin no fluxo `/api/v1/aluno/provas`

Escopo de acesso:
- ownership no service para professor
- matricula por turma para aluno

Invariante critica:
- gabarito nao e exposto antes da submissao do aluno.

---

## 7. Invariantes consolidadas do modulo

- Prova nasce em `RASCUNHO`.
- Apenas `RASCUNHO` permite mutacoes estruturais.
- Publicacao exige prova integra.
- Gabarito nao vaza em listagem/detalhe de aluno.
- Tentativa unica por aluno/prova.
- Sem persistencia parcial em falha de validacao da LLM.
- Remocao de questao preserva sequencia de ordem.

---

## 8. Qualidade e validacao (historico consolidado)

Evidencias registradas nas docs de bloco:
- Bloco 1: 65 testes passando
- Bloco 2: 96 testes passando
- Bloco 3: 127 testes passando
- Bloco 4: 75 testes passando no recorte final da entrega do aluno

Observacao:
- os numeros refletem snapshots de etapas/recortes diferentes; para release, considerar sempre a suite atual do branch ativo.

---

## 9. Riscos residuais e pontos de atencao

- N+1 em alguns fluxos de listagem/detalhe para alto volume.
- Rate limiter in-memory (nao distribuido).
- Ausencia de migracoes versionadas de schema.
- Bloqueio de despublicacao com respostas de aluno deve ser confirmado no estado final do service.

---

## 10. Estado geral do modulo de avaliacoes

Situacao arquitetural atual:
- modulo ja atende o ciclo principal de negocio (autoria -> publicacao -> resolucao -> resultado);
- arquitetura em camadas preservada;
- contratos de API consistentes entre perfis;
- base pronta para evolucoes de performance, analytics e governanca de dados.

---

## 11. Referencias de origem

- `docs/arquitetura/2026-04-09-estado-atual-do-sistema-modulo-avaliacoes-bloco-1.md`
- `docs/arquitetura/2026-04-09-estado-atual-do-sistema-modulo-avaliacoes-bloco-2.md`
- `docs/arquitetura/2026-04-09-estado-atual-do-sistema-modulo-avaliacoes-bloco-3.md`
- `docs/arquitetura/2026-04-09-estado-atual-do-sistema-modulo-avaliacoes-bloco-4.md`
