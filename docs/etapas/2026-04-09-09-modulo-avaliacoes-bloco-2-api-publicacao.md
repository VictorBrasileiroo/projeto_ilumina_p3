# Etapa: Modulo Avaliacoes - Bloco 2 (API e publicacao)

Data: 2026-04-09
Ordem: 09
Contexto: implementacao da API de professor para ciclo de prova e fechamento pos-review

## 1. Objetivo da etapa

Concluir o Bloco 2 do modulo de avaliacoes com:
- API de professor/admin para provas, questoes e alternativas;
- regras de ownership, status, vinculacao e publicacao;
- cobertura de integracao ponta a ponta;
- correcao dos pontos medios encontrados no review da etapa anterior.

## 2. Passo a passo de execucao por etapa do protocolo

## 2.1 Etapa 0 - Triage

Entrada: pedido de continuidade da task bloco2-avaliacao-api-publicacao.

Saida:
- classificacao como feature media/grande com risco alto em autorizacao e integridade.
- fluxo recomendado com mapeamento, decisao e testes obrigatorios.

## 2.2 Etapa 2 - Task Brief

Consolidacao de escopo:
- AVA-2.1 CRUD de prova;
- AVA-2.2 CRUD de questao/alternativa;
- AVA-2.3 publicar/despublicar;
- AVA-2.4 suite de integracao.

Ambiguidades tratadas no brief:
- H1 vinculo professor-turma;
- H2 reordenacao apos remocao;
- H3 despublicacao com respostas (dependente de modulo futuro).

## 2.3 Etapa 3 - Context Map

Mapeamento confirmou:
- fundacao de dominio pronta (entidades/repositorios/dtos);
- ausencia de ProvaService e ProvaController no ponto de partida;
- padrao do projeto: identidade por email no principal + resolucao no service;
- GlobalExceptionHandler com BusinessException -> 400 e AccessDenied -> 403.

## 2.4 Etapa 4 - Decision Memo

Decisao:
- implementar bloco completo com regras no service e controller enxuto;
- manter padrao de identidade por email;
- garantir cobertura de integracao para cenarios de regra e autorizacao;
- registrar H3 como TODO por dependencia de modulo inexistente.

## 2.5 Etapa 5 - Execution

Implementacoes realizadas:
- criacao de ProvaService;
- criacao de ProvaController;
- criacao da suite ProvaControllerIntegrationTest.

Entregas funcionais:
- 11 endpoints do bloco 2 ativos;
- ownership e status guards em service;
- validacoes de publicacao (RN-02/03/05);
- reordenacao de questoes sem gaps.

Validacao:
- suite de prova verde;
- suite completa backend verde, sem regressao.

## 2.6 Etapa 6 - Review

Resultado da revisao:
- sem problemas graves;
- dois problemas medios identificados:
  - PM-1: admin sem perfil professor recebia 403 generico ao criar prova;
  - PM-2: ordem duplicada de questao permitida silenciosamente.

Recomendacao da revisao:
- pode subir com ressalvas, condicionada ao tratamento de PM-1 e PM-2.

## 2.7 Etapa 7 - Final e correcoes pos-review

Correcoes aplicadas:
- PM-1 resolvido com BusinessException explicita (400) para admin sem perfil professor na criacao;
- PM-2 resolvido com validacao de ordem unica por prova em adicionar/atualizar questao;
- novos testes de integracao para os dois cenarios;
- assercao adicional para totalQuestoes = 0 na criacao.

Evidencia final:
- ProvaControllerIntegrationTest: 32 testes, 0 falhas;
- backend completo: 96 testes, 0 falhas, 0 erros.

## 3. Arquivos centrais alterados na etapa

- backend/src/main/java/br/com/ilumina/controller/Prova/ProvaController.java
- backend/src/main/java/br/com/ilumina/service/Prova/ProvaService.java
- backend/src/main/java/br/com/ilumina/repository/Prova/QuestaoRepository.java
- backend/src/test/java/br/com/ilumina/controller/Prova/ProvaControllerIntegrationTest.java

## 4. Invariantes consolidados

- professor nao acessa prova de outro professor;
- mutacao de prova/questao/alternativa so em RASCUNHO;
- prova so publica quando integra;
- ordem de questao unica por prova;
- remocao de questao mantem sequencia sem gaps;
- criacao de prova exige perfil de professor no dominio e vinculo com turma.

## 5. Pendencias abertas (nao bloqueantes para etapa 09)

- H3: bloquear despublicacao quando houver respostas de aluno (depende de modulo futuro);
- coberturas opcionais remanescentes da revisao (ownership update/delete cruzado, alternativa em questao errada, etc.).

## 6. Resultado da etapa

Etapa 09 concluida com sucesso para o escopo do Bloco 2.

Estado tecnico:
- pronto com ressalvas controladas e documentadas.
