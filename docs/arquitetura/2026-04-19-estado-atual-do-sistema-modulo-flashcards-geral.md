# Estado Atual do Sistema - Modulo Flashcards

Data de atualizacao: 2026-04-21
Escopo: arquitetura consolidada do modulo Flashcards apos fechamento dos blocos 1 a 4

---

## 1. Resumo executivo

O modulo Flashcards esta funcionalmente completo no recorte backend atual.

Ele entrega:
- fundacao de dominio para colecoes e cards;
- API professor/admin para autoria, publicacao e gestao;
- geracao assistida por LLM com validacao defensiva;
- API aluno para consumo seguro de colecoes publicadas por turma.

O ponto arquitetural mais importante do fechamento e a separacao entre:
- fluxo de autoria em `/api/v1/colecoes`, com ownership professor/admin;
- fluxo de consumo em `/api/v1/aluno/colecoes`, com visibilidade por `PUBLICADA` + matricula aluno-turma.

Estado de maturidade:

| Bloco | Estado |
|---|---|
| Bloco 1 - fundacao | concluido |
| Bloco 2 - API professor/admin | concluido |
| Bloco 3 - geracao LLM | concluido |
| Bloco 4 - consumo aluno | concluido |

---

## 2. Contexto do sistema ja implementado

O modulo Flashcards se apoia em capacidades ja existentes do backend:

| Modulo | Papel para Flashcards |
|---|---|
| Auth/JWT | autentica requests e fornece email/roles via `Authentication` |
| User/Role | fonte da identidade tecnica e papeis `ADMIN`, `PROFESSOR`, `ALUNO` |
| Professor | perfil de autoria e ownership das colecoes |
| Turma | escopo de publicacao das colecoes |
| Aluno | perfil de consumo |
| AlunoTurma | fonte de verdade para visibilidade do aluno |
| LLM | geracao de conteudo assistida por IA |
| Exception handling global | padroniza `400/401/403/404/429/503` |

O modulo Avaliacoes foi usado como referencia de arquitetura para a visao do aluno, especialmente `AlunoProvaController` e `AlunoProvaService`.

---

## 3. Linha do tempo de maturidade

| Bloco | Entrega principal | Maturidade adicionada |
|---|---|---|
| 1 | Entidades, repositories e DTOs base | agregado `ColecoesFlashcard -> Flashcard` |
| 2 | API professor/admin | CRUD, cards manuais, publicacao e ownership |
| 3 | Geracao LLM | automacao com rate limit, prompt e validacao transacional |
| 4 | API aluno | leitura segura por turma e status publicado |

---

## 4. Arquitetura em camadas

### 4.1 Controller layer

`FlashcardController`
- base path: `/api/v1/colecoes`;
- roles: `ADMIN`, `PROFESSOR`;
- expoe autoria, publicacao, cards manuais e geracao LLM;
- usa `ApiResponse<T>` em respostas com body;
- retorna `204` em exclusoes.

`AlunoFlashcardController`
- base path: `/api/v1/aluno/colecoes`;
- roles: `ADMIN`, `ALUNO`;
- expoe apenas GET de listagem e detalhe;
- nao possui mutacoes;
- delega todos os guards de dominio para `AlunoFlashcardService`.

### 4.2 Service layer

`FlashcardService`
- cria colecao em `RASCUNHO`;
- lista colecoes por professor ou todas para admin;
- detalha colecao com cards ordenados;
- atualiza metadados apenas em `RASCUNHO`;
- publica e despublica;
- adiciona, edita e remove flashcards manuais;
- gera flashcards via LLM;
- valida ownership e editabilidade.

`AlunoFlashcardService`
- resolve aluno por email (`Authentication.getName()` -> `User` -> `Aluno`);
- lista colecoes `PUBLICADA` das turmas do aluno;
- retorna lista vazia quando aluno nao possui turmas;
- detalha colecao se ela estiver publicada e a turma pertencer ao aluno;
- devolve 404 para colecao inexistente;
- devolve 403 para colecao rascunho ou fora da turma do aluno;
- mapeia DTOs especificos de aluno.

### 4.3 LLM layer

Componentes:
- `LlmService`
- `LlmServiceImpl`
- `LlmValidationService`
- `RateLimiterService`
- prompt `gerar-flashcards-main.txt`

Responsabilidades:
- montar prompt a partir de tema e quantidade;
- chamar provedor de LLM;
- validar JSON de resposta antes de persistir;
- rejeitar payload sem raiz `flashcards`, quantidade incorreta, texto vazio ou frente duplicada;
- preservar transacao sem persistencia parcial em falha.

### 4.4 Repository layer

`ColecoesFlashcardRepository`
- `findByProfessor_Id`
- `findByTurmaIdInAndStatus`
- `findAll`
- `findById`

`FlashcardRepository`
- `findByColecao_IdOrderByOrdemAsc`
- `countByColecaoId`
- `existsByIdAndColecao_Id`

Repositories de apoio:
- `UserRepository`
- `ProfessorRepository`
- `AlunoRepository`
- `TurmaRepository`
- `ProfTurmaRepository`
- `AlunoTurmaRepository`

### 4.5 Domain/entity layer

Entidades centrais:
- `ColecoesFlashcard`
- `Flashcard`
- `StatusColecao`

Relacoes principais:
- `Professor 1:N ColecoesFlashcard`
- `Turma 1:N ColecoesFlashcard`
- `ColecoesFlashcard 1:N Flashcard`
- `Aluno N:N Turma` via `AlunoTurma`

Padroes preservados:
- `BaseEntity` com UUID/auditoria;
- `@ManyToOne` obrigatorio para professor/turma/colecao;
- cascade e orphan removal entre colecao e flashcards;
- ordenacao por `ordem` no agregado e via repository.

---

## 5. Modelo de dados do modulo

### 5.1 Tabela `colecoes_flashcard`

Campos de negocio:
- `titulo`
- `tema`
- `qnt_cards`
- `status`
- `id_professor`
- `id_turma`

Semantica:
- `status = RASCUNHO`: colecao editavel por professor/admin;
- `status = PUBLICADA`: colecao consumivel por alunos da turma e bloqueada para mutacao de cards/metadados.

### 5.2 Tabela `flashcards`

Campos de negocio:
- `texto_frente`
- `texto_verso`
- `ordem`
- `id_colecao`

Semantica:
- `ordem` define exibicao ao professor e ao aluno;
- criacao manual/LLM usa estrategia `max(ordem)+1`.

### 5.3 Tabela `aluno_turma`

Usada como fonte de verdade de autorizacao do aluno:
- se existe par `aluno_id` + `turma_id`, o aluno pode ver colecoes publicadas daquela turma;
- se nao existe, detalhe da colecao retorna 403.

---

## 6. Fluxos arquiteturais principais

### 6.1 Fluxo professor/admin - autoria manual

1. Request chega em `FlashcardController`.
2. `@PreAuthorize` exige `ADMIN` ou `PROFESSOR`.
3. Service resolve professor por email quando necessario.
4. Service valida turma ativa e vinculo professor-turma na criacao.
5. Colecao nasce em `RASCUNHO`.
6. Cards sao adicionados com ordem sequencial.
7. Mutacoes estruturais sao bloqueadas quando a colecao esta `PUBLICADA`.

### 6.2 Fluxo professor/admin - publicacao

1. Professor/admin chama `PATCH /api/v1/colecoes/{id}/publicar`.
2. Service valida ownership.
3. Service valida status `RASCUNHO`.
4. Service valida existencia de ao menos 1 flashcard.
5. Service valida frente e verso preenchidos.
6. Colecao muda para `PUBLICADA`.

### 6.3 Fluxo professor/admin - geracao LLM

1. Professor/admin chama `POST /api/v1/colecoes/{id}/gerar-flashcards`.
2. Service valida ownership e `RASCUNHO`.
3. Rate limit e validado por usuario.
4. Prompt e montado com tema e quantidade.
5. LLM retorna JSON.
6. `LlmValidationService.validarFlashcards` valida estrutura e conteudo.
7. Cards sao persistidos em transacao unica, sem parcialidade.
8. Service retorna detalhe atualizado.

### 6.4 Fluxo aluno - listagem

1. Aluno chama `GET /api/v1/aluno/colecoes`.
2. Controller permite `ALUNO` ou `ADMIN`.
3. Service resolve perfil `Aluno` por email.
4. Service consulta turmas do aluno.
5. Se nao houver turmas, retorna `[]`.
6. Repository busca colecoes por `turmaIds` e `StatusColecao.PUBLICADA`.
7. Service ordena por `createdAt` desc e mapeia `ColecaoAlunoResponse`.

### 6.5 Fluxo aluno - detalhe

1. Aluno chama `GET /api/v1/aluno/colecoes/{id}`.
2. Service resolve aluno.
3. Service busca colecao por id.
4. Se nao existir, retorna 404.
5. Se status nao for `PUBLICADA`, retorna 403.
6. Se aluno nao estiver matriculado na turma, retorna 403.
7. Repository carrega flashcards por `ordem ASC`.
8. Service retorna `ColecaoDetalheAlunoResponse`.

---

## 7. Seguranca e autorizacao

### 7.1 Autenticacao

Todas as rotas do modulo exigem JWT valido. O `SecurityConfig` permite publicamente apenas rotas globais de health/auth/swagger e excecoes especificas de outros modulos.

### 7.2 Autorizacao professor/admin

Camada de interface:
- `@PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")`

Camada de dominio:
- professor precisa ser dono da colecao;
- admin ignora ownership para leitura/mutacao/publicacao;
- criacao de colecao ainda exige perfil de professor, mesmo para admin.

### 7.3 Autorizacao aluno

Camada de interface:
- `@PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")`

Camada de dominio:
- usuario precisa resolver para `Aluno`;
- colecao precisa estar `PUBLICADA`;
- aluno precisa estar matriculado na turma da colecao;
- rascunho e outra turma resultam em 403.

---

## 8. Invariantes consolidadas

- Colecao nasce em `RASCUNHO`.
- Apenas professor dono ou admin opera o fluxo de autoria.
- Mutacoes de colecao/card exigem `RASCUNHO`.
- Publicacao exige colecao valida e com flashcards.
- Geracao LLM nao persiste payload invalido.
- Ordem de exibicao dos cards e sempre crescente por `ordem`.
- Aluno lista somente colecoes `PUBLICADA` de suas turmas.
- Aluno nao acessa detalhe de colecao em `RASCUNHO`.
- Aluno nao acessa detalhe de outra turma.
- Aluno nao possui endpoints de mutacao.
- Professor nao acessa endpoint de aluno.
- Aluno nao acessa endpoint professor/admin.

---

## 9. Qualidade e validacao

Evidencias registradas:
- suite alvo do BLOCO 3: 94 testes, 0 falhas, 0 erros;
- suite alvo do BLOCO 4: 55 testes, 0 falhas, 0 erros;
- `AlunoFlashcardControllerIntegrationTest`: 8 cenarios obrigatorios do fluxo aluno.

Cobertura do BLOCO 4:
- listagem de publicadas apenas das turmas do aluno;
- aluno sem turmas retorna lista vazia;
- detalhe de colecao publicada com cards em ordem;
- detalhe de outra turma retorna 403;
- detalhe de rascunho retorna 403;
- detalhe inexistente retorna 404;
- professor bloqueado no endpoint de aluno;
- aluno bloqueado no endpoint professor.

---

## 10. Riscos residuais e decisoes conscientes

| Risco | Severidade atual | Observacao |
|---|---|---|
| `max(ordem)+1` sob concorrencia | baixo/medio | risco ja conhecido para insercoes simultaneas |
| `countByColecaoId` por item na listagem | baixo | aceitavel no volume inicial, possivel N+1 |
| rate limiter em memoria | baixo/medio | suficiente para ambiente atual, nao distribuido |
| politica de admin no endpoint aluno | baixo | segue padrao de provas; admin sem perfil aluno recebe 403 |
| falta de teste de escrita em rota aluno | baixo | controller nao expoe metodos de escrita |
| ausencia de Swagger detalhado nos novos endpoints | baixo | contrato esta consolidado nesta documentacao |

---

## 11. Estado arquitetural final da trilha Flashcards

O modulo atende o ciclo principal:

1. professor cria colecao;
2. professor adiciona cards manualmente ou por LLM;
3. professor publica para uma turma;
4. aluno matriculado consome a colecao;
5. aluno de outra turma ou recurso rascunho permanece bloqueado.

Classificacao:
- backend funcionalmente pronto para integracao frontend;
- arquitetura em camadas preservada;
- regras criticas centralizadas em service;
- contratos HTTP padronizados;
- riscos residuais conhecidos e nao bloqueantes.

---

## 12. Referencias de origem

- `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- `docs/features/2026-04-19-feature-modulo-flashcards-unificada.md`
- `docs/etapas/2026-04-20-12-modulo-flashcards-bloco-3-geracao-llm.md`
- `docs/etapas/2026-04-21-13-modulo-flashcards-bloco-4-aluno.md`
- `tasks/bloco4-flashcard-aluno/final_receipt.md`
- `tasks/bloco4-flashcard-aluno/delivery_pack.md`
