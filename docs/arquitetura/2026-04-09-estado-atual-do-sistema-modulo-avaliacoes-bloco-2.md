# Estado Atual do Sistema - Modulo Avaliacoes (Bloco 2 - API e publicacao)

Data da varredura: 2026-04-09
Escopo analisado: backend - camada de servico, controller e testes de integracao do dominio de prova
Status: operacional para visao professor/admin

---

## 1. Resumo executivo

O sistema agora possui o Bloco 2 do modulo de avaliacoes implementado:
- API de professor/admin para CRUD de prova, questao e alternativa;
- workflow publicar/despublicar ativo;
- guards de ownership, status e integridade centralizados no service;
- bloqueio de ordem duplicada por prova;
- regressao validada em suite completa (96 testes, 0 falhas).

O modulo de avaliacoes passa do estado "fundacao" para estado "operacional no fluxo de autoria do professor".

---

## 2. Estrutura funcional atual do dominio de avaliacao

## 2.1 Camadas implementadas

Controller:
- ProvaController em /api/v1/provas com 11 endpoints.

Service:
- ProvaService com regras de negocio de prova/questao/alternativa/publicacao.

Repository:
- QuestaoRepository com suporte adicional para regra de ordem unica:
  - existsByProvaIdAndOrdem
  - existsByProvaIdAndOrdemAndIdNot

Testes:
- ProvaControllerIntegrationTest com cobertura de cenarios de sucesso, regra e autorizacao.

## 2.2 Estado de autorizacao

- Todos os endpoints do bloco 2 exigem autenticacao JWT.
- Papel permitido: ROLE_ADMIN e ROLE_PROFESSOR.
- Ownership de professor validado no service para leitura/escrita em prova especifica.
- Admin com bypass de ownership para operacoes de gestao.

Restricao de criacao:
- mesmo com ROLE_ADMIN, criacao de prova exige perfil de professor no dominio (professor_id obrigatorio na entidade).

## 2.3 Invariantes tecnicos ativos

- Prova criada em RASCUNHO.
- Mutacoes em prova/questao/alternativa bloqueadas fora de RASCUNHO.
- Publicacao valida integridade minima da prova:
  - deve ter ao menos 1 questao;
  - cada questao com 2 a 4 alternativas;
  - gabarito coerente com alternativas.
- Ordem de questao unica por prova.
- Remocao de questao reordena sem gaps.

---

## 3. Contrato de API consolidado no estado atual

Base path: /api/v1/provas

Operacoes disponiveis:
- CRUD de prova;
- CRUD de questao (adicionar, atualizar, remover);
- atualizacao de alternativa;
- publicar/despublicar.

Envelope de resposta:
- ApiResponse<T> para sucesso e erro.

Mapeamento de erros:
- BusinessException -> 400
- AccessDeniedException -> 403
- ResourceNotFoundException -> 404
- AuthenticationException -> 401

---

## 4. Qualidade e validacao

Resultados confirmados apos fechamento do bloco 2:
- ProvaControllerIntegrationTest: 32 testes, 0 falhas;
- suite backend completa: 96 testes, 0 falhas, 0 erros.

Conclusao de qualidade:
- modulo entregue sem regressao funcional no sistema existente.

---

## 5. Riscos residuais e limites atuais

Risco aceitavel:
- baixa probabilidade de concorrencia em operacoes simultaneas de reordenacao/publicacao.

Risco de acompanhamento:
- potencial N+1 em listagem admin em base de dados muito grande.

Dependencia funcional externa:
- H3 pendente: bloquear despublicacao quando houver respostas de aluno.
  - este controle depende do bloco de respostas (modulo ainda nao implementado).

---

## 6. Prontidao para proximos blocos

Bloco 3 (LLM):
- pronto para iniciar, aproveitando o fluxo manual ja consolidado do professor.

Bloco 4 (visao aluno e respostas):
- depende de novas entidades/servicos/controladores para resposta de prova;
- ao iniciar, incluir guard de H3 no despublicar.

---

## 7. Estado final do modulo de avaliacoes no recorte atual

- Bloco 1: concluido (fundacao de dominio)
- Bloco 2: concluido (API e publicacao da visao professor/admin)
- Bloco 3: pendente (integracao LLM)
- Bloco 4: pendente (visao aluno, submissao e resultado)

Status geral: modulo evoluindo conforme planejamento, com base estavel para fases seguintes.
