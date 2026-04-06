# Proximo modulo a ser implementado

GERADO PELO OPENCODE -> OPUS 4.5

> Documento de planejamento tecnico — Ilumina  
> Data: 2026-04-06  
> Autor: Analise automatizada com base na documentacao do projeto

---

## 1. Resumo executivo

### Qual modulo deve ser implementado

**Modulo Aluno — Entidade, CRUD e Vinculo Aluno-Turma**

### Por que ele e o proximo passo mais adequado

O modulo de Aluno e a proxima peca fundamental que falta para completar o ciclo basico de usuarios do sistema. Sem ele:
- O contrato JWT retorna `alunoId: null` permanentemente
- Nao e possivel matricular alunos em turmas
- Os modulos de Provas e Flashcards nao tem consumidor final (aluno)
- A proposta de valor do sistema (avaliacao e revisao para alunos) nao pode ser entregue

O modulo de Aluno ja possui:
- Decisao canonica de modelagem documentada e congelada
- Padrao de implementacao estabelecido pelo modulo Professor
- Dependencias resolvidas (User, Turma ja existem)
- Planejamento detalhado no documento de execucao

### Qual problema ele resolve

1. **Lacuna de identidade**: O sistema possui dois perfis de usuario (professor e aluno), mas apenas professor esta implementado
2. **Contrato JWT incompleto**: Claims de `alunoId` sempre nulas
3. **Impossibilidade de matricula**: Sem entidade Aluno, nao ha como vincular estudantes a turmas
4. **Bloqueio de funcionalidades downstream**: Modulos de Provas e Flashcards dependem de Aluno para consumo de conteudo

### Qual valor ele agrega ao sistema

- **Completude do modelo de usuarios**: Sistema passa a suportar ambos os perfis planejados
- **Habilitacao de fluxos criticos**: Matricula, realizacao de provas, estudo de flashcards
- **Desbloqueia frontend**: Telas do aluno podem ser integradas com API real
- **Preparacao para modulos de conteudo**: Provas e Flashcards podem ser consumidos por alunos reais

---

## 2. Contexto analisado

### Resumo do que foi identificado no readme.md

O README.md (780 linhas) documenta o projeto Ilumina como uma plataforma web pedagogica com:

**Objetivo geral:**
- Automatizar geracao de avaliacoes e flashcards via LLM
- Centralizar gerenciamento de professores, turmas e alunos

**Modulos planejados (Fase 1):**
1. Gestao de avaliacoes — provas com questoes geradas via LLM
2. Turmas e alunos — cadastro e organizacao por nivel de ensino
3. Flashcards — colecoes geradas por IA para revisao

**Requisitos funcionais relacionados ao Aluno:**
- RF-03: Cadastro de usuario (inclui alunos)
- RF-07: Listagem de alunos por turma
- RF-11: Matricula de aluno em turma (N:N)
- RF-16: Realizacao de prova pelo aluno
- RF-23: Estudo de flashcards pelo aluno

**Modelagem de dados para Aluno:**
- Tabela `alunos`: id, nome, email (unico), senha_hash, sexo, data_cadastro
- Tabela `aluno_turma`: relacionamento N:N aluno-turma

**Stakeholder Aluno:**
- Consumidor final de avaliacoes e flashcards
- Realiza provas e utiliza flashcards como revisao

### Resumo do que foi identificado na pasta docs/

**Estado atual do sistema (2026-04-05):**

Implementado:
- Autenticacao JWT com access + refresh token
- Claims enriquecidas (userId, professorId, alunoId, roles)
- Modulo Professor (CRUD completo)
- Modulo Turma (CRUD + vinculo professor-turma N:N)
- 38 testes de integracao passando

Nao implementado:
- Entidade Aluno
- Vinculo aluno-turma
- Modulos de Provas e Flashcards
- Integracao LLM
- Frontend (diretorio vazio)

**Decisao canonica de modelagem (2026-04-04):**
- User e a identidade autenticavel unica
- Professor e perfil 1:1 de User — **ja implementado**
- Aluno e perfil 1:1 de User — **pendente**
- Roles ficam em User (N:N)
- Credenciais somente em User (email, senha, active)

**Lembrete tecnico (JWT claims):**
- `alunoId` esta no contrato mas retorna `null`
- Implementacao depende do modulo Aluno

**Planejamento tecnico (2026-04-05):**
- Task C-01: Modulo Aluno — Entidade e CRUD — **Alta prioridade, prazo 09/04-16/04**
- Task C-02: Vinculo aluno-turma — **Alta prioridade, prazo 16/04-21/04**
- Sequencia: C-01 -> C-02 -> C-03 (Provas) -> C-05 (Flashcards) -> C-07 (Area do aluno)

### Estado atual do sistema

| Componente | Status | Observacoes |
|------------|--------|-------------|
| User + UserRole | Completo | Identidade unificada, roles N:N |
| Autenticacao JWT | Completo | Access + refresh + claims |
| Professor | Completo | CRUD + desativacao logica |
| Turma | Completo | CRUD + vinculo professor N:N |
| **Aluno** | **Nao iniciado** | **Proximo passo** |
| Aluno-Turma | Nao iniciado | Depende de Aluno |
| Provas | Nao iniciado | Depende de Aluno-Turma |
| Flashcards | Nao iniciado | Depende de Aluno-Turma |
| LLM Integration | Nao iniciado | — |
| Frontend | Nao iniciado | Diretorio vazio |

### Lacunas encontradas

1. **Perfil Aluno inexistente**: Metade do modelo de usuarios nao existe
2. **Claim alunoId sempre null**: Contrato JWT incompleto
3. **Sem matricula de alunos**: Tabela `aluno_turma` nao existe
4. **Sem consumo de conteudo**: Aluno nao pode acessar provas nem flashcards
5. **Frontend bloqueado**: Telas do aluno nao podem ser integradas

### Dependencias ja existentes relacionadas ao modulo proposto

**Dependencias satisfeitas:**
- User (entidade base de identidade) — implementado
- UserRole (roles de acesso) — implementado, inclui ROLE_ALUNO
- Turma (para vinculo N:N) — implementado
- JwtTokenService (para resolver alunoId) — implementado, aguardando Aluno
- AuthService (para retornar alunoId) — implementado, aguardando Aluno
- GlobalExceptionHandler — implementado
- ApiResponse — implementado
- SecurityConfig — implementado

**Dependencias externas:**
- Nenhuma

---

## 3. Justificativa da escolha

### Por que este modulo foi escolhido em vez de outros

**Alternativas consideradas:**

1. **Modulo Provas**: Depende de Aluno para consumo; seria implementado sem consumidor final
2. **Modulo Flashcards**: Mesma situacao de Provas
3. **Integracao LLM**: Agrega valor apenas quando ha provas/flashcards; ainda nao ha provedor definido
4. **Frontend**: Ja pode iniciar com mocks, mas integracoes de aluno dependem do backend

**Razoes para escolher Aluno:**

1. **Sequencia logica**: User -> Professor -> **Aluno** -> Turmas completas -> Provas/Flashcards
2. **Padrao estabelecido**: Professor ja serve como template; implementacao e previsivel
3. **Menor risco**: Complexidade baixa-media; nenhuma dependencia externa
4. **Maior desbloqueio**: Habilita matricula, provas, flashcards e area do aluno
5. **Planejamento existente**: Task C-01 ja detalhada no documento de execucao
6. **Prazo critico**: Prazo original era 09/04-16/04; atraso impacta toda a cadeia

### Impacto tecnico

| Aspecto | Impacto |
|---------|---------|
| Banco de dados | +2 tabelas (alunos, aluno_turma) |
| Backend | +1 entidade, +1 service, +1 controller, DTOs |
| Seguranca | Resolve alunoId no JWT |
| Testes | +15-20 testes de integracao estimados |
| API | +6-8 endpoints REST |

### Impacto de negocio

| Aspecto | Impacto |
|---------|---------|
| Proposta de valor | Aluno pode usar a plataforma |
| Stakeholder Aluno | Passa a existir no sistema |
| Fluxo pedagogico | Matricula -> Prova -> Resultado -> Flashcard |
| Diferencial competitivo | Sistema completo para ambos os perfis |

### Impacto na experiencia do usuario

| Perfil | Impacto |
|--------|---------|
| Professor | Pode visualizar e gerenciar alunos em suas turmas |
| Aluno | Pode se cadastrar, matricular e acessar conteudo |
| Admin | Pode gerenciar todos os alunos |

### Relacao com a arquitetura atual

O modulo de Aluno:
- Segue **exatamente** o padrao do modulo Professor (1:1 com User)
- Reutiliza infraestrutura existente (DTOs, Services, Controllers, Exceptions)
- Nao requer mudancas arquiteturais
- Mantem separacao identidade (User) x perfil de dominio (Aluno)
- Compativel com decisao canonica documentada

---

## 4. Escopo do modulo

### Objetivo do modulo

Implementar o perfil de Aluno no sistema Ilumina, permitindo:
- Cadastro de alunos com vinculo a User
- Operacoes CRUD sobre o perfil
- Resolucao de alunoId no JWT
- Vinculo N:N entre alunos e turmas (matricula)

### Responsabilidades

1. **Gestao de perfil Aluno**: Criar, ler, atualizar, desativar
2. **Vinculo com User**: Manter relacao 1:1 transacional
3. **Atribuicao de role**: Garantir ROLE_ALUNO na criacao
4. **Resolucao de claims**: Preencher alunoId no JWT
5. **Matricula em turmas**: Vincular alunos a turmas (N:N)
6. **Listagem por turma**: Permitir que professor veja alunos de suas turmas

### Funcionalidades principais

**4.1 CRUD de Aluno**

| Operacao | Endpoint | Autorizacao |
|----------|----------|-------------|
| Criar | POST /api/v1/aluno | Publica ou autenticada (definir) |
| Listar | GET /api/v1/aluno | ROLE_ADMIN |
| Detalhar | GET /api/v1/aluno/{id} | ROLE_ADMIN ou proprio aluno |
| Atualizar | PUT /api/v1/aluno/{id} | ROLE_ADMIN ou proprio aluno |
| Desativar | PATCH /api/v1/aluno/{id}/deactivate | ROLE_ADMIN |

**4.2 Matricula Aluno-Turma**

| Operacao | Endpoint | Autorizacao |
|----------|----------|-------------|
| Matricular | POST /api/v1/turmas/{id}/alunos | ROLE_ADMIN ou professor vinculado |
| Desmatricular | DELETE /api/v1/turmas/{id}/alunos/{alunoId} | ROLE_ADMIN ou professor vinculado |
| Listar alunos da turma | GET /api/v1/turmas/{id}/alunos | ROLE_ADMIN ou professor vinculado |
| Listar turmas do aluno | GET /api/v1/aluno/{id}/turmas | ROLE_ADMIN ou proprio aluno |

### Entradas e saidas

**CreateAlunoRequest:**
```json
{
  "name": "Aluno Teste",
  "email": "aluno@escola.com",
  "password": "123456",
  "matricula": "2026001",
  "sexo": "Masculino"
}
```

**AlunoResponse:**
```json
{
  "id": "<uuid>",
  "userId": "<uuid>",
  "name": "Aluno Teste",
  "email": "aluno@escola.com",
  "matricula": "2026001",
  "sexo": "Masculino",
  "active": true,
  "createdAt": "2026-04-06T10:00:00Z"
}
```

**CreateAlunoResponse (com tokens):**
```json
{
  "id": "<uuid>",
  "userId": "<uuid>",
  "name": "Aluno Teste",
  "email": "aluno@escola.com",
  "matricula": "2026001",
  "sexo": "Masculino",
  "active": true,
  "createdAt": "2026-04-06T10:00:00Z",
  "token": "<access-token>",
  "refreshToken": "<refresh-token>",
  "type": "Bearer",
  "roles": ["ROLE_ALUNO"]
}
```

### Regras de negocio

| ID | Regra | Validacao |
|----|-------|-----------|
| RN-A01 | Email unico no sistema | Conflito se email ja existe em User |
| RN-A02 | Matricula unica | Conflito se matricula ja cadastrada |
| RN-A03 | Aluno vinculado a User | Relacao 1:1 via user_id unico |
| RN-A04 | ROLE_ALUNO obrigatoria | Atribuir role automaticamente na criacao |
| RN-A05 | Desativacao logica | user.active = false, preservar perfil |
| RN-A06 | Matricula unica por turma | Constraint (aluno_id, turma_id) unico |
| RN-A07 | Aluno so ve suas turmas | Listagem restrita por vinculo |
| RN-A08 | Professor ve alunos de suas turmas | Listagem restrita por vinculo |

### Integracoes necessarias

| Sistema | Tipo | Descricao |
|---------|------|-----------|
| User | Interno | Criacao transacional User + Aluno |
| UserRole | Interno | Atribuicao de ROLE_ALUNO |
| Turma | Interno | Vinculo N:N via AlunoTurma |
| JwtTokenService | Interno | Resolver alunoId nas claims |
| AuthService | Interno | Retornar alunoId no payload de auth |

### Requisitos tecnicos

| Requisito | Especificacao |
|-----------|---------------|
| Entidade Aluno | JPA entity com relacao @OneToOne para User |
| Entidade AlunoTurma | JPA entity pivot com constraint unique |
| Repository | Spring Data JPA (AlunoRepository, AlunoTurmaRepository) |
| Service | AlunoService com transacoes @Transactional |
| Controller | REST controller com Bean Validation |
| DTOs | CreateAlunoRequest, UpdateAlunoRequest, AlunoResponse, CreateAlunoResponse |
| Seguranca | Configuracao em SecurityConfig para novas rotas |
| Testes | Testes de integracao com H2 |

---

## 5. Planejamento de implementacao

### Passo a passo detalhado

**Fase 1: Entidade e CRUD de Aluno (C-01)**

| Passo | Descricao | Arquivos |
|-------|-----------|----------|
| 1 | Criar entidade Aluno com campos e relacao 1:1 para User | `entity/Aluno/Aluno.java` |
| 2 | Criar AlunoRepository | `repository/Aluno/AlunoRepository.java` |
| 3 | Criar DTOs de Aluno | `dto/aluno/CreateAlunoRequest.java`, `UpdateAlunoRequest.java`, `AlunoResponse.java`, `CreateAlunoResponse.java` |
| 4 | Criar AlunoService seguindo padrao de ProfessorService | `service/Aluno/AlunoService.java` |
| 5 | Criar AlunoController com endpoints REST | `controller/Aluno/AlunoController.java` |
| 6 | Configurar rotas em SecurityConfig | `security/SecurityConfig.java` |
| 7 | Resolver alunoId no JwtTokenService | `security/jwt/JwtTokenService.java` |
| 8 | Atualizar AuthService para buscar Aluno | `service/Auth/AuthService.java` |
| 9 | Criar testes de integracao | `test/.../AlunoControllerIntegrationTest.java` |
| 10 | Documentar feature e API | `docs/features/`, `docs/api/` |

**Fase 2: Vinculo Aluno-Turma (C-02)**

| Passo | Descricao | Arquivos |
|-------|-----------|----------|
| 11 | Criar entidade AlunoTurma com constraint unique | `entity/Turma/AlunoTurma.java` |
| 12 | Criar AlunoTurmaRepository | `repository/Turma/AlunoTurmaRepository.java` |
| 13 | Adicionar metodos de matricula no TurmaService | `service/Turma/TurmaService.java` |
| 14 | Adicionar endpoints de matricula no TurmaController | `controller/Turma/TurmaController.java` |
| 15 | Adicionar endpoint de turmas do aluno no AlunoController | `controller/Aluno/AlunoController.java` |
| 16 | Criar testes de integracao para matricula | `test/.../TurmaControllerIntegrationTest.java` |
| 17 | Documentar evolucao do modulo | `docs/features/`, `docs/api/` |

### Ordem recomendada das entregas

```
Semana 1 (Fase 1):
├── Dia 1-2: Entidade + Repository + DTOs
├── Dia 3-4: Service + Controller
├── Dia 5: Seguranca + JWT claims
└── Dia 6-7: Testes + Documentacao

Semana 2 (Fase 2):
├── Dia 1-2: Entidade AlunoTurma + Repository
├── Dia 3-4: Endpoints de matricula
└── Dia 5: Testes + Documentacao
```

### Estrutura de pastas/arquivos esperada

```
backend/src/main/java/br/com/ilumina/
├── entity/
│   ├── Aluno/
│   │   └── Aluno.java              [NOVO]
│   └── Turma/
│       └── AlunoTurma.java         [NOVO]
├── repository/
│   ├── Aluno/
│   │   └── AlunoRepository.java    [NOVO]
│   └── Turma/
│       └── AlunoTurmaRepository.java [NOVO]
├── dto/
│   └── aluno/
│       ├── CreateAlunoRequest.java  [NOVO]
│       ├── UpdateAlunoRequest.java  [NOVO]
│       ├── AlunoResponse.java       [NOVO]
│       └── CreateAlunoResponse.java [NOVO]
├── service/
│   ├── Aluno/
│   │   └── AlunoService.java       [NOVO]
│   └── Turma/
│       └── TurmaService.java       [ALTERADO]
├── controller/
│   ├── Aluno/
│   │   └── AlunoController.java    [NOVO]
│   └── Turma/
│       └── TurmaController.java    [ALTERADO]
└── security/
    ├── SecurityConfig.java         [ALTERADO]
    └── jwt/
        └── JwtTokenService.java    [ALTERADO]

backend/src/test/java/br/com/ilumina/
└── controller/
    ├── Aluno/
    │   └── AlunoControllerIntegrationTest.java [NOVO]
    └── Turma/
        └── TurmaControllerIntegrationTest.java [ALTERADO]

docs/
├── features/
│   └── 2026-04-XX-feature-modulo-aluno-crud.md [NOVO]
├── api/
│   └── 2026-04-XX-api-modulo-aluno.md [NOVO]
└── etapas/
    └── 2026-04-XX-07-modulo-aluno-crud.md [NOVO]
```

### Endpoints detalhados

**Base path:** `/api/v1/aluno`

| Metodo | Path | Descricao | Auth | Autorizacao |
|--------|------|-----------|------|-------------|
| POST | /api/v1/aluno | Criar aluno | Opcional* | Publica |
| GET | /api/v1/aluno | Listar alunos | JWT | ROLE_ADMIN |
| GET | /api/v1/aluno/{id} | Detalhar aluno | JWT | ROLE_ADMIN ou proprio |
| PUT | /api/v1/aluno/{id} | Atualizar aluno | JWT | ROLE_ADMIN ou proprio |
| PATCH | /api/v1/aluno/{id}/deactivate | Desativar aluno | JWT | ROLE_ADMIN |
| GET | /api/v1/aluno/{id}/turmas | Turmas do aluno | JWT | ROLE_ADMIN ou proprio |

*Nota: Seguir decisao do modulo Professor — cadastro publico para onboarding simplificado.

**Endpoints de matricula (em TurmaController):**

| Metodo | Path | Descricao | Auth | Autorizacao |
|--------|------|-----------|------|-------------|
| POST | /api/v1/turmas/{id}/alunos | Matricular aluno | JWT | ROLE_ADMIN ou professor vinculado |
| DELETE | /api/v1/turmas/{id}/alunos/{alunoId} | Desmatricular | JWT | ROLE_ADMIN ou professor vinculado |
| GET | /api/v1/turmas/{id}/alunos | Listar alunos | JWT | ROLE_ADMIN ou professor vinculado |

### Servicos e componentes envolvidos

| Componente | Acao | Detalhes |
|------------|------|----------|
| AlunoService | Criar | Logica de criacao transacional |
| AlunoService | Listar | Filtro por active, paginacao futura |
| AlunoService | Detalhar | Busca por ID com validacao |
| AlunoService | Atualizar | Campos parciais, validacao de email |
| AlunoService | Desativar | user.active = false |
| TurmaService | Matricular | Criar vinculo AlunoTurma |
| TurmaService | Desmatricular | Remover vinculo |
| TurmaService | Listar alunos | Buscar por turma_id |
| JwtTokenService | Gerar token | Incluir alunoId nas claims |
| AuthService | Login/Refresh | Resolver e retornar alunoId |

### Alteracoes em banco de dados

**Nova tabela: alunos**

```sql
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  matricula VARCHAR(50) NOT NULL UNIQUE,
  sexo VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alunos_user_id ON alunos(user_id);
CREATE INDEX idx_alunos_matricula ON alunos(matricula);
```

**Nova tabela: aluno_turma**

```sql
CREATE TABLE aluno_turma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id),
  turma_id UUID NOT NULL REFERENCES turmas(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(aluno_id, turma_id)
);

CREATE INDEX idx_aluno_turma_aluno ON aluno_turma(aluno_id);
CREATE INDEX idx_aluno_turma_turma ON aluno_turma(turma_id);
```

### Impacto em frontend, backend e infraestrutura

| Camada | Impacto |
|--------|---------|
| Backend | Novas entidades, services, controllers, DTOs, testes |
| Frontend | Pode integrar telas de aluno com API real |
| Infraestrutura | Nenhum — mesma stack, mesmo banco |
| Seguranca | Novas rotas em SecurityConfig |
| JWT | Claims alunoId preenchida corretamente |

---

## 6. Criterios de aceite

### Criterios funcionais

| ID | Criterio | Validacao |
|----|----------|-----------|
| CF-01 | Aluno pode se cadastrar com nome, email, senha, matricula e sexo | POST retorna 201 com tokens |
| CF-02 | Aluno recebe ROLE_ALUNO automaticamente | roles[] contem ROLE_ALUNO |
| CF-03 | Aluno pode fazer login apos cadastro | POST /auth/login funciona |
| CF-04 | alunoId aparece no JWT apos login | Claims contem alunoId valido |
| CF-05 | Admin pode listar todos os alunos | GET retorna lista paginavel |
| CF-06 | Admin ou proprio aluno pode ver detalhes | GET /{id} retorna dados |
| CF-07 | Admin ou proprio aluno pode editar | PUT /{id} atualiza dados |
| CF-08 | Admin pode desativar aluno | PATCH /{id}/deactivate funciona |
| CF-09 | Professor pode matricular aluno em sua turma | POST /turmas/{id}/alunos funciona |
| CF-10 | Professor pode desmatricular aluno de sua turma | DELETE funciona |
| CF-11 | Professor pode ver alunos de sua turma | GET /turmas/{id}/alunos retorna lista |
| CF-12 | Aluno pode ver suas turmas | GET /aluno/{id}/turmas retorna lista |

### Criterios tecnicos

| ID | Criterio | Validacao |
|----|----------|-----------|
| CT-01 | Entidade Aluno com @OneToOne para User | Relacionamento JPA correto |
| CT-02 | Transacao atomica na criacao | User + Aluno criados juntos ou nenhum |
| CT-03 | Constraint de email unico | 409 Conflict se duplicado |
| CT-04 | Constraint de matricula unica | 409 Conflict se duplicada |
| CT-05 | Constraint de vinculo unico | 400 se aluno ja matriculado na turma |
| CT-06 | alunoId resolvido no JwtTokenService | Claims preenchidas corretamente |
| CT-07 | Testes de integracao passando | >= 15 testes novos, todos verdes |
| CT-08 | Suite existente nao quebrada | 38+ testes continuam passando |

### Validacoes esperadas

**Validacoes de entrada (CreateAlunoRequest):**
- name: obrigatorio, max 100
- email: obrigatorio, formato valido, max 100
- password: obrigatorio, min 6
- matricula: obrigatorio, max 50
- sexo: obrigatorio, max 30

**Validacoes de negocio:**
- Email nao pode existir em outro User
- Matricula nao pode existir em outro Aluno
- Aluno so pode ser desativado uma vez
- Aluno so pode ser matriculado em turma ativa
- Vinculo aluno-turma deve ser unico

### Comportamento esperado em cenarios normais e de erro

**Cenarios de sucesso:**

| Cenario | Request | Response |
|---------|---------|----------|
| Criar aluno | POST valido | 201 Created + tokens |
| Login de aluno | POST /auth/login | 200 OK + alunoId nas claims |
| Listar alunos (admin) | GET + JWT admin | 200 OK + lista |
| Matricular aluno | POST /turmas/{id}/alunos | 200 OK |
| Listar alunos da turma | GET /turmas/{id}/alunos | 200 OK + lista |

**Cenarios de erro:**

| Cenario | Request | Response |
|---------|---------|----------|
| Email duplicado | POST com email existente | 409 Conflict |
| Matricula duplicada | POST com matricula existente | 409 Conflict |
| Campos invalidos | POST sem campos obrigatorios | 400 Bad Request |
| Sem autenticacao | GET /aluno sem token | 401 Unauthorized |
| Sem permissao | GET /aluno com token de aluno | 403 Forbidden |
| Aluno nao encontrado | GET /aluno/{id-inexistente} | 404 Not Found |
| Aluno ja desativado | PATCH /deactivate em inativo | 400 Bad Request |
| Vinculo duplicado | POST matricula existente | 400 Bad Request |
| Turma inativa | POST matricula em turma inativa | 400 Bad Request |

---

## 7. Riscos e pontos de atencao

### Riscos tecnicos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Colisao de email entre perfis | Baixa | Medio | Email unico em User, nao em Professor/Aluno |
| N+1 queries em listagem de alunos | Media | Medio | Usar fetch join ou Entity Graph |
| Inconsistencia transacional | Baixa | Alto | @Transactional em metodos de criacao |
| Claims JWT com tamanho excessivo | Baixa | Baixo | Manter apenas IDs essenciais |

### Dependencias externas

| Dependencia | Tipo | Status | Risco |
|-------------|------|--------|-------|
| PostgreSQL | Banco | Disponivel | Nenhum |
| Spring Boot | Framework | Configurado | Nenhum |
| JJWT | Biblioteca | Configurada | Nenhum |

### Possiveis gargalos

| Gargalo | Causa | Mitigacao |
|---------|-------|-----------|
| Performance em listagem | Muitos alunos | Paginacao obrigatoria |
| Tempo de resposta | Queries N+1 | Otimizacao de fetch |
| Conflitos de merge | Edicao simultanea de TurmaService | Coordenacao com equipe |

### Cuidados de compatibilidade

| Area | Cuidado |
|------|---------|
| Contrato JWT | Manter campos existentes (alunoId ja esta no contrato) |
| API Professor | Nao alterar endpoints existentes |
| API Turma | Adicionar endpoints sem quebrar os atuais |
| Testes existentes | Garantir que suite continua verde |
| Frontend | Contratos documentados devem ser respeitados |

---

## 8. Testes recomendados

### Testes unitarios

| Classe | Metodo | Cenario |
|--------|--------|---------|
| AlunoService | create | Criacao com sucesso |
| AlunoService | create | Email duplicado |
| AlunoService | create | Matricula duplicada |
| AlunoService | update | Atualizacao parcial |
| AlunoService | deactivate | Desativacao valida |
| AlunoService | deactivate | Ja desativado |
| JwtTokenService | generateAccessToken | Claims com alunoId |

### Testes de integracao

| Classe | Cenario | Metodo HTTP |
|--------|---------|-------------|
| AlunoControllerIntegrationTest | Criar aluno com sucesso | POST |
| AlunoControllerIntegrationTest | Criar aluno com email duplicado | POST |
| AlunoControllerIntegrationTest | Criar aluno com matricula duplicada | POST |
| AlunoControllerIntegrationTest | Criar aluno com campos invalidos | POST |
| AlunoControllerIntegrationTest | Listar alunos como admin | GET |
| AlunoControllerIntegrationTest | Listar alunos como aluno (403) | GET |
| AlunoControllerIntegrationTest | Detalhar proprio perfil | GET |
| AlunoControllerIntegrationTest | Detalhar outro perfil (403) | GET |
| AlunoControllerIntegrationTest | Atualizar proprio perfil | PUT |
| AlunoControllerIntegrationTest | Desativar como admin | PATCH |
| AlunoControllerIntegrationTest | Desativar ja desativado (400) | PATCH |
| TurmaControllerIntegrationTest | Matricular aluno | POST |
| TurmaControllerIntegrationTest | Matricular aluno duplicado (400) | POST |
| TurmaControllerIntegrationTest | Desmatricular aluno | DELETE |
| TurmaControllerIntegrationTest | Listar alunos da turma | GET |
| AuthIntegrationTest | Login de aluno retorna alunoId | POST |
| AuthIntegrationTest | Refresh de aluno mantem alunoId | POST |

### Testes de fluxo

| Fluxo | Passos | Validacao |
|-------|--------|-----------|
| Onboarding completo | Cadastro -> Login -> Matricula | Aluno matriculado em turma |
| Ciclo de vida | Criar -> Editar -> Desativar | user.active = false |
| Matricula multipla | Aluno em 3 turmas | Listagem retorna 3 turmas |

### Testes manuais

| Cenario | Procedimento | Resultado esperado |
|---------|--------------|-------------------|
| Cadastro via Swagger | Preencher formulario | 201 + tokens |
| Login com aluno | Usar email/senha | JWT com alunoId |
| Matricula via curl | POST com JSON | 200 OK |
| Listagem de turmas | GET como aluno | Apenas suas turmas |

### Cenarios criticos

| Cenario | Por que e critico | Validacao |
|---------|-------------------|-----------|
| Transacao de criacao | User e Aluno devem ser atomicos | Rollback se falhar |
| alunoId no JWT | Frontend depende disso | Claims sempre corretas |
| Unicidade de email | Evita duplicacao de identidade | 409 Conflict |
| Unicidade de matricula | Regra de negocio academica | 409 Conflict |
| Autorizacao por vinculo | Aluno so ve suas turmas | 403 se tentar ver outras |

---

## 9. Proximos passos apos esse modulo

### O que provavelmente vira depois

**Sequencia recomendada:**

1. **Modulo Provas (C-03)** — 18/04-30/04
   - Entidades: Prova, Questao, Alternativa
   - CRUD com status rascunho/publicada
   - Publicacao para turma

2. **Integracao LLM para Provas (C-04)** — 01/05-10/05
   - LlmIntegrationService
   - Geracao de questoes automatica
   - Validacao de resposta JSON

3. **Modulo Flashcards (C-05)** — 01/05-12/05
   - Entidades: ColecaoFlashcards, Flashcard
   - CRUD com status
   - Publicacao para turma

4. **Integracao LLM para Flashcards (C-06)** — 10/05-15/05
   - Reutilizar LlmIntegrationService
   - Geracao de flashcards automatica

5. **Area do Aluno — Consumo (C-07)** — 15/05-25/05
   - Endpoints de provas disponiveis
   - Submissao de respostas
   - Endpoints de flashcards disponiveis

### Como esse modulo prepara o sistema para a proxima evolucao

| Aspecto | Preparacao |
|---------|------------|
| **Provas** | Aluno pode ser associado a provas via turma |
| **Flashcards** | Aluno pode acessar colecoes via turma |
| **Area do aluno** | Endpoints de consumo dependem de Aluno existir |
| **Frontend** | Telas do aluno podem usar API real |
| **JWT** | alunoId permite navegacao orientada por perfil |
| **Matricula** | Aluno vinculado a turma pode ver conteudo publicado |

**Diagrama de dependencias:**

```
Aluno (C-01)
    │
    ├── Aluno-Turma (C-02)
    │       │
    │       ├── Provas (C-03)
    │       │       │
    │       │       └── LLM Provas (C-04)
    │       │
    │       ├── Flashcards (C-05)
    │       │       │
    │       │       └── LLM Flashcards (C-06)
    │       │
    │       └── Area do Aluno (C-07)
    │
    └── Frontend Aluno (integracao)
```

---

## 10. Referencias

### Documentos base

- `README.md` — Requisitos funcionais e modelagem
- `docs/arquitetura/2026-04-04-decisao-modelagem-user-professor-aluno.md` — Decisao canonica
- `docs/arquitetura/2026-04-05-estado-atual-do-sistema.md` — Estado atual
- `docs/planejamento/2026-04-05-planejamento-tecnico-execucao.md` — Backlog detalhado

### Documentos de referencia (implementacao similar)

- `docs/features/2026-04-05-feature-modulo-professor-crud-inicial.md` — Padrao de feature
- `docs/api/2026-04-05-api-modulo-professor.md` — Padrao de API
- `docs/etapas/2026-04-05-04-modulo-professor-crud-inicial.md` — Padrao de etapa

### Contratos relacionados

- `docs/api/2026-04-05-api-auth-jwt-refresh-claims.md` — JWT com alunoId
- `docs/api/2026-04-05-api-modulo-turma.md` — Endpoints de turma

---

*Documento gerado em 2026-04-06 com base na analise completa da documentacao do projeto Ilumina.*
