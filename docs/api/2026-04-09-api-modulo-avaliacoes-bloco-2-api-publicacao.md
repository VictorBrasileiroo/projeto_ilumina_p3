# API - Modulo Avaliacoes (Bloco 2 - API e publicacao)

Data: 2026-04-09
Versao: v1
Base path: /api/v1/provas

## 1. Objetivo

Documentar os endpoints do Bloco 2 do modulo de avaliacoes, com foco no fluxo de professor/admin para:
- CRUD de prova;
- CRUD de questao;
- atualizacao de alternativa;
- publicar e despublicar prova.

Este documento cobre o contrato real implementado em backend e os ajustes pos-review (PM-1 e PM-2).

## 2. Escopo desta versao

Inclui:
- endpoints da visao professor/admin em /api/v1/provas;
- regras de ownership, status e validacao de publicacao;
- erros esperados por tipo de falha;
- exemplos de payload.

Nao inclui:
- endpoints da visao aluno (listar pendentes, responder prova, resultado);
- integracao LLM (geracao automatica de questoes);
- bloqueio de despublicacao por respostas de aluno (dependencia de bloco futuro).

## 3. Seguranca e autorizacao

Todos os endpoints desta versao sao protegidos por JWT e exigem um dos papeis:
- ROLE_ADMIN
- ROLE_PROFESSOR

Header esperado:

```http
Authorization: Bearer <jwt>
```

Importante:
- ownership e regras de negocio sao validadas no service, nao apenas no controller;
- ADMIN pode listar/detalhar/editar/publicar sem ownership de professor;
- para criar prova, o usuario autenticado precisa ter perfil de professor no dominio (PM-1).

## 4. Endpoints do bloco 2

| Metodo | Path | Status sucesso | Uso |
|---|---|---|---|
| POST | /api/v1/provas | 201 | Criar prova |
| GET | /api/v1/provas | 200 | Listar provas |
| GET | /api/v1/provas/{id} | 200 | Detalhar prova |
| PUT | /api/v1/provas/{id} | 200 | Atualizar prova |
| DELETE | /api/v1/provas/{id} | 204 | Excluir prova |
| POST | /api/v1/provas/{provaId}/questoes | 201 | Adicionar questao |
| PUT | /api/v1/provas/{provaId}/questoes/{questaoId} | 200 | Atualizar questao |
| DELETE | /api/v1/provas/{provaId}/questoes/{questaoId} | 204 | Remover questao |
| PUT | /api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId} | 200 | Atualizar alternativa |
| PATCH | /api/v1/provas/{id}/publicar | 200 | Publicar prova |
| PATCH | /api/v1/provas/{id}/despublicar | 200 | Despublicar prova |

## 5. Contratos de request

## 5.1 Criar prova

POST /api/v1/provas

```json
{
  "titulo": "Prova Bimestral",
  "descricao": "Conteudo acumulado",
  "disciplina": "Matematica",
  "qntQuestoes": 10,
  "turmaId": "<uuid>"
}
```

Regras de validacao:
- titulo obrigatorio, max 255;
- descricao opcional, max 2000;
- disciplina opcional, max 100;
- turmaId obrigatorio.

## 5.2 Atualizar prova

PUT /api/v1/provas/{id}

```json
{
  "titulo": "Prova Bimestral Atualizada",
  "descricao": "Descricao revisada",
  "disciplina": "Matematica",
  "qntQuestoes": 12,
  "turmaId": "<uuid>"
}
```

Todos os campos sao opcionais.

## 5.3 Adicionar questao

POST /api/v1/provas/{provaId}/questoes

```json
{
  "enunciado": "Quanto e 2 + 2?",
  "gabarito": "B",
  "pontuacao": 2.5,
  "ordem": 1,
  "alternativas": [
    { "texto": "3", "letra": "A" },
    { "texto": "4", "letra": "B" },
    { "texto": "5", "letra": "C" }
  ]
}
```

Regras de validacao:
- enunciado obrigatorio;
- gabarito em A/B/C/D;
- ordem obrigatoria e >= 1;
- alternativas entre 2 e 4;
- letras de alternativa devem ser unicas.

## 5.4 Atualizar questao

PUT /api/v1/provas/{provaId}/questoes/{questaoId}

```json
{
  "enunciado": "Quanto e 2 + 3?",
  "gabarito": "C",
  "pontuacao": 3.0,
  "ordem": 2
}
```

Todos os campos sao opcionais.

## 5.5 Atualizar alternativa

PUT /api/v1/provas/{provaId}/questoes/{questaoId}/alternativas/{altId}

```json
{
  "texto": "4"
}
```

## 6. Envelope padrao de resposta

Sucesso (ApiResponse<T>):

```json
{
  "timestamp": "2026-04-09T17:00:00Z",
  "status": 200,
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "path": "/api/v1/provas"
}
```

Erro:

```json
{
  "timestamp": "2026-04-09T17:00:00Z",
  "status": 400,
  "success": false,
  "message": "...",
  "data": null,
  "errors": ["..."],
  "path": "/api/v1/provas"
}
```

## 7. Regras de negocio consolidadas

- Prova criada com status inicial RASCUNHO.
- Mutacoes em prova/questao/alternativa so podem ocorrer em RASCUNHO.
- Professor so acessa provas proprias; acesso cruzado retorna 403.
- Criacao/edicao de prova exige vinculo professor-turma.
- Publicacao exige prova integra:
  - pelo menos 1 questao;
  - cada questao com 2 a 4 alternativas;
  - gabarito da questao precisa existir nas alternativas.
- Remocao de questao reordena sequencia sem gaps.
- Ordem de questao deve ser unica por prova (PM-2).

## 8. Ajustes pos-review aplicados

PM-1 (admin sem perfil de professor):
- criacao de prova sem perfil de professor agora retorna 400 com mensagem clara:
  - "E necessario ter perfil de professor para criar provas."

PM-2 (ordem duplicada):
- adicionar/atualizar questao agora rejeita ordem ja usada na mesma prova com 400:
  - "Ja existe outra questao da mesma prova com aquela ordem."

## 9. Erros esperados para frontend

| HTTP | Causa comum | Observacao |
|---|---|---|
| 400 | regra de negocio/validacao | ex.: prova publicada, ordem duplicada, admin sem perfil professor |
| 401 | token ausente/invalido | endpoint protegido |
| 403 | sem permissao de ownership | professor acessando prova de outro |
| 404 | recurso inexistente | prova, turma, questao ou alternativa |
| 409 | conflito de integridade | valido para erros de persistencia geral |

## 10. Evidencia de validacao

- ProvaControllerIntegrationTest: 32 testes, 0 falhas.
- Suite completa backend: 96 testes, 0 falhas, 0 erros.

## 11. Pendencia conhecida

H3 (despublicacao com respostas de aluno):
- neste bloco, despublicacao nao bloqueia por respostas existentes;
- o bloqueio sera implementado quando o modulo de respostas do aluno for entregue.
