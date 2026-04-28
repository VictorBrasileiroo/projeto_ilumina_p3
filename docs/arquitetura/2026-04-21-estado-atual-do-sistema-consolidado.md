# Estado Atual do Sistema - Consolidado

Data de atualizacao: 2026-04-21
Escopo: snapshot arquitetural dos modulos backend ja implementados

---

## 1. Resumo executivo

O backend do Ilumina esta organizado em modulos de dominio sobre uma arquitetura em camadas:

`controller -> service -> repository -> entity`

O sistema ja possui os seguintes blocos funcionais implementados:
- autenticacao JWT e refresh token;
- gestao de professor;
- gestao de turma e vinculo professor-turma;
- gestao de aluno e matricula aluno-turma;
- avaliacoes completas (autoria, LLM, publicacao, aluno e resultado);
- flashcards completos (autoria, LLM, publicacao e consumo aluno).

O padrao predominante e concentrar regra de negocio e autorizacao de escopo nos services, mantendo controllers como borda HTTP e repositories como acesso a dados.

---

## 2. Stack e padroes transversais

Backend:
- Java 21;
- Spring Boot 3.5.x;
- Spring Security com JWT;
- Spring Data JPA / Hibernate;
- banco relacional;
- H2 no perfil de teste;
- Swagger/OpenAPI disponivel para apoio;
- Actuator para health/info.

Padroes transversais:
- `BaseEntity` com UUID e auditoria;
- DTOs por modulo;
- `ApiResponse<T>` como envelope padrao de sucesso/erro;
- `GlobalExceptionHandler` para erros HTTP consistentes;
- `@PreAuthorize` para autorizacao por role;
- services transacionais para operacoes de negocio;
- testes de integracao com `@SpringBootTest` e `MockMvc`.

---

## 3. Modulos implementados

| Modulo | Estado | Responsabilidade principal |
|---|---|---|
| Auth/JWT | concluido | login, refresh token, claims e autenticacao |
| Professor | concluido | perfil professor e ownership |
| Turma | concluido | CRUD de turmas e vinculo professor-turma |
| Aluno | concluido | perfil aluno |
| Aluno-Turma | concluido | matriculas e escopo de acesso por turma |
| Avaliacoes | concluido | provas, questoes, alternativas, LLM, publicacao e respostas |
| Flashcards | concluido | colecoes, cards, LLM, publicacao e consumo aluno |

---

## 4. Camada HTTP atual

Controllers principais:
- `AuthController`
- `HealthController`
- `ProfessorController`
- `TurmaController`
- `AlunoController`
- `ProvaController`
- `AlunoProvaController`
- `FlashcardController`
- `AlunoFlashcardController`

Padrao de desenho:
- controllers de autoria/gestao ficam separados dos controllers de aluno;
- endpoints de professor/admin usam base sem prefixo `/aluno`;
- endpoints de aluno usam base `/api/v1/aluno/...`;
- controllers delegam regra de dominio para services;
- excecoes sao normalizadas globalmente.

---

## 5. Camada de servico atual

Services principais:
- `AuthSeervice`
- `ProfessorService`
- `TurmaService`
- `AlunoService`
- `ProvaService`
- `AlunoProvaService`
- `FlashcardService`
- `AlunoFlashcardService`
- `LlmServiceImpl`
- `LlmValidationService`
- `RateLimiterService`

Responsabilidades por categoria:

| Categoria | Services |
|---|---|
| Identidade | `AuthSeervice`, `DataInitializerRole` |
| Gestao escolar | `ProfessorService`, `TurmaService`, `AlunoService` |
| Avaliacoes | `ProvaService`, `AlunoProvaService` |
| Flashcards | `FlashcardService`, `AlunoFlashcardService` |
| IA/LLM | `LlmServiceImpl`, `LlmValidationService`, `RateLimiterService` |

---

## 6. Modelo de dominio consolidado

### 6.1 Identidade

Entidades:
- `User`
- `UserRole`

Regras centrais:
- identidade tecnica separada dos perfis de dominio;
- roles `ROLE_ADMIN`, `ROLE_PROFESSOR`, `ROLE_ALUNO`;
- tokens carregam contexto para autenticacao e autorizacao.

### 6.2 Professor e turma

Entidades:
- `Professor`
- `Turma`
- `ProfTurma`

Regras centrais:
- professor e perfil 1:1 de `User`;
- turma tem estado ativo/inativo;
- `ProfTurma` representa vinculo professor-turma;
- professores so operam turmas/recursos dentro do escopo permitido.

### 6.3 Aluno e matriculas

Entidades:
- `Aluno`
- `AlunoTurma`

Regras centrais:
- aluno e perfil 1:1 de `User`;
- `AlunoTurma` define matricula e acesso a conteudos por turma;
- par aluno/turma e unico;
- modulos de aluno em provas e flashcards dependem desse vinculo.

### 6.4 Avaliacoes

Entidades:
- `Prova`
- `Questao`
- `Alternativa`
- `StatusProva`
- `RespostaAluno`
- `ItemRespostaAluno`

Regras centrais:
- prova nasce em `RASCUNHO`;
- professor/admin atua no fluxo de autoria;
- aluno acessa somente provas publicadas das suas turmas;
- tentativa unica por aluno/prova;
- gabarito nao vaza antes da submissao.

### 6.5 Flashcards

Entidades:
- `ColecoesFlashcard`
- `Flashcard`
- `StatusColecao`

Regras centrais:
- colecao nasce em `RASCUNHO`;
- professor/admin atua no fluxo de autoria;
- aluno acessa somente colecoes publicadas das suas turmas;
- cards sao exibidos por `ordem`;
- fluxo aluno e somente leitura.

---

## 7. Seguranca e autorizacao

### 7.1 Rotas publicas

O sistema mantem poucas rotas publicas:
- health/auth;
- Swagger/OpenAPI;
- cadastro inicial de professor/aluno conforme configurado;
- rota publica especifica de matriculas quando prevista pelo modulo turma.

Demais rotas exigem JWT.

### 7.2 Autorizacao por perfil

| Perfil | Escopo comum |
|---|---|
| ADMIN | administracao ampla, com excecoes onde service exige perfil de dominio |
| PROFESSOR | autoria e gestao de recursos vinculados ao professor/turma |
| ALUNO | consumo e acoes dentro das turmas matriculadas |

### 7.3 Autorizacao por dominio

O sistema nao depende apenas de role.

Guards adicionais:
- professor dono do recurso;
- professor vinculado a turma;
- aluno matriculado na turma;
- recurso publicado para consumo aluno;
- tentativa unica em avaliacao;
- status `RASCUNHO` para mutacoes estruturais.

---

## 8. IA/LLM como camada compartilhada

O modulo LLM e compartilhado por Avaliacoes e Flashcards.

Capacidades:
- geracao de questoes;
- geracao de flashcards;
- validacao defensiva de JSON;
- rate limit por usuario;
- falha controlada com `400`, `429` e `503`.

Decisao arquitetural:
- services de dominio chamam LLM apenas depois de validar ownership/status/limites;
- persistencia ocorre apos validacao completa;
- falha de validacao nao deixa persistencia parcial.

---

## 9. Qualidade e testes

Historico consolidado documentado:
- modulos Professor/Turma/Aluno-Turma possuem suites de integracao;
- Avaliacoes fechou ciclo completo com testes de autoria, LLM, aluno e resultado;
- Flashcards fechou bloco 4 com suite alvo de 55 testes e regressao correlata verde.

Padroes de teste:
- fixtures criados diretamente via repositories;
- `MockMvc` com `with(user(...).roles(...))`;
- H2 no perfil `test`;
- foco em sucesso, autorizacao, inexistente, conflito e regressao.

---

## 10. Riscos residuais gerais

| Risco | Modulo afetado | Observacao |
|---|---|---|
| N+1 em listagens/detalhes | Avaliacoes/Flashcards | aceitavel no volume inicial, otimizar com queries/fetch quando necessario |
| Rate limiter em memoria | LLM | nao distribuido |
| concorrencia em ordem sequencial | Flashcards/Avaliacoes | estrategia atual usa max(ordem)+1 em alguns fluxos |
| politica fina de admin em endpoints de aluno | Avaliacoes/Flashcards | segue padrao atual, pode exigir decisao de produto |
| ausencia de migracoes versionadas | backend geral | ponto estrutural futuro |

---

## 11. Estado arquitetural atual

O backend esta em estado funcional avancado:
- ciclo escolar base implementado;
- autoria e consumo de avaliacoes concluidos;
- autoria e consumo de flashcards concluidos;
- padrao de camadas consistente;
- seguranca por role + escopo de dominio;
- base pronta para integracao frontend mais completa.

Proximas evolucoes naturais:
- observabilidade;
- paginacao e filtros;
- otimizacoes de query;
- migracoes versionadas;
- progresso/analytics de estudo;
- documentacao Swagger mais rica por endpoint.

---

## 12. Referencias relacionadas

- `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- `docs/api/2026-04-13-api-modulo-avaliacoes-unificado.md`
- `docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md`
- `docs/arquitetura/2026-04-13-estado-atual-do-sistema-modulo-avaliacoes-geral.md`
- `docs/arquitetura/2026-04-07-estado-atual-do-sistema-modulo-aluno-turma.md`
- `docs/features/2026-04-19-feature-modulo-flashcards-unificada.md`
- `docs/features/2026-04-13-feature-modulo-avaliacoes-unificada.md`
