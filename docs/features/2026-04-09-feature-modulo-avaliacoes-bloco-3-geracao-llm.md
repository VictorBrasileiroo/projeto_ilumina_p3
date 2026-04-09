# Feature: Modulo Avaliacoes - Bloco 3 (geracao de questoes via LLM)

Data: 2026-04-09
Status: implementado
Escopo: backend API (visao professor/admin)

## 1. Objetivo da feature

Entregar o Bloco 3 do modulo de avaliacoes com geracao automatica de questoes por IA, mantendo o fluxo editorial do professor em cima da prova em RASCUNHO.

Objetivos diretos desta entrega:
- adicionar endpoint de geracao por tema;
- validar resposta da IA antes de persistir (RN-06);
- impedir persistencia parcial em falha;
- proteger o recurso com rate limit e tratamento de indisponibilidade externa.

## 2. Problema resolvido

Antes desta feature, o backend suportava apenas criacao manual de questoes (bloco 2).

Com esta entrega, o professor pode gerar questoes automaticamente com contrato controlado, validacao estrutural e retorno consistente para o frontend.

## 3. Escopo implementado

## 3.1 Camadas e componentes entregues

- Endpoint de geracao:
  - `POST /api/v1/provas/{id}/gerar-questoes`
- Service de orquestracao:
  - `br.com.ilumina.service.Prova.ProvaService#gerarQuestoes`
- Servico de integracao LLM:
  - `br.com.ilumina.service.Llm.LlmService`
  - `br.com.ilumina.service.Llm.LlmServiceImpl`
- Servico de validacao de payload IA:
  - `br.com.ilumina.service.Llm.LlmValidationService`
- Rate limit por professor autenticado:
  - `br.com.ilumina.service.Llm.RateLimiterService`
- Mapeamento de erros:
  - `429` para limite excedido
  - `503` para indisponibilidade LLM

## 3.2 Regras de negocio aplicadas

- geracao apenas para prova em `RASCUNHO`;
- ownership de professor respeitado (admin com bypass);
- `tema` obrigatorio;
- `quantidade` opcional (1..20 quando informada);
- sem `quantidade`: gera automaticamente o restante planejado da prova;
- por chamada, o modo automatico respeita teto de 20 questoes;
- se `quantidade` exceder o restante planejado, retorna 400;
- fallback de prompt quando a primeira resposta da IA e invalida;
- validacao RN-06 antes de salvar;
- sem persistencia parcial em qualquer erro de validacao.

## 4. Correcao pos-review incluida nesta feature

A revisao do bloco apontou 1 problema grave e lacunas medias. Foram aplicadas as correcoes:

1. Quantidade opcional sem clamp por chamada:
- ajustado para `min(restante, 20)` no caminho sem `quantidade`.

2. Consumo de cota antes de validar elegibilidade:
- rate limit movido para depois das validacoes de ownership/status/quantidade.

3. Divergencia entre prompt e validador de alternativas:
- validador passou a exigir exatamente 4 alternativas por questao gerada.

4. Setup local com chave ausente:
- suporte explicito a `.env` e mensagem de erro orientativa para `GOOGLE_API_KEY`/`GEMINI_API_KEY`.

## 5. Fora de escopo

- endpoints de aluno para responder prova e consultar resultado;
- bloqueio de despublicacao por respostas de aluno (bloco 4);
- rate limiter distribuido (estado compartilhado entre instancias);
- avaliacao semantica de qualidade pedagogica da questao gerada.

## 6. Qualidade e validacao

Cenarios de integracao relevantes cobertos:
- sucesso com geracao valida;
- fallback funcionando;
- JSON invalido/gabarito invalido/duplicidade sem persistencia;
- 429 por limite;
- 503 por indisponibilidade da LLM;
- quantidade opcional com restante;
- lote automatico quando restante > limite por chamada;
- elegibilidade invalida sem consumir cota.

Resultado de regressao final do backend:
- 127 testes passando;
- 0 falhas;
- 0 erros.

## 7. Riscos residuais conhecidos

- rate limit atual e in-memory por instancia (nao distribuido);
- custo/latencia dependem do provedor externo;
- qualidade pedagogica final ainda depende de revisao humana do professor.

## 8. Resultado da feature

Feature concluida para o escopo do Bloco 3.

Entrega habilita geracao automatica de questoes com validacao defensiva, fallback, tratamento de erro e protecao de consumo, mantendo coerencia com o dominio de provas em RASCUNHO.
