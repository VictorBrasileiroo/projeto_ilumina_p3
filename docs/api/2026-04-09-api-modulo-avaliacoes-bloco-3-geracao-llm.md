# API - Modulo Avaliacoes (Bloco 3 - geracao LLM)

Data: 2026-04-09
Versao: v1
Base path: /api/v1/provas

## 1. Objetivo

Documentar o endpoint de geracao automatica de questoes via IA (Gemini) no modulo de avaliacoes.

Este documento cobre:
- contrato do endpoint de geracao;
- regras de elegibilidade e ownership;
- regra de quantidade opcional com calculo automatico do restante;
- tratamento de fallback, rate limit e indisponibilidade da LLM.

## 2. Escopo desta versao

Inclui:
- `POST /api/v1/provas/{id}/gerar-questoes`;
- validacao RN-06 antes de persistir;
- fallback de prompt (principal -> fallback);
- erros 400/429/503 com envelope padrao.

Nao inclui:
- endpoints de aluno (responder prova e resultado);
- bloqueio de despublicacao por respostas de aluno (dependente do bloco 4);
- rate limit distribuido entre multiplas instancias.

## 3. Seguranca e autorizacao

Endpoint protegido por JWT com um dos papeis:
- ROLE_ADMIN
- ROLE_PROFESSOR

Header esperado:

```http
Authorization: Bearer <jwt>
```

Regras de acesso:
- professor so gera questoes em prova propria;
- admin possui bypass de ownership;
- prova precisa estar em status RASCUNHO.

## 4. Endpoint do bloco 3

| Metodo | Path | Status sucesso | Uso |
|---|---|---|---|
| POST | /api/v1/provas/{id}/gerar-questoes | 201 | Gerar questoes via IA |

## 5. Contrato de request

`POST /api/v1/provas/{id}/gerar-questoes`

```json
{
  "tema": "Revolucao Francesa",
  "quantidade": 5
}
```

Regras de validacao:
- `tema`: obrigatorio e nao vazio;
- `quantidade`: opcional;
- quando informada, `quantidade` deve estar entre 1 e 20.

Exemplo com quantidade opcional:

```json
{
  "tema": "Revolucao Francesa"
}
```

## 6. Regra de quantidade (planejada x geracao)

A quantidade final da chamada e resolvida com base na prova:

1. `qntQuestoes` da prova deve estar definida e ser maior que zero.
2. `totalAtual` = quantidade ja persistida de questoes na prova.
3. `restante` = `qntQuestoes - totalAtual`.
4. Se `restante <= 0`: retorna 400.
5. Se `quantidade` nao foi enviada: usa `min(restante, 20)`.
6. Se `quantidade` foi enviada e `quantidade > restante`: retorna 400.

Observacao:
- quando o restante for maior que 20, o cliente deve chamar o endpoint em lotes ate completar o planejado.

## 7. Fluxo de processamento

Ordem de execucao no backend:

1. validar ownership e status da prova;
2. resolver quantidade da chamada (regra de restante);
3. consumir cota de rate limit (5/min por professor autenticado);
4. chamar LLM com prompt principal;
5. validar JSON de retorno (RN-06);
6. se falhar validacao, chamar prompt fallback e validar novamente;
7. persistir questoes e alternativas em transacao unica;
8. retornar detalhe da prova com lista atualizada de questoes.

## 8. Validacao da resposta da IA (RN-06)

Regras aplicadas antes de persistir:
- payload deve conter `questoes` em array;
- array nao pode vir vazio;
- quantidade retornada deve ser igual a quantidade solicitada na chamada;
- enunciados nao podem repetir;
- gabarito deve ser uma letra entre A e D;
- cada questao deve ter exatamente 4 alternativas;
- letras das alternativas devem ser A/B/C/D sem duplicacao;
- texto de alternativa nao pode ser vazio;
- gabarito deve existir entre as alternativas.

Em qualquer falha de validacao:
- retorno 400;
- nenhuma questao e persistida.

## 9. Envelope padrao de resposta

Sucesso (ApiResponse<T>):

```json
{
  "timestamp": "2026-04-09T23:00:00Z",
  "status": 201,
  "success": true,
  "message": "Questoes geradas com sucesso.",
  "data": {
    "id": "<prova-id>",
    "status": "RASCUNHO",
    "questoes": []
  },
  "errors": null,
  "path": "/api/v1/provas/<id>/gerar-questoes"
}
```

Erro:

```json
{
  "timestamp": "2026-04-09T23:00:00Z",
  "status": 400,
  "success": false,
  "message": "A quantidade solicitada ultrapassa o restante planejado para a prova.",
  "data": null,
  "errors": ["A quantidade solicitada ultrapassa o restante planejado para a prova."],
  "path": "/api/v1/provas/<id>/gerar-questoes"
}
```

## 10. Erros esperados para frontend

| HTTP | Causa comum | Observacao |
|---|---|---|
| 400 | regra de negocio/validacao | prova publicada, restante excedido, JSON invalido da IA |
| 401 | token ausente/invalido | endpoint protegido |
| 403 | sem permissao de ownership | professor tentando operar prova de outro |
| 404 | prova inexistente | id nao encontrado |
| 429 | limite de geracao excedido | limite atual: 5 chamadas por minuto por professor |
| 503 | LLM indisponivel ou API key ausente | indisponibilidade externa ou configuracao faltante |

## 11. Configuracao minima para ambiente local

No backend, a chave da IA pode vir por:
- `GOOGLE_API_KEY`; ou
- `GEMINI_API_KEY`.

O projeto aceita carregar via `.env` com `spring.config.import`.

Exemplo:

```env
GOOGLE_API_KEY=<sua-chave>
```

## 12. Evidencias de validacao

Cenarios cobertos em integracao:
- geracao com payload valido;
- quantidade opcional usando restante planejado;
- lote automatico quando restante > 20;
- prova publicada bloqueia geracao;
- ownership bloqueado;
- fallback funcionando;
- 429 por rate limit;
- 503 por indisponibilidade da LLM;
- erro de elegibilidade sem consumo indevido de cota.

Resultado final de regressao (backend):
- 127 testes passando;
- 0 falhas, 0 erros.
