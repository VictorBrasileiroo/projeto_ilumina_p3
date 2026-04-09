# Estado Atual do Sistema - Modulo Avaliacoes (Bloco 3 - geracao LLM)

Data da varredura: 2026-04-09
Escopo analisado: backend - controller, service, validacao LLM, rate limit e testes de integracao
Status: operacional para fluxo de autoria com geracao automatica

---

## 1. Resumo executivo

O modulo de avaliacoes evoluiu para o Bloco 3 com geracao automatica de questoes via IA.

Estado atual confirmado:
- endpoint de geracao ativo em `/api/v1/provas/{id}/gerar-questoes`;
- fluxo protegido por ownership + status RASCUNHO + rate limit;
- validacao RN-06 aplicada antes de persistencia;
- fallback de prompt implementado;
- tratamento padrao para 429 e 503 integrado ao handler global;
- regressao final do backend sem falhas (127/127).

---

## 2. Estrutura funcional atual do dominio de avaliacao

## 2.1 Camadas implementadas

Controller:
- `ProvaController` com endpoint de geracao:
  - `POST /api/v1/provas/{id}/gerar-questoes`

Service de dominio:
- `ProvaService` orquestra elegibilidade, quantidade, rate limit, chamada LLM, fallback e persistencia.

Service de IA:
- `LlmService` (contrato)
- `LlmServiceImpl` (Gemini em runtime nao-test)
- `LlmServiceMock` (profile test)

Validacao de resposta IA:
- `LlmValidationService`

Controle de consumo:
- `RateLimiterService` (janela de 1 minuto, chave por email autenticado)

Configuracao:
- `LlmProperties` (provider, model, timeout, max tokens, rate limit)
- `application.yaml` com import opcional de `.env`

## 2.2 Estado de autorizacao

- endpoint de geracao exige JWT;
- papeis permitidos: `ROLE_ADMIN` e `ROLE_PROFESSOR`;
- ownership validado em service (admin com bypass);
- prova publicada nao aceita geracao (somente RASCUNHO).

## 2.3 Invariantes tecnicos ativos no bloco 3

- sem `qntQuestoes` planejada valida, geracao e bloqueada;
- quantidade gerada nunca ultrapassa restante planejado;
- sem `quantidade` no request, usa restante com teto de 20 por chamada;
- fallback acontece apenas quando a resposta principal falha na validacao;
- falha de validacao da IA nao persiste dados parciais;
- cada questao gerada deve conter exatamente 4 alternativas validas (A-D);
- consumo de cota ocorre somente apos passar por elegibilidade.

---

## 3. Fluxo tecnico consolidado

Fluxo efetivo da geracao:

1. controller recebe request validado (`tema`, `quantidade?`);
2. service valida ownership e status da prova;
3. service resolve quantidade da chamada com base no restante;
4. service aplica rate limit (5/min por professor);
5. chamada LLM com prompt principal;
6. validacao RN-06;
7. se invalidar, chamada LLM com prompt fallback;
8. persistencia transacional de questoes e alternativas;
9. retorno de `ProvaDetalheResponse` atualizado.

---

## 4. Contrato de erro consolidado no estado atual

Mapeamento global:
- `BusinessException` -> 400
- `AccessDeniedException` -> 403
- `ResourceNotFoundException` -> 404
- `RateLimitExceededException` -> 429
- `LlmUnavailableException` -> 503

Envelope padrao:
- `ApiResponse<T>` em sucesso e erro.

---

## 5. Qualidade e validacao

Cobertura relevante de integracao inclui:
- sucesso da geracao;
- fallback valido apos resposta invalida;
- validacao de JSON malformado e gabarito invalido;
- duplicidade de enunciado;
- prova publicada e ownership;
- limite de taxa (429);
- indisponibilidade da LLM (503);
- quantidade opcional com restante e lote automatico;
- elegibilidade invalida sem consumo de cota.

Resultado final confirmado:
- backend completo com 127 testes passando;
- sem falhas e sem erros.

---

## 6. Riscos residuais e limites atuais

Risco aceitavel:
- variacao de qualidade pedagogica da resposta da IA (mitigada por revisao do professor).

Risco de acompanhamento:
- rate limit atual e in-memory por instancia, sem coordenacao distribuida.

Dependencia externa:
- disponibilidade e latencia dependem do provedor Gemini.

---

## 7. Prontidao para proximos blocos

Bloco 4 (visao aluno e respostas):
- pronto para iniciar em cima da base atual de prova/publicacao/geracao.

Evolucoes recomendadas:
- rate limit distribuido (Redis ou gateway);
- telemetria de consumo/custo/latencia da LLM.

---

## 8. Estado final do modulo de avaliacoes no recorte atual

- Bloco 1: concluido (fundacao)
- Bloco 2: concluido (API professor/admin + publicacao)
- Bloco 3: concluido (geracao de questoes via LLM)
- Bloco 4: pendente (resposta do aluno, resultado e bloqueio H3)

Status geral: modulo operacional no ciclo de autoria do professor, com geracao automatica e protecoes essenciais ativas.
