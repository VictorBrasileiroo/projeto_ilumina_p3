# Feature: Modulo Avaliacoes - Bloco 2 (API e publicacao)

Data: 2026-04-09
Status: implementado
Escopo: backend API (visao professor/admin)

## 1. Objetivo da feature

Concluir o Bloco 2 do modulo de avaliacoes, entregando API operacional para o ciclo de autoria de provas por professor:
- criar, listar, detalhar, atualizar e excluir prova;
- adicionar, atualizar e remover questoes;
- atualizar alternativa;
- publicar e despublicar prova com guards de integridade.

## 2. Problema resolvido

Antes desta feature, o dominio Prova tinha fundacao (entidades, repositorios e DTOs), mas nao possuia camada de servico, endpoints e cobertura de integracao para operacao real.

Com esta entrega, o sistema passa a suportar o ciclo manual completo de prova no backend, com regras de ownership e estado aplicadas.

## 3. Escopo implementado

## 3.1 Camadas entregues

- Service:
  - br.com.ilumina.service.Prova.ProvaService
- Controller:
  - br.com.ilumina.controller.Prova.ProvaController
- Testes de integracao:
  - br.com.ilumina.controller.Prova.ProvaControllerIntegrationTest

## 3.2 Endpoints entregues

- POST /api/v1/provas
- GET /api/v1/provas
- GET /api/v1/provas/{id}
- PUT /api/v1/provas/{id}
- DELETE /api/v1/provas/{id}
- POST /api/v1/provas/{provaId}/questoes
- PUT /api/v1/provas/{provaId}/questoes/{questaoId}
- DELETE /api/v1/provas/{provaId}/questoes/{questaoId}
- PUT /api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId}
- PATCH /api/v1/provas/{id}/publicar
- PATCH /api/v1/provas/{id}/despublicar

## 3.3 Regras de negocio aplicadas

- status guard: mutacoes somente em RASCUNHO;
- ownership guard: professor so opera prova propria (admin com bypass de ownership);
- H1: validacao de vinculo professor-turma em criacao e troca de turma;
- RN-02/RN-05: gabarito e alternativas validados;
- guard de publicacao: prova precisa estar integra para publicar;
- H2: remocao de questao com reordenacao sem gaps;
- totalQuestoes com contagem real (countByProvaId).

## 4. Correcao pos-review incluida nesta feature

PM-1:
- ajuste para admin sem perfil de professor na criacao de prova:
  - retorno 400 com mensagem explicita de regra de negocio.

PM-2:
- bloqueio de ordem duplicada na mesma prova em:
  - adicionarQuestao;
  - atualizarQuestao.
- suporte de consulta no repositorio de questoes para detectar conflito de ordem.

## 5. Fora de escopo

- endpoints de aluno para listar provas, responder e consultar resultado;
- geracao de questoes via LLM;
- bloqueio de despublicacao por respostas de aluno (H3 depende de modulo futuro).

## 6. Qualidade e validacao

Resultados apos conclusao + correcao pos-review:
- suite do modulo Prova: 32/32 passando;
- regressao backend completa: 96/96 passando;
- zero falhas e zero erros.

## 7. Riscos residuais conhecidos

- H3 pendente por dependencia externa (modulo de respostas do aluno);
- potencial N+1 em listagem admin com base muito grande;
- baixa probabilidade de concorrencia em operacoes simultaneas de reordenacao/publicacao.

## 8. Resultado da feature

Feature concluida para o escopo do Bloco 2.

Entrega habilita operacao de professor para provas em producao com ressalvas documentadas e nao bloqueantes para este bloco.
