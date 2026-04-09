# Estado Atual do Sistema - Módulo Avaliações (Bloco 1 - Fundação)

Data da varredura: 2026-04-09  
Escopo analisado: backend - entidades, repositórios e DTOs do domínio de Prova/Questão/Alternativa  
Status: ✅ **Processional** (Bloco 1 completo, Bloco 2 em planejamento)

---

## 1. Resumo executivo

O backend agora possui a fundação do módulo de Gestão de Avaliações implementada:
- Entidades JPA para Prova (raiz agregado), Questão e Alternativa com relacionamentos bidireccionais protegidos
- Enum `StatusProva` com estados `RASCUNHO` e `PUBLICADA`
- 7 queries base nos 3 repositórios (ProvaRepository, QuestaoRepository, AlternativaRepository)
- 11 DTOs com Bean Validation em português para contratos de API (7 Request + 4 Response)
- Padrões implementados: `@ToString.Exclude` para prevenir ciclos, `FetchType.LAZY` para performance, cascade + orphanRemoval para integridade
- 65/65 testes passando (zero regressão em código existente)
- Pronto para Bloco 2 (API e regras de publicação)

---

## 2. Estrutura funcional atual por domínio

### 2.1 Identidade e acesso (pré-existente)

Entidades:
- `User` - identidade base
- `UserRole` - perfis (ADMIN, PROFESSOR, ALUNO)

Professor e Aluno já existem com relações 1:1 com User.

### 2.2 Domínio Prova (NOVO - Bloco 1)

**Entidades principais:**

`StatusProva` (Enum):
- `RASCUNHO` - estado inicial, editável
- `PUBLICADA` - estado final, imutável para questões

`Prova` (raiz agregado):
- Relacionamento 1:1 com `Professor` (FK: `professor_id`)
- Relacionamento 1:1 com `Turma` (FK: `turma_id`)
- Relacionamento 1:N com `Questao` (mapeado, cascade ALL + orphanRemoval)
- Estados: `RASCUNHO` → `PUBLICADA` (→ `RASCUNHO` via despublicação)
- Campos: `titulo` (255 chars), `descricao` (TEXT), `disciplina` (100 chars), `qntQuestoes`, `status`, `createdAt`, `updatedAt`

`Questao` (entidade filho):
- Relacionamento N:1 com `Prova` (FK: `prova_id`)
- Relacionamento 1:N com `Alternativa` (mapeado, cascade ALL + orphanRemoval)
- Campos: `enunciado` (TEXT), `gabarito` (1 char: A/B/C/D), `pontuacao` (DECIMAL 5,2), `ordem` (sequência na prova)
- Gabarito obrigatoriamente corresponde a uma letra em Alternativa

`Alternativa` (entidade filho):
- Relacionamento N:1 com `Questao` (FK: `questao_id`)
- Campos: `letra` (1 char: A/B/C/D), `texto` (TEXT)
- Entre 2 a 4 alternativas por questão

### 2.3 Relacionamentos e Integridade

Modelo de dados visual:
```
professores ──1:N── provas ──1:N── questoes ──1:N── alternativas
turmas      ──1:N── provas
```

Proteções implementadas:
- `@ToString.Exclude` em 4 campos bidirecionais (Prova.questoes, Questao.prova, Questao.alternativas, Alternativa.questao) para prevenir StackOverflowError
- `cascade = CascadeType.ALL + orphanRemoval = true` em relacionamentos @OneToMany para garantir integridade ao deletar
- `FetchType.LAZY` em todas as relações para evitar N+1 queries

---

## 3. Arquitetura em camadas (estado real)

### 3.1 Camada de Entidades (`entity/Prova/`)

Arquivos:
- `StatusProva.java` - enum simples
- `Prova.java` - entidade raiz (estende BaseEntity com UUID + auditoria)
- `Questao.java` - entidade filho
- `Alternativa.java` - entidade filho

Todas herdam de `BaseEntity` que fornece:
- `id: UUID` (gerado via GenerationType.UUID)
- `createdAt: OffsetDateTime` (auditado via AuditingEntityListener)
- `updatedAt: OffsetDateTime` (auditado)

### 3.2 Camada de Repositórios (`repository/Prova/`)

Arquivos:
- `ProvaRepository.java` - 4 queries customizadas
- `QuestaoRepository.java` - 2 queries customizadas
- `AlternativaRepository.java` - 1 query customizada

Queries disponibilizadas (prontas para Bloco 2):
```
ProvaRepository:
  findByProfessorIdAndStatusOrderByCreatedAtDesc(UUID, StatusProva)
  findByProfessorIdOrderByCreatedAtDesc(UUID)
  findByTurmaIdAndStatus(UUID, StatusProva)
  findByTurmaIdInAndStatus(List<UUID>, StatusProva)

QuestaoRepository:
  findByProvaIdOrderByOrdem(UUID)
  countByProvaId(UUID)

AlternativaRepository:
  findByQuestaoIdOrderByLetra(UUID)
```

### 3.3 Camada de DTOs (`dto/prova/`)

**Request DTOs (7) com Bean Validation em português:**
- `CreateProvaRequest` - cria prova com título, descrição opcional, disciplina, qntQuestoes, turmaId obrigatório
- `UpdateProvaRequest` - todos os campos opcionais
- `CreateQuestaoRequest` - enunciado obrigatório, gabarito (A-D), pontuação, ordem, alternativas (2-4)
- `UpdateQuestaoRequest` - campos opcionais
- `CreateAlternativaRequest` - texto obrigatório, letra obrigatória
- `UpdateAlternativaRequest` - texto obrigatório
- `GerarQuestoesRequest` - tema e quantidade (1-20) para futura integração LLM (Bloco 3)

**Response DTOs (4) para serialização de API:**
- `ProvaResponse` - resposta de listagem com metadados (turmaNome, professorNome, totalQuestoes)
- `ProvaDetalheResponse` - ProvaResponse + descricao + lista completa de questões
- `QuestaoResponse` - questão com alternativas
- `AlternativaResponse` - letra + texto

---

## 4. Regras de negócio consolidadas (Bloco 1)

### 4.1 RN-01: Criação de Prova
- Apenas `ROLE_PROFESSOR` e `ROLE_ADMIN`
- Prova criada sempre em estado `RASCUNHO`
- Professor criador fica como dono permanente
- Turma destino deve existir e estar ativa

### 4.2 RN-02: Gabarito Obrigatório
- Campo `gabarito` em Questao obrigatoriamente corresponde a uma das letras (A/B/C/D) das Alternativas da mesma questão
- Validado em: criação manual, edição, geração via LLM (Bloco 3), publicação

### 4.3 RN-03: Prova Somente Editável em Rascunho
- Questões e alternativas **só podem ser criadas/editadas/removidas** enquanto prova está em `RASCUNHO`
- Após publicação (`PUBLICADA`), conteúdo é imutável até despublicação
- Despublicação é permitida apenas para professor dono ou admin

### 4.4 RN-05: Mínimo e Máximo de Alternativas
- Toda questão **deve ter entre 2 e 4 alternativas**
- Validado em: criação manual (DTO), geração LLM (pré-persistência), publicação (guard final)

### 4.5 RN-06: Validação LLM (Bloco 3)
- Antes de persistir questões geradas por LLM, validar:
  - JSON bem-formado
  - Campos obrigatórios presentes
  - Gabarito válido (A-D)
  - Gabariro corresponde a uma das alternativas
  - Entre 2 e 4 alternativas por questão
  - Sem duplicatas de enunciado
  - Sem falhas: **sem persistência parcial**

---

## 5. Status de testes e validação

### 5.1 Testes de Compilação

✅ `./mvnw clean compile`
- 78 arquivos fonte compilados com sucesso
- 0 erros críticos (avisos pré-existentes do Lombok apenas)

### 5.2 Testes de Integração (suite completa)

✅ `./mvnw clean test`
- **65/65 testes passando** (100% de taxa de sucesso)
- 0 falhas, 0 erros
- **Zero regressão** em código existente

Breakdown:
- AlunoControllerIntegrationTest: 14 testes ✅
- ProfessorControllerIntegrationTest: 13 testes ✅
- TurmaControllerIntegrationTest: 37 testes ✅
- IluminaBackendApplicationTests: 1 teste (context load) ✅

### 5.3 Verificação de Banco de Dados

✅ Hibernate DDL auto-update criou tabelas automaticamente:
- `provas` - com colunas corretas (titulo, descricao, status, professor_id, turma_id, created_at, updated_at)
- `questoes` - com colunas corretas (enunciado, gabarito, pontuacao, ordem, prova_id, created_at, updated_at)
- `alternativas` - com colunas corretas (texto, letra, questao_id, created_at, updated_at)

### 5.4 Validação de Segurança

✅ Correções aplicadas (Etapa 7):
- **G1 (Grave) — StackOverflowError:** Adicionado `@ToString.Exclude` em 4 campos bidirecionais
- **M2 (Médio) — Validação restritiva:** Aumentado limite de `descricao` de 500 para 2000 caracteres

---

## 6. Padrões de código adotados (alinhados com projeto)

| Aspecto | Padrão | Exemplo |
|--------|--------|---------|
| Entidades | Estender BaseEntity (UUID + auditoria) | `public class Prova extends BaseEntity` |
| Lombok | `@Data` para getter/setter/toString | Todas as entidades/DTOs |
| JPA | `@ManyToOne(fetch=LAZY)`, `@OneToMany(cascade=ALL, orphanRemoval=true)` | Relacionamentos padre-filho |
| Proteção de ciclos | `@ToString.Exclude` em bidirecionais | Prova.questoes, Questao.prova, etc |
| Enums | `@Enumerated(EnumType.STRING)` | StatusProva persistido como "RASCUNHO" no banco |
| DTOs | Java records com `@NotBlank`, `@Size`, `@Pattern` | CreateProvaRequest, ProvaResponse |
| Validação | Bean Validation em português | "O título é obrigatório" |
| FK naming | snake_case: `professor_id`, `turma_id` | Mantém convenção projeto |
| Queries | Method name derivation ou `@Query` para complexas | findByProfessorIdAndStatusOrderByCreatedAtDesc |

---

## 7. Próximas etapas (Bloco 2 em planejamento)

| Bloco | Fase | Objetivo | Dependências |
|-------|------|----------|--------------|
| 2 | 2.1 | CRUD de Prova (Professor) | Bloco 1 ✅ |
| 2 | 2.2 | CRUD de Questão e Alternativa | Bloco 1 ✅ |
| 2 | 2.3 | Publicação e Despublicação | Bloco 1 + 2.1 |
| 2 | 2.4 | Testes de Integração | Bloco 1 + 2.1/2.2/2.3 |
| 3 | 3.1 | Cliente LLM | Bloco 1 ✅ |
| 3 | 3.2 | Validador LLM | Bloco 3.1 |
| 3 | 3.3 | Endpoint Geração | Bloco 3.1/3.2 |
| 4 | 4.1 | Respostas do Aluno | Bloco 1 ✅ |
| 4 | 4.2 | Correção Automática | Bloco 4.1 |

---

## 8. Riscos residuais e observações

### 8.1 Risco M1 (Médio) - LazyInitializationException

**Contexto:** DTOs de Response contêm campos derivados (`turmaNome`, `professorNome`) que requerem traversal de relacionamentos lazy fora da transação.

**Status:** Documentado para Bloco 2. Será otimizado com `@EntityGraph` ou `JOIN FETCH` nas queries.

**Mitigação:** Service deve inicializar relacionamentos dentro da transação antes de retornar DTO.

### 8.2 Risco de Cascade Delete

**Contexto:** `cascade = ALL + orphanRemoval = true` em relacionamentos pai-filho pode causar deleção em cascata não intencional se relacionamento for mal gerenciado.

**Status:** Documentado no código. Padrão correto aplicado (equals/hashCode em entidades filho garante que `orphanRemoval` funciona corretamente).

**Recomendação:** Adicionar testes de integração para validar comportamento de cascade em Bloco 2.

### 8.3 Observação: FK Naming

Valores usados: `professor_id`, `turma_id`, `prova_id`, `questao_id`

Mantém convenção do projeto (snake_case). Confirmado em entidades existentes (Professor, Turma, Aluno).

---

## 9. Checklist de conclusão

- ✅ 4 entidades criadas (StatusProva, Prova, Questao, Alternativa)
- ✅ 3 repositórios com 7 queries base
- ✅ 11 DTOs com validação
- ✅ @ToString.Exclude adicionado (correção grave)
- ✅ Validação aumentada de 500 para 2000 chars (correção média)
- ✅ 65/65 testes passando (zero regressão)
- ✅ Compilação sem erros
- ✅ Banco criando tabelas corretamente
- ✅ Padrões alinhados com projeto
- ✅ Documentação criada

**Status final:** ✅ **PRONTO PARA BLOCO 2 (API e Regras)**

---

**Documentado em:** 2026-04-09  
**Etapa:** 7 (Final Receipt)  
**Responsável:** Eng Protocol (Copilot + Claude Code)
