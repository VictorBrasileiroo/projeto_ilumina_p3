# Etapa: Modulo Avaliacoes - Bloco 3 (geracao LLM)

Data: 2026-04-09
Ordem: 10
Contexto: implementacao da geracao automatica de questoes via IA com fechamento pos-review

## 1. Objetivo da etapa

Concluir o Bloco 3 do modulo de avaliacoes com:
- endpoint de geracao de questoes por tema;
- validacao RN-06 antes de persistir;
- fallback de prompt para resiliencia;
- limite de consumo por professor;
- tratamento de indisponibilidade do provedor externo;
- correcoes dos pontos encontrados no review.

## 2. Passo a passo de execucao por etapa do protocolo

## 2.1 Etapa 0 - Triage

Entrada: pedido para implementar geracao de questoes por LLM no modulo de provas.

Saida:
- classificacao como feature media/grande com risco alto em integridade de dados e dependencia externa;
- recomendacao de fluxo forte com mapeamento, decisao, execucao e review obrigatorios.

## 2.2 Etapa 2 - Task Brief

Consolidacao de escopo:
- endpoint de geracao em prova RASCUNHO;
- validacao estrutural da resposta da IA;
- fallback principal/fallback;
- tratamento 429/503;
- cobertura de integracao dos cenarios criticos.

Ambiguidades tratadas:
- semantica entre `qntQuestoes` planejada e `quantidade` por chamada;
- comportamento quando `quantidade` nao e enviada;
- ordem de consumo do rate limit em erro de elegibilidade.

## 2.3 Etapa 3 - Context Map

Mapeamento confirmou:
- dominio de prova do bloco 2 estava estavel para extensao;
- `GerarQuestoesRequest` e pontos de extensao ja existiam no agregado;
- `GlobalExceptionHandler` suportava extensao limpa para novos erros;
- testes de integracao de prova eram a superficie principal para regressao.

## 2.4 Etapa 4 - Decision Memo

Decisao:
- manter controller enxuto com orquestracao no `ProvaService`;
- encapsular IA em `LlmService` com implementacao real e mock para testes;
- validar payload da IA em servico dedicado (`LlmValidationService`);
- aplicar rate limit por professor;
- persistir em transacao unica para evitar estado parcial.

## 2.5 Etapa 5 - Execution

Implementacoes realizadas:
- endpoint `POST /api/v1/provas/{id}/gerar-questoes`;
- `LlmServiceImpl` com Gemini;
- `LlmValidationService` para RN-06;
- `RateLimiterService` 5/min;
- handlers para 429 e 503;
- import de `.env` em `application.yaml` para setup local.

Ajuste funcional adicional:
- `quantidade` no request tornou-se opcional com calculo automatico do restante planejado.

Validacao:
- cenarios de integracao verdes para sucesso, fallback, ownership, status, 429 e 503;
- suite completa backend verde.

## 2.6 Etapa 6 - Review (modo solo)

Resultado da revisao inicial:
- 1 problema grave comprovado;
- problemas medios em consistencia de contrato e consumo de cota.

Pontos principais levantados:
- caminho sem `quantidade` podia exceder limite maximo por chamada;
- consumo de rate limit ocorria antes da elegibilidade;
- validador de alternativas nao estava alinhado ao contrato final esperado.

Recomendacao inicial:
- nao pode subir ate corrigir os pontos.

## 2.7 Etapa 7 - Final e correcoes pos-review

Correcoes aplicadas:
- clamp no modo automatico para `min(restante, 20)`;
- rate limit movido para depois das validacoes de elegibilidade;
- validador ajustado para exatamente 4 alternativas por questao;
- novos testes para regressao desses cenarios.

Evidencia final:
- suite completa backend: 127 testes, 0 falhas, 0 erros.

## 3. Arquivos centrais alterados na etapa

- `backend/src/main/java/br/com/ilumina/controller/Prova/ProvaController.java`
- `backend/src/main/java/br/com/ilumina/service/Prova/ProvaService.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmServiceImpl.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmValidationService.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/RateLimiterService.java`
- `backend/src/main/java/br/com/ilumina/exception/GlobalExceptionHandler.java`
- `backend/src/main/resources/application.yaml`
- `backend/src/test/java/br/com/ilumina/controller/Prova/ProvaControllerIntegrationTest.java`
- `backend/src/test/java/br/com/ilumina/service/Llm/LlmValidationServiceTest.java`

## 4. Invariantes consolidados

- geracao so em prova RASCUNHO e dentro de ownership valido;
- quantidade por chamada nunca ultrapassa restante planejado;
- fallback nao causa persistencia parcial;
- resposta da IA so persiste quando valida RN-06;
- excesso de chamadas responde 429;
- indisponibilidade da LLM responde 503;
- erros de elegibilidade nao consomem cota indevidamente.

## 5. Pendencias abertas (nao bloqueantes para etapa 10)

- rate limit distribuido para ambiente com multiplas instancias;
- observabilidade especifica de consumo/custo da LLM;
- bloco 4 para respostas de aluno e bloqueio H3 na despublicacao.

## 6. Resultado da etapa

Etapa 10 concluida com sucesso para o escopo do Bloco 3.

Estado tecnico:
- pronto com ressalvas controladas e documentadas.
