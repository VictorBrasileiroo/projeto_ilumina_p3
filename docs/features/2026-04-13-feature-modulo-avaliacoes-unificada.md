# Feature Unificada - Modulo de Avaliacoes

Data: 2026-04-13  
  
Escopo: consolidacao funcional da feature de avaliacoes

---

## 1. Objetivo da feature unificada

Consolidar em um unico documento a evolucao funcional do modulo de avaliacoes, reunindo:
- fundacao de dominio;
- API de autoria/publicacao;
- geracao automatica por IA;
- realizacao de prova pelo aluno.

---

## 2. Problema de negocio resolvido

Antes da evolucao por blocos, nao existia um ciclo completo de avaliacao dentro da plataforma.

Com os blocos 1-4, o sistema passou a cobrir fim a fim:
1. professor cria e estrutura prova;
2. professor pode gerar questoes por IA;
3. professor publica para a turma;
4. aluno responde prova;
5. sistema calcula nota e entrega resultado.

---

## 3. Escopo entregue por bloco

| Bloco | Entrega | Status |
|---|---|---|
| 1 | Entidades, repositorios e DTOs de prova/questao/alternativa | Concluido |
| 2 | API professor/admin para CRUD e publicacao | Concluido |
| 3 | Endpoint de geracao LLM com RN-06, fallback e rate limit | Concluido |
| 4 | API aluno para listagem, detalhe, submissao e resultado | Concluido |

---

## 4. Entregaveis consolidados

### 4.1 Dominio

- `StatusProva`, `Prova`, `Questao`, `Alternativa`
- `RespostaAluno`, `ItemRespostaAluno`

### 4.2 API

- base `/api/v1/provas` para professor/admin
- base `/api/v1/aluno/provas` para aluno/admin

### 4.3 Servicos

- `ProvaService`
- `AlunoProvaService`
- `LlmService`, `LlmValidationService`, `RateLimiterService`

### 4.4 Testes

- suites de integracao por bloco
- regressao documentada nas etapas de entrega

---

## 5. Regras de negocio consolidadas

- Prova inicia em `RASCUNHO`.
- Apenas prova em `RASCUNHO` pode sofrer mutacoes.
- Publicacao exige integridade de questoes/alternativas/gabarito.
- Gabarito nao e exposto para aluno antes da submissao.
- Tentativa unica por aluno/prova.
- Quantidade de geracao por IA respeita restante planejado e teto por chamada.
- Falha de validacao da IA nao persiste dados parciais.

---

## 6. Correcoes pos-review acumuladas

Correcoes relevantes documentadas nos blocos:

1. Protecao de ciclo em entidades (`@ToString.Exclude`) para evitar StackOverflow.
2. Ajuste de validacao de descricao (limite ampliado para uso real).
3. Regra de criacao de prova por admin sem perfil professor (retorno 400 claro).
4. Bloqueio de ordem duplicada de questao por prova.
5. Clamp de quantidade automatica da LLM (`min(restante, 20)`).
6. Consumo de cota de rate limit apenas apos elegibilidade valida.
7. Exigencia de 4 alternativas no fluxo de geracao por IA.
8. Ajuste de autorizacao do fluxo aluno para `hasAnyRole('ADMIN', 'ALUNO')`.

---

## 7. Qualidade e validacao consolidada

Historico de validacao reportado por bloco:
- Bloco 1: 65 testes OK
- Bloco 2: 96 testes OK
- Bloco 3: 127 testes OK
- Bloco 4: 75 testes OK no recorte final do fluxo aluno

Resumo:
- entregas foram finalizadas com regressao controlada no contexto de cada bloco;
- para entrega final de release, prevalece a execucao da suite atual do branch.

---

## 8. Fora de escopo consolidado

- paginacao e filtros avancados em todas as listagens;
- rate limit distribuido multi-instancia;
- migracoes versionadas (Flyway/Liquibase);
- analytics avancado de desempenho pedagogico;
- exportacao de resultado (ex.: PDF);
- trilha temporal detalhada por questao respondida.

---

## 9. Riscos residuais conhecidos

- risco de N+1 para grandes volumes em listagem/detalhe;
- dependencia da disponibilidade/custo da LLM externa;
- ausencia de migracoes versionadas pode elevar risco operacional;
- validar em release se bloqueio de despublicacao com respostas ja esta plenamente aplicado.

---

## 10. Resultado final da feature no recorte 1-4

Estado atual:
- feature principal de avaliacoes esta funcional de ponta a ponta;
- contratos estao documentados e separados por perfil de uso;
- base tecnica pronta para evolucoes de performance e analytics.

Classificacao operacional:
- pronto para uso no escopo definido dos blocos 1-4;
- com ressalvas tecnicas conhecidas e documentadas.

---

## 11. Referencias de origem

- `docs/features/2026-04-09-feature-modulo-avaliacoes-bloco-1.md`
- `docs/features/2026-04-09-feature-modulo-avaliacoes-bloco-2-api-publicacao.md`
- `docs/features/2026-04-09-feature-modulo-avaliacoes-bloco-3-geracao-llm.md`
- `docs/features/2026-04-09-feature-modulo-avaliacoes-bloco-4-aluno.md`
