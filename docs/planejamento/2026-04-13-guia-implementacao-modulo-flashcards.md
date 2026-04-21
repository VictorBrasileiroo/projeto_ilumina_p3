# Guia de Implementação — Módulo Flashcards

> **Versão:** 1.0 · **Data:** 2026-04-13
> **Autor:** Arquitetura técnica com base em varredura completa do repositório pós-Bloco 4 de Avaliações
> **Status:** Documento de referência para implementação — nenhum código de flashcards existe ainda

---

## Sumário

1. [Resumo Executivo do Módulo](#1-resumo-executivo-do-módulo)
2. [Estado Atual Confirmado do Sistema](#2-estado-atual-confirmado-do-sistema)
3. [Escopo do Módulo Flashcards](#3-escopo-do-módulo-flashcards)
4. [Fora de Escopo Explícito](#4-fora-de-escopo-explícito)
5. [Arquitetura Alvo](#5-arquitetura-alvo)
6. [Mapeamento de Requisitos](#6-mapeamento-de-requisitos)
7. [Plano por Blocos e Fases](#7-plano-por-blocos-e-fases)
8. [Dependências, Paralelismo e Gargalos](#8-dependências-paralelismo-e-gargalos)
9. [Estratégia de Branch e PR](#9-estratégia-de-branch-e-pr)
10. [Estratégia de Testes](#10-estratégia-de-testes)
11. [Estratégia de Rollout e Mitigação de Risco](#11-estratégia-de-rollout-e-mitigação-de-risco)
12. [Checklist de Pronto por Bloco e Final](#12-checklist-de-pronto-por-bloco-e-final)
13. [Matriz de Riscos](#13-matriz-de-riscos)
14. [Estimativa Relativa por Bloco](#14-estimativa-relativa-por-bloco)
15. [Decisões Técnicas Pendentes](#15-decisões-técnicas-pendentes)
16. [Definition of Ready e Definition of Done por Bloco](#16-definition-of-ready-e-definition-of-done-por-bloco)

---

## 1. Resumo Executivo do Módulo

### O que é

O módulo **Flashcards** é o segundo módulo funcional central da plataforma Ilumina. Ele abrange o ciclo de vida completo de uma coleção de flashcards: criação pelo professor, adição manual ou geração automática via LLM, revisão editorial (frente/verso de cada card), publicação para turmas vinculadas e estudo pelo aluno no formato frente/verso.

### Por que é crítico

É o módulo que entrega a segunda proposta de valor do produto: **material de revisão gerado automaticamente para os alunos**. Sem ele, o sistema entrega apenas avaliações — e o diferencial de revisão assíncrona com IA fica inexistente para a AB1.

### Nível de complexidade

**Média.** Menor que o módulo de Avaliações porque:
- Sem lógica de resposta/correção automática (sem gabarito, sem nota)
- Sem rastreamento de submissão do aluno
- A integração LLM já existe — apenas se estende com novo método e novo prompt
- O aluno consome passivamente (leitura apenas, sem POST de resposta)

A maior fonte de risco é a **extensão do `LlmService` existente** sem quebrar o fluxo de questões e o prompt de geração de flashcards, que tem estrutura JSON diferente.

### Pré-requisito inviolável

**O módulo de Avaliações (Blocos 1–4) deve estar 100% implementado e testado antes do início.** A confirmação de 75 testes passando em 2026-04-09 satisfaz essa condição.

---

## 2. Estado Atual Confirmado do Sistema

> Esta seção documenta o estado real do backend em 2026-04-13 com base em varredura direta do código. Não assuma nenhuma funcionalidade além do listado.

### 2.1 O que está implementado (confirmado em código)

| Componente | Status | Evidência (arquivo real) |
|---|---|---|
| Auth JWT (access + refresh + claims) | Completo | `controller/Auth/AuthController.java`, `service/Auth/AuthSeervice.java`, `security/JwtTokenService.java` |
| Perfil Professor (CRUD + desativação lógica) | Completo | `controller/Professor/ProfessorController.java`, `service/Professor/ProfessorService.java` |
| Módulo Turma (CRUD + vínculo prof-turma) | Completo | `controller/Turma/TurmaController.java`, `entity/Turma/Turma.java`, `entity/Turma/Ensino.java` |
| Perfil Aluno (CRUD) | Completo | `controller/Aluno/AlunoController.java`, `entity/Aluno/Aluno.java` |
| Matrícula Aluno-Turma (N:N) | Completo | `entity/Turma/AlunoTurma.java`, `repository/Turma/AlunoTurmaRepository.java` |
| Módulo Avaliações (Blocos 1–4) | Completo | `entity/Prova/`, `service/Prova/`, `controller/Prova/`, `dto/prova/` |
| Integração LLM (Gemini) | Completo | `service/Llm/LlmService.java`, `service/Llm/LlmServiceImpl.java`, `service/Llm/LlmValidationService.java`, `service/Llm/RateLimiterService.java`, `config/LlmProperties.java` |
| DTOs LLM (questões) | Completo | `dto/llm/QuestaoValidada.java`, `dto/llm/AlternativaValidada.java` |
| Infraestrutura base | Completo | `entity/BaseEntity.java`, `dto/shared/ApiResponse.java`, `exception/GlobalExceptionHandler.java`, `exception/BusinessException.java`, `exception/ResourceNotFoundException.java` |
| Testes de integração (75 testes, 0 falhas) | Completo | `ProvaControllerIntegrationTest` (46), `AlunoControllerIntegrationTest` (14), `AlunoProvaControllerIntegrationTest` (15) |

### 2.2 Padrões arquiteturais confirmados no código

| Padrão | Implementação atual | Instrução para este módulo |
|---|---|---|
| PKs | `UUID` via `GenerationType.UUID` em `BaseEntity` | Usar UUID em `ColecoesFlashcard` e `Flashcard` |
| Auditoria | `BaseEntity` com `createdAt`, `updatedAt` via Spring Data Auditing | Herdar `BaseEntity` nas duas entidades novas |
| Resposta HTTP | `ApiResponse<T>` em todos os controllers | Manter padrão sem exceção |
| Erros | `GlobalExceptionHandler` → `BusinessException` + `ResourceNotFoundException` | Usar exceções existentes; não criar novas sem necessidade |
| Autorização | `@PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")` em controller | Seguir mesmo padrão; ADMIN sempre incluído |
| Packages | `entity/{Dominio}/`, `repository/{Dominio}/`, `service/{Dominio}/`, `controller/{Dominio}/`, `dto/{dominio}/` | Usar `Flashcard/` e `flashcard/` nos packages |
| Perfil de teste | H2 in-memory com `@SpringBootTest` + `@ActiveProfiles("test")` | Manter; não adicionar dependências externas nos testes |
| Status/Enum | `@Enumerated(EnumType.STRING)` em entidades (ex.: `StatusProva`) | Criar `StatusColecao` com mesma estratégia |
| Soft delete de prova | Não existe `active` em `Prova` — exclusão lógica via status | Flashcard pode ter exclusão física (sem soft delete) |
| LLM | Interface `LlmService` + implementação `LlmServiceImpl` (Gemini AI Studio) | Estender interface e implementação com método `gerarFlashcards()` |

### 2.3 O que NÃO existe no backend (confirmado em código)

Pesquisa realizada em `backend/src/main/java/br/com/ilumina` — **nenhum arquivo** com `flashcard`, `Flashcard`, `colecao`, `Colecao`, `ColecoesFlashcard` encontrado. Confirmado: **zero código** do módulo de flashcards existe.

### 2.4 Estado da integração LLM relevante para este módulo

O `LlmService` já está operacional com:
- Chamada HTTP ao Gemini AI Studio via SDK `com.google.genai`
- `LlmProperties` carregando API key e modelo via `application.properties`
- `RateLimiterService` controlando concorrência
- `LlmValidationService` validando JSON de questões

**Para flashcards, é necessário:**
1. Adicionar `gerarFlashcards(String tema, int quantidade)` na interface `LlmService`
2. Implementar o método em `LlmServiceImpl` com prompt específico para flashcards
3. Adicionar `validarFlashcards(String json)` em `LlmValidationService`
4. Criar novo arquivo de prompt: `backend/src/main/resources/prompts/gerar-flashcards-main.txt`
5. Criar DTO interno: `dto/llm/FlashcardValidado.java`

**Não é necessário criar novo serviço LLM** — o existente é reutilizado.

---

## 3. Escopo do Módulo Flashcards

### 3.1 Requisitos funcionais cobertos

| RF | Nome | Cobertura |
|---|---|---|
| RF-17 | Criação de coleção | Completo: título, tema, quantidade de cards (intenção), turma destino |
| RF-18 | Geração de flashcards via IA | Completo: tema + quantidade → LLM → JSON → validação → persistência em cascata |
| RF-19 | Cadastro manual de flashcard | Completo: professor adiciona card informando textoFrente e textoVerso |
| RF-20 | Edição de flashcard | Completo: editar textoFrente e/ou textoVerso de qualquer card |
| RF-21 | Remoção de flashcard | Completo: remover card individual sem excluir a coleção |
| RF-22 | Publicação de coleção | Completo: workflow `RASCUNHO → PUBLICADA`, bloqueio de edição pós-publicação, despublicação |
| RF-23 | Estudo de flashcards pelo aluno | Completo: listagem de coleções disponíveis, leitura de todos os cards em ordem |
| RF-24 | Exclusão de coleção | Completo: exclusão da coleção com todos os flashcards em cascata |

### 3.2 Regras de negócio cobertas

| RN | Regra | Implementação no módulo |
|---|---|---|
| RN-04 | Coleção visível apenas para turma vinculada | Guard em `AlunoFlashcardService`: aluno só acessa coleções de turmas em que está matriculado |
| RN-07 | Proprietário da coleção | Guard em `FlashcardService`: somente o professor criador pode editar, publicar ou excluir |
| RN-08 | Ordem de exibição | Campo `ordem` em `Flashcard` determina sequência; exibido ao aluno em ordem crescente |
| RN-09 | Frente e verso obrigatórios | Validação no DTO + validação do JSON retornado pela LLM antes de persistir |

### 3.3 Entidades novas a criar

| Entidade | Tabela | Relacionamento |
|---|---|---|
| `ColecoesFlashcard` | `colecoes_flashcard` | `ManyToOne` → `Professor`, `ManyToOne` → `Turma` |
| `Flashcard` | `flashcards` | `ManyToOne` → `ColecoesFlashcard` |

### 3.4 Novos endpoints a criar

| Método | Path | Quem usa | RF |
|---|---|---|---|
| POST | `/api/v1/colecoes` | Professor | RF-17 |
| GET | `/api/v1/colecoes` | Professor (suas coleções) | RF-17 |
| GET | `/api/v1/colecoes/{id}` | Professor dono | RF-17 |
| PUT | `/api/v1/colecoes/{id}` | Professor dono (apenas rascunho) | RF-17 |
| DELETE | `/api/v1/colecoes/{id}` | Professor dono (qualquer status) | RF-24 |
| PATCH | `/api/v1/colecoes/{id}/publicar` | Professor dono | RF-22 |
| PATCH | `/api/v1/colecoes/{id}/despublicar` | Professor dono | RF-22 |
| POST | `/api/v1/colecoes/{id}/gerar-flashcards` | Professor dono (apenas rascunho) | RF-18 |
| POST | `/api/v1/colecoes/{colecaoId}/flashcards` | Professor dono (apenas rascunho) | RF-19 |
| PUT | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | Professor dono (apenas rascunho) | RF-20 |
| DELETE | `/api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` | Professor dono (apenas rascunho) | RF-21 |
| GET | `/api/v1/aluno/colecoes` | Aluno (coleções publicadas das suas turmas) | RF-23 |
| GET | `/api/v1/aluno/colecoes/{id}` | Aluno (todos os cards em ordem) | RF-23 |

---

## 4. Fora de Escopo Explícito

Os itens abaixo **não fazem parte deste módulo** e não devem ser implementados neste ciclo:

| Item | Justificativa |
|---|---|
| Dashboard de desempenho com flashcards | Fase 2 — módulo 04 separado |
| Rastreamento de quais cards o aluno já virou | Não previsto no README |
| Marcação de card como "difícil/fácil" (spaced repetition) | Não previsto no README |
| Compartilhamento de coleção entre professores | Não previsto no README |
| Paginação na listagem de flashcards | Nice-to-have; não bloqueia MVP |
| Importação de flashcards de arquivo (CSV, etc.) | Não previsto no README |
| Flashcards com imagem | Não previsto no README — apenas texto |
| Reordenação manual de flashcards pelo professor | Não previsto no README; ordem é gerenciada pelo campo `ordem` |
| Tentativa de resposta do aluno (quiz mode) | Fora do escopo — RF-23 define apenas leitura frente/verso |
| Múltiplas coleções por turma | Permitido naturalmente pelo modelo; sem restrição explícita |
| Cópia/duplicação de coleção | Não previsto no README |
| Agendamento de publicação (data/hora) | Não previsto no README |

---

## 5. Arquitetura Alvo

### 5.1 Camadas e pacotes

```
controller/
  Flashcard/
    FlashcardController.java        ← CRUD professor (coleção + cards + geração + publicação)
    AlunoFlashcardController.java   ← consumo pelo aluno (somente leitura)

service/
  Flashcard/
    FlashcardService.java           ← regras de negócio professor
    AlunoFlashcardService.java      ← visão do aluno (filtra por turma, retorna em ordem)
  Llm/
    LlmService.java                 ← ESTENDER: adicionar gerarFlashcards()
    LlmServiceImpl.java             ← ESTENDER: implementar gerarFlashcards() com prompt novo
    LlmValidationService.java       ← ESTENDER: adicionar validarFlashcards()

repository/
  Flashcard/
    ColecoesFlashcardRepository.java
    FlashcardRepository.java

entity/
  Flashcard/
    StatusColecao.java              ← enum: RASCUNHO | PUBLICADA
    ColecoesFlashcard.java          ← raiz do agregado
    Flashcard.java                  ← card individual (frente + verso)

dto/
  flashcard/
    CreateColecaoRequest.java
    UpdateColecaoRequest.java
    ColecaoResponse.java            ← listagem professor (sem cards)
    ColecaoDetalheResponse.java     ← detalhe professor (com cards)
    FlashcardResponse.java          ← card individual (professor)
    GerarFlashcardsRequest.java     ← tema + quantidade
    CreateFlashcardRequest.java     ← textoFrente + textoVerso
    UpdateFlashcardRequest.java
    ColecaoAlunoResponse.java       ← listagem aluno (sem cards)
    ColecaoDetalheAlunoResponse.java ← detalhe aluno (com cards em ordem)
    FlashcardAlunoResponse.java     ← card individual (aluno — idêntico ao professor aqui)
  llm/
    FlashcardValidado.java          ← DTO interno para resposta LLM parseada
```

### 5.2 Modelo de dados alvo

```
professores ──1:N── colecoes_flashcard ──1:N── flashcards
turmas      ──1:N── colecoes_flashcard
```

**Entidade `ColecoesFlashcard`:**

| Campo | Tipo JPA | Restrição | Observação |
|---|---|---|---|
| id | UUID | PK | Herdado de BaseEntity |
| titulo | String | NOT NULL, max 255 | |
| tema | String | nullable, max 255 | Tema informado pelo professor (usado no prompt LLM) |
| qntCards | Integer | nullable | Intenção declarada; real = count de flashcards |
| status | enum `StatusColecao` | NOT NULL, default RASCUNHO | `@Enumerated(EnumType.STRING)` |
| professor | ManyToOne Professor | NOT NULL | `@JoinColumn(name = "id_professor")` |
| turma | ManyToOne Turma | NOT NULL | `@JoinColumn(name = "id_turma")` |
| createdAt | OffsetDateTime | auto | Herdado de BaseEntity |
| updatedAt | OffsetDateTime | auto | Herdado de BaseEntity |

**Entidade `Flashcard`:**

| Campo | Tipo JPA | Restrição | Observação |
|---|---|---|---|
| id | UUID | PK | Herdado de BaseEntity |
| textoFrente | String | NOT NULL, TEXT | RN-09: obrigatório e não vazio |
| textoVerso | String | NOT NULL, TEXT | RN-09: obrigatório e não vazio |
| ordem | Integer | NOT NULL | Posição na coleção (1-based); RN-08 |
| colecao | ManyToOne ColecoesFlashcard | NOT NULL | `@JoinColumn(name = "id_colecao")`, fetch LAZY |
| createdAt | OffsetDateTime | auto | Herdado de BaseEntity |
| updatedAt | OffsetDateTime | auto | Herdado de BaseEntity |

**Enum `StatusColecao`:**
```java
public enum StatusColecao {
    RASCUNHO,
    PUBLICADA
}
```

**Relacionamento `ColecoesFlashcard → Flashcard`:**
```java
@OneToMany(mappedBy = "colecao", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
@OrderBy("ordem ASC")
private List<Flashcard> flashcards = new ArrayList<>();
```

O `cascade = CascadeType.ALL + orphanRemoval = true` garante que todos os flashcards são removidos automaticamente ao excluir a coleção (RF-24). `@OrderBy("ordem ASC")` garante a ordem de exibição sem overhead extra.

### 5.3 DTO interno LLM

```java
// dto/llm/FlashcardValidado.java
public class FlashcardValidado {
    private String textoFrente;
    private String textoVerso;
    // getters/setters ou @Data (Lombok)
}
```

### 5.4 Formato JSON esperado da LLM (prompt de flashcards)

```json
{
  "flashcards": [
    {
      "textoFrente": "O que é fotossíntese?",
      "textoVerso": "Processo pelo qual plantas convertem luz solar em energia química (glicose), utilizando CO₂ e água, liberando oxigênio."
    },
    {
      "textoFrente": "Qual é a fórmula da fotossíntese?",
      "textoVerso": "6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂"
    }
  ]
}
```

**Template do prompt** (`gerar-flashcards-main.txt`):
```
Você é um assistente pedagógico especializado em criar material de estudo.
Gere exatamente {{QUANTIDADE}} flashcards sobre o tema: {{TEMA}}.

Cada flashcard deve ter:
- textoFrente: uma pergunta ou conceito conciso (máximo 200 caracteres)
- textoVerso: a resposta ou explicação completa (máximo 500 caracteres)

Regras obrigatórias:
1. Retorne APENAS JSON válido, sem markdown, sem texto antes ou depois.
2. O campo raiz deve ser "flashcards" contendo um array com exatamente {{QUANTIDADE}} objetos.
3. Cada objeto deve ter "textoFrente" e "textoVerso" preenchidos e não vazios.
4. Não repita o mesmo conteúdo em flashcards diferentes.
5. Os flashcards devem ser pedagogicamente úteis e factualmente corretos.

Formato esperado:
{"flashcards":[{"textoFrente":"...","textoVerso":"..."}]}
```

### 5.5 Fluxo de dados — Criação com geração LLM

```
Professor → POST /api/v1/colecoes/{id}/gerar-flashcards
          ↓
    FlashcardController.gerarFlashcards(colecaoId, GerarFlashcardsRequest)
          ↓ (verifica ownership + status RASCUNHO)
    FlashcardService.gerarFlashcards(colecaoId, email, tema, quantidade)
          ↓
    LlmService.gerarFlashcards(tema, quantidade)
          ↓ (monta prompt com placeholders, chama Gemini via SDK)
    LlmValidationService.validarFlashcards(jsonRetornado)
          ↓ (valida estrutura, textoFrente/textoVerso não vazios, quantidade correta)
    FlashcardService.salvarFlashcardsEmCascata(colecaoId, flashcardsValidados)
          ↓ (INSERT flashcards com ordem sequencial em transação única)
    ColecaoDetalheResponse → 201 Created
```

### 5.6 Fluxo de dados — Publicação

```
Professor → PATCH /api/v1/colecoes/{id}/publicar
          ↓
    FlashcardController.publicar(colecaoId)
          ↓
    FlashcardService.publicar(colecaoId, email)
          ↓ [verifica: ownership por email, status RASCUNHO, ao menos 1 flashcard]
          ↓ [verifica: nenhum flashcard com textoFrente ou textoVerso vazio]
    colecao.status = PUBLICADA
    colecaoRepository.save(colecao)
    → 200 OK ColecaoResponse
```

### 5.7 Fluxo de dados — Estudo pelo aluno

```
Aluno → GET /api/v1/aluno/colecoes
      ↓ (filtra coleções PUBLICADAS das turmas em que o aluno está matriculado)
    AlunoFlashcardService.listarColecoesParaAluno(email)
      → List<ColecaoAlunoResponse> (sem os cards — só metadados)

Aluno → GET /api/v1/aluno/colecoes/{id}
      ↓ (verifica se aluno está na turma da coleção via email → User → Aluno → turmas)
    AlunoFlashcardService.detalharColecaoParaAluno(colecaoId, email)
      → ColecaoDetalheAlunoResponse (com todos os flashcards em ordem crescente de `ordem`)
```

**Não existe endpoint de submissão pelo aluno.** O estudo é inteiramente client-side (frontend vira os cards sem chamar o backend).

### 5.8 Modelo de autorização por endpoint

| Endpoint | ROLE_ADMIN | ROLE_PROFESSOR | ROLE_ALUNO |
|---|---|---|---|
| POST `/colecoes` | ✓ | ✓ (próprio professor) | ✗ |
| GET `/colecoes` | ✓ (todas) | ✓ (suas coleções) | ✗ |
| GET `/colecoes/{id}` | ✓ | ✓ (se dono) | ✗ |
| PUT `/colecoes/{id}` | ✓ | ✓ (se dono + rascunho) | ✗ |
| DELETE `/colecoes/{id}` | ✓ | ✓ (se dono) | ✗ |
| PATCH `/colecoes/{id}/publicar` | ✓ | ✓ (se dono) | ✗ |
| PATCH `/colecoes/{id}/despublicar` | ✓ | ✓ (se dono) | ✗ |
| POST `/colecoes/{id}/gerar-flashcards` | ✗ | ✓ (se dono + rascunho) | ✗ |
| POST `/colecoes/{colecaoId}/flashcards` | ✗ | ✓ (se dono + rascunho) | ✗ |
| PUT `/colecoes/{colecaoId}/flashcards/{id}` | ✗ | ✓ (se dono + rascunho) | ✗ |
| DELETE `/colecoes/{colecaoId}/flashcards/{id}` | ✗ | ✓ (se dono + rascunho) | ✗ |
| GET `/aluno/colecoes` | ✗ | ✗ | ✓ (suas turmas) |
| GET `/aluno/colecoes/{id}` | ✗ | ✗ | ✓ (turma vinculada) |

---

## 6. Mapeamento de Requisitos

### RF-17 — Criação de Coleção

**Descrição:** O professor cria uma coleção informando título, tema, quantidade de cards (intenção) e turma destino.

**Onde implementar:**
- `POST /api/v1/colecoes` → `FlashcardController.criar()`
- `FlashcardService.criar(CreateColecaoRequest, email)`
- Validações: título obrigatório, turma deve existir, professor deve estar vinculado à turma (analogia com Prova)
- `GET /api/v1/colecoes` → `FlashcardService.listarPorProfessor(email)` — retorna apenas coleções do professor logado
- `GET /api/v1/colecoes/{id}` → `FlashcardService.buscarDetalhePorId(colecaoId, email)` — com lista de flashcards
- `PUT /api/v1/colecoes/{id}` → `FlashcardService.atualizar(colecaoId, email, UpdateColecaoRequest)` — apenas título/tema/qntCards, apenas status RASCUNHO

**Campo `tema` na coleção:** Persiste o tema que o professor usou para gerar via LLM. Útil para regenerar ou para exibição. É nullable — coleção criada sem LLM pode não ter tema.

---

### RF-18 — Geração de Flashcards via IA

**Descrição:** O professor informa tema e quantidade e o sistema aciona a LLM.

**Onde implementar:**
- `POST /api/v1/colecoes/{id}/gerar-flashcards` → `FlashcardController.gerarFlashcards(colecaoId, GerarFlashcardsRequest)`
- `LlmService.gerarFlashcards(tema, quantidade)` — método novo na interface e implementação
- `LlmValidationService.validarFlashcards(json)` — método novo no serviço existente
- `FlashcardService.salvarFlashcardsEmCascata(colecaoId, List<FlashcardValidado>)` — persiste com `ordem` sequencial

**Arquivo de prompt:**
- `backend/src/main/resources/prompts/gerar-flashcards-main.txt`
- Placeholders: `{{TEMA}}` e `{{QUANTIDADE}}`

**Atribuição de `ordem` durante a geração:**
```java
// No FlashcardService, ao persistir os cards gerados:
int ordemAtual = flashcardRepository.countByColecaoId(colecaoId) + 1;
for (FlashcardValidado fv : flashcardsValidados) {
    Flashcard f = new Flashcard();
    f.setTextoFrente(fv.getTextoFrente());
    f.setTextoVerso(fv.getTextoVerso());
    f.setOrdem(ordemAtual++);
    f.setColecao(colecao);
    flashcardRepository.save(f);
}
```

**Comportamento em caso de coleção com cards existentes:** A geração adiciona novos cards com `ordem` continuando a partir do último existente. Não substitui cards anteriores.

**Política de falha LLM (mesma do módulo de Avaliações):** Se a LLM retornar JSON inválido ou incompleto, lançar `BusinessException` com mensagem clara. Nenhum dado é persistido. Retornar 400.

---

### RF-19 — Cadastro Manual de Flashcard

**Descrição:** O professor adiciona um flashcard manualmente a uma coleção.

**Onde implementar:**
- `POST /api/v1/colecoes/{colecaoId}/flashcards` → `FlashcardController.adicionarFlashcard(colecaoId, CreateFlashcardRequest)`
- `FlashcardService.adicionarFlashcard(colecaoId, email, CreateFlashcardRequest)`
- Guard: coleção existe, professor é dono (email → User → Professor), coleção está em RASCUNHO
- `ordem` atribuída automaticamente: `flashcardRepository.countByColecaoId(colecaoId) + 1`
- Validação: `textoFrente` e `textoVerso` não vazios e não nulos (RN-09)

---

### RF-20 — Edição de Flashcard

**Descrição:** O professor edita o texto da frente e/ou do verso de qualquer flashcard.

**Onde implementar:**
- `PUT /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` → `FlashcardController.editarFlashcard()`
- `FlashcardService.editarFlashcard(colecaoId, flashcardId, email, UpdateFlashcardRequest)`
- Guard: coleção existe, professor é dono, coleção está em RASCUNHO, flashcard pertence à coleção
- Validação: ambos os campos obrigatórios no DTO (RN-09)

---

### RF-21 — Remoção de Flashcard

**Descrição:** O professor remove um flashcard individual sem excluir a coleção.

**Onde implementar:**
- `DELETE /api/v1/colecoes/{colecaoId}/flashcards/{flashcardId}` → `FlashcardController.removerFlashcard()`
- `FlashcardService.removerFlashcard(colecaoId, flashcardId, email)`
- Guard: coleção existe, professor é dono, coleção está em RASCUNHO, flashcard pertence à coleção
- Após remoção, **não reordenar** os demais cards — lacunas na ordem são aceitáveis para MVP

---

### RF-22 — Publicação de Coleção

**Descrição:** Muda status de `RASCUNHO` para `PUBLICADA`. Após publicação, flashcards não podem ser editados ou removidos.

**Onde implementar:**
- `PATCH /api/v1/colecoes/{id}/publicar` → `FlashcardService.publicar(colecaoId, email)`
- `PATCH /api/v1/colecoes/{id}/despublicar` → `FlashcardService.despublicar(colecaoId, email)`
- Guards para publicar: ownership, ao menos 1 flashcard, nenhum card com frente/verso vazio
- Após publicação: coleção fica visível para alunos da turma (RN-04)
- Guard de edição pós-publicação:

```java
private void verificarEditavel(ColecoesFlashcard colecao) {
    if (colecao.getStatus() != StatusColecao.RASCUNHO) {
        throw new BusinessException(
            "Coleção publicada não pode ser editada. Despublique-a primeiro."
        );
    }
}
```

Aplicar em: edição de coleção, adição/edição/remoção de flashcard, geração via LLM.

---

### RF-23 — Estudo de Flashcards pelo Aluno

**Descrição:** O aluno acessa coleções publicadas de suas turmas e estuda no formato frente/verso.

**Onde implementar:**
- `GET /api/v1/aluno/colecoes` → `AlunoFlashcardService.listarColecoesParaAluno(email)`
  - Filtra: coleções com status PUBLICADA, turma da coleção ∈ turmas do aluno
  - Retorna: `ColecaoAlunoResponse` com metadados (id, titulo, tema, totalCards, turmaNome)
- `GET /api/v1/aluno/colecoes/{id}` → `AlunoFlashcardService.detalharColecaoParaAluno(colecaoId, email)`
  - Guard: coleção PUBLICADA, turma do aluno inclui a turma da coleção
  - Retorna: `ColecaoDetalheAlunoResponse` com lista completa de `FlashcardAlunoResponse` em ordem crescente de `ordem`

**Ownership chain (mesma lógica do AlunoProvaService):**
```
Authentication.getName() → email
→ userRepository.findByEmail(email) → User
→ alunoRepository.findByUser_Id(user.id) → Aluno
→ aluno.getTurmas() → List<AlunoTurma> → List<Turma>
→ colecao.getTurma() ∈ turmas? → permitido : 403
```

**Sem submissão pelo aluno:** Não existe endpoint POST para o aluno neste módulo. A lógica de "virar o card" é 100% client-side (frontend).

---

### RF-24 — Exclusão de Coleção

**Descrição:** O professor exclui uma coleção, removendo também todos os flashcards associados.

**Onde implementar:**
- `DELETE /api/v1/colecoes/{id}` → `FlashcardController.excluirColecao(colecaoId)`
- `FlashcardService.excluirColecao(colecaoId, email)`
- Guard: coleção existe, professor é dono
- **Não há restrição de status** para exclusão — professor pode excluir coleção PUBLICADA (diferença em relação à Prova, que não tem exclusão)
- O cascade `CascadeType.ALL + orphanRemoval = true` na entidade garante que os flashcards são excluídos automaticamente pelo Hibernate
- Retornar 204 No Content

---

### RN-04 — Visibilidade por Turma

Implementar como validação no `AlunoFlashcardService`:
```java
private void validarAcessoColecaoParaAluno(ColecoesFlashcard colecao, Aluno aluno) {
    boolean temAcesso = aluno.getTurmas().stream()
        .anyMatch(at -> at.getTurma().getId().equals(colecao.getTurma().getId()));
    if (!temAcesso) {
        throw new BusinessException("Aluno não tem acesso a esta coleção.");
    }
    if (colecao.getStatus() != StatusColecao.PUBLICADA) {
        throw new BusinessException("Coleção não disponível.");
    }
}
```

---

### RN-07 — Ownership da Coleção

Implementar como método utilitário no `FlashcardService`:
```java
private Professor resolverProfessorPorEmail(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    return professorRepository.findByUser_Id(user.getId())
        .orElseThrow(() -> new BusinessException("Perfil de professor não encontrado."));
}

private void validarOwnership(ColecoesFlashcard colecao, Professor professor) {
    if (!colecao.getProfessor().getId().equals(professor.getId())) {
        throw new BusinessException("Apenas o professor criador pode modificar esta coleção.");
    }
}
```

---

### RN-08 — Ordem de Exibição

- Flashcards retornados ao aluno sempre em ordem crescente de `ordem`
- `@OrderBy("ordem ASC")` no mapeamento `@OneToMany` garante isso sem query extra
- Não é necessário ordenar manualmente no service

---

### RN-09 — Frente e Verso Obrigatórios

Validar em três pontos:
1. **DTO `CreateFlashcardRequest`:** `@NotBlank` em ambos os campos
2. **DTO `UpdateFlashcardRequest`:** `@NotBlank` em ambos os campos
3. **Validação LLM (`validarFlashcards`):** verificar antes de persistir que nenhum campo está vazio

```java
// Em LlmValidationService.validarFlashcards():
for (FlashcardValidado f : flashcards) {
    if (f.getTextoFrente() == null || f.getTextoFrente().isBlank()) {
        throw new BusinessException("LLM retornou flashcard com textoFrente vazio.");
    }
    if (f.getTextoVerso() == null || f.getTextoVerso().isBlank()) {
        throw new BusinessException("LLM retornou flashcard com textoVerso vazio.");
    }
}
```

---

## 7. Plano por Blocos e Fases

---

### BLOCO 1 — Fundação de Domínio

**Objetivo do bloco:** Criar as entidades, repositórios, enum de status e DTOs base, sem lógica de negócio complexa. Bloco verificável de forma isolada — o contexto Spring Boot deve subir sem erros.

**Complexidade:** Baixa
**Branch sugerida:** `feature/bloco1-flashcard-entidades`

---

#### FASE 1.1 — Enum StatusColecao e Entidade ColecoesFlashcard

**ID:** FLASH-1.1
**Título:** Criar enum StatusColecao e entidade ColecoesFlashcard

**Objetivo:**
Definir o enum de ciclo de vida de uma coleção e a entidade raiz do módulo.

**Descrição técnica detalhada:**

Criar o enum `StatusColecao` com valores `RASCUNHO` e `PUBLICADA`.

Criar a entidade `ColecoesFlashcard` estendendo `BaseEntity`:
- `titulo`: `@Column(nullable = false, length = 255)`
- `tema`: `@Column(length = 255)` — nullable; preenchido quando gerado via LLM
- `qntCards`: `@Column(name = "qnt_cards")` — nullable; intenção declarada pelo professor
- `status`: `@Enumerated(EnumType.STRING) @Column(nullable = false)` — default `RASCUNHO` no construtor/`@PrePersist`
- `professor`: `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_professor", nullable = false)`
- `turma`: `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_turma", nullable = false)`
- `flashcards`: `@OneToMany(mappedBy = "colecao", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` + `@OrderBy("ordem ASC")`

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/entity/Flashcard/StatusColecao.java`
- `backend/src/main/java/br/com/ilumina/entity/Flashcard/ColecoesFlashcard.java`

**Endpoints impactados:** Nenhum nesta fase.

**Regras de negócio:**
- Status inicial sempre `RASCUNHO`
- Professor e Turma são obrigatórios

**Dependências:**
- `BaseEntity` (já existe em `entity/BaseEntity.java`)
- `Professor` (já existe em `entity/Professor/Professor.java`)
- `Turma` (já existe em `entity/Turma/Turma.java`)

**Critério de aceite técnico:**
- Compilação sem erros
- Banco cria tabela `colecoes_flashcard` com colunas corretas ao subir a aplicação
- Nenhum teste existente regride (75/75 passando)

---

#### FASE 1.2 — Entidade Flashcard

**ID:** FLASH-1.2
**Título:** Criar entidade Flashcard

**Objetivo:**
Criar a entidade filho da coleção, com relacionamento FK e campo `ordem`.

**Descrição técnica detalhada:**

Criar a entidade `Flashcard` estendendo `BaseEntity`:
- `textoFrente`: `@Column(nullable = false, columnDefinition = "TEXT")`
- `textoVerso`: `@Column(nullable = false, columnDefinition = "TEXT")`
- `ordem`: `@Column(nullable = false)`
- `colecao`: `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_colecao", nullable = false)`

**Atenção ao cascata:** A relação `OneToMany` com `cascade = CascadeType.ALL + orphanRemoval = true` está declarada em `ColecoesFlashcard`, não em `Flashcard`. Em `Flashcard` o lado inverso (`ManyToOne`) não deve ter cascade.

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/entity/Flashcard/Flashcard.java`

**Dependências:** FLASH-1.1

**Critério de aceite técnico:**
- Banco cria tabela `flashcards` com PK UUID, colunas `texto_frente`, `texto_verso`, `ordem`, FK `id_colecao`
- `IluminaBackendApplicationTests` passa

---

#### FASE 1.3 — Repositórios

**ID:** FLASH-1.3
**Título:** Criar ColecoesFlashcardRepository e FlashcardRepository

**Objetivo:**
Criar os repositórios Spring Data JPA com queries customizadas necessárias para o módulo.

**Descrição técnica detalhada:**

**`ColecoesFlashcardRepository`:**
```java
public interface ColecoesFlashcardRepository extends JpaRepository<ColecoesFlashcard, UUID> {
    List<ColecoesFlashcard> findByProfessor_Id(UUID professorId);
    List<ColecoesFlashcard> findByTurmaIdInAndStatus(List<UUID> turmaIds, StatusColecao status);
}
```

**`FlashcardRepository`:**
```java
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByColecao_IdOrderByOrdemAsc(UUID colecaoId);
    int countByColecaoId(UUID colecaoId);
    boolean existsByIdAndColecao_Id(UUID flashcardId, UUID colecaoId);
}
```

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/ColecoesFlashcardRepository.java`
- `backend/src/main/java/br/com/ilumina/repository/Flashcard/FlashcardRepository.java`

**Dependências:** FLASH-1.1, FLASH-1.2

**Critério de aceite técnico:**
- Compilação sem erros
- Nenhum teste regride

---

#### FASE 1.4 — DTOs Base e DTO LLM Interno

**ID:** FLASH-1.4
**Título:** Criar DTOs do módulo flashcard

**Objetivo:**
Criar todos os DTOs de request, response e o DTO interno de flashcard validado pela LLM.

**DTOs a criar:**

| Arquivo | Campos principais |
|---|---|
| `CreateColecaoRequest.java` | `@NotBlank titulo`, `tema`, `qntCards`, `@NotNull turmaId (UUID)` |
| `UpdateColecaoRequest.java` | `titulo`, `tema`, `qntCards` (todos nullable — patch parcial) |
| `ColecaoResponse.java` | `id`, `titulo`, `tema`, `qntCards`, `status`, `turmaNome`, `totalFlashcards`, `createdAt` |
| `ColecaoDetalheResponse.java` | todos de `ColecaoResponse` + `List<FlashcardResponse> flashcards` |
| `FlashcardResponse.java` | `id`, `textoFrente`, `textoVerso`, `ordem` |
| `GerarFlashcardsRequest.java` | `@NotBlank tema`, `@NotNull @Min(1) @Max(20) quantidade` |
| `CreateFlashcardRequest.java` | `@NotBlank textoFrente`, `@NotBlank textoVerso` |
| `UpdateFlashcardRequest.java` | `@NotBlank textoFrente`, `@NotBlank textoVerso` |
| `ColecaoAlunoResponse.java` | `id`, `titulo`, `tema`, `totalFlashcards`, `turmaNome` |
| `ColecaoDetalheAlunoResponse.java` | todos de `ColecaoAlunoResponse` + `List<FlashcardAlunoResponse> flashcards` |
| `FlashcardAlunoResponse.java` | `id`, `textoFrente`, `textoVerso`, `ordem` |
| `dto/llm/FlashcardValidado.java` | `textoFrente`, `textoVerso` |

**Observação sobre `FlashcardAlunoResponse`:** Por ora é idêntico a `FlashcardResponse`. Manter como classes separadas para permitir evolução futura independente (ex.: o professor vê `id` do card para editar; o aluno não necessita do `id` — mas por consistência incluir em ambos).

**Arquivos a criar:** 12 arquivos em `dto/flashcard/` + 1 em `dto/llm/`

**Dependências:** Nenhuma (apenas Java puro + anotações Jakarta Validation)

**Critério de aceite técnico:**
- Compilação sem erros
- Nenhum teste regride

---

### BLOCO 2 — API Professor (CRUD + Publicação)

**Objetivo do bloco:** Implementar toda a lógica de negócio do professor: criar coleção, adicionar/editar/remover flashcards manualmente, publicar/despublicar e excluir coleção. Sem LLM ainda.

**Complexidade:** Média
**Branch sugerida:** `feature/bloco2-flashcard-professor`
**Pré-requisito:** Bloco 1 concluído e mergeado

---

#### FASE 2.1 — FlashcardService (lógica professor)

**ID:** FLASH-2.1
**Título:** Implementar FlashcardService

**Objetivo:**
Criar o serviço com toda a lógica de negócio do professor para coleções e flashcards manuais.

**Métodos a implementar:**

| Método | Descrição |
|---|---|
| `criar(CreateColecaoRequest, email)` | Resolve professor, valida turma, cria coleção em RASCUNHO |
| `listarPorProfessor(email)` | Retorna coleções do professor logado com totalFlashcards |
| `buscarDetalhePorId(colecaoId, email)` | Retorna coleção com flashcards; valida ownership |
| `atualizar(colecaoId, email, UpdateColecaoRequest)` | Atualiza campos; guarda RASCUNHO |
| `publicar(colecaoId, email)` | Muda status; guards: ownership + ao menos 1 card + todos com frente/verso preenchidos |
| `despublicar(colecaoId, email)` | Muda status para RASCUNHO; guard ownership |
| `excluirColecao(colecaoId, email)` | Exclui coleção + cards em cascata; guard ownership |
| `adicionarFlashcard(colecaoId, email, CreateFlashcardRequest)` | Adiciona card com ordem = count+1; guards RASCUNHO + ownership |
| `editarFlashcard(colecaoId, flashcardId, email, UpdateFlashcardRequest)` | Edita frente/verso; guards RASCUNHO + ownership + card pertence à coleção |
| `removerFlashcard(colecaoId, flashcardId, email)` | Remove card; guards RASCUNHO + ownership + card pertence à coleção |

**Método utilitário crítico — resolução de professor por email:**
```java
private Professor resolverProfessorPorEmail(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    return professorRepository.findByUser_Id(user.getId())
        .orElseThrow(() -> new BusinessException("Perfil de professor não encontrado."));
}
```

**Método utilitário crítico — guard editável:**
```java
private void verificarEditavel(ColecoesFlashcard colecao) {
    if (colecao.getStatus() != StatusColecao.RASCUNHO) {
        throw new BusinessException(
            "Coleção publicada não pode ser editada. Despublique-a primeiro."
        );
    }
}
```

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/service/Flashcard/FlashcardService.java`

**Dependências:** FLASH-1.1 a 1.4, `ProfessorRepository`, `UserRepository`, `TurmaRepository`

---

#### FASE 2.2 — FlashcardController (rotas professor)

**ID:** FLASH-2.2
**Título:** Implementar FlashcardController

**Objetivo:**
Expor todos os endpoints do professor para o módulo de flashcards.

**Estrutura do controller:**
```
@RestController
@RequestMapping("/api/v1/colecoes")
@PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
public class FlashcardController {
    // endpoints de coleção
    @PostMapping              → criar
    @GetMapping               → listar
    @GetMapping("/{id}")      → detalhe
    @PutMapping("/{id}")      → atualizar
    @DeleteMapping("/{id}")   → excluir
    @PatchMapping("/{id}/publicar")    → publicar
    @PatchMapping("/{id}/despublicar") → despublicar

    // endpoints de flashcard individual (no body usa @RequestBody + @Valid)
    @PostMapping("/{colecaoId}/flashcards")                   → adicionar card
    @PutMapping("/{colecaoId}/flashcards/{flashcardId}")      → editar card
    @DeleteMapping("/{colecaoId}/flashcards/{flashcardId}")   → remover card
}
```

**Todos os endpoints retornam `ApiResponse<T>` conforme padrão do projeto.**

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/FlashcardController.java`

**Dependências:** FLASH-2.1

---

#### FASE 2.3 — Testes de integração (Bloco 2)

**ID:** FLASH-2.3
**Título:** Suite de integração para FlashcardController (visão professor)

**Cenários mínimos obrigatórios:**

**Criação de coleção (3):**
- Criar com sucesso → 201, campos corretos no retorno
- Erro: turma não existe → 404
- Erro: professor não vinculado à turma → 403 (se regra for imposta)

**Listagem e detalhe (2):**
- Listar coleções do professor logado → 200, lista correta
- Detalhar coleção com cards → 200, campos e ordem corretos

**Flashcard manual (5):**
- Adicionar card com sucesso → 201, `ordem` sequencial
- Erro: coleção publicada → 400 (guard editável)
- Editar card com sucesso → 200
- Remover card com sucesso → 204
- Erro: card não pertence à coleção → 404

**Publicação (4):**
- Publicar com sucesso (coleção com ao menos 1 card) → 200, status PUBLICADA
- Erro: publicar coleção sem cards → 400
- Despublicar com sucesso → 200, status RASCUNHO
- Erro: professor não dono tenta publicar → 403

**Exclusão (2):**
- Excluir coleção RASCUNHO com cards → 204, cards excluídos em cascata
- Excluir coleção PUBLICADA → 204 (permitido)

**Total mínimo: 16 testes**

---

### BLOCO 3 — Geração via LLM

**Objetivo do bloco:** Estender a infraestrutura LLM existente com suporte a geração de flashcards, sem quebrar o fluxo de questões.

**Complexidade:** Média
**Branch sugerida:** `feature/bloco3-flashcard-llm`
**Pré-requisito:** Bloco 2 concluído e mergeado

---

#### FASE 3.1 — Prompt de geração de flashcards

**ID:** FLASH-3.1
**Título:** Criar arquivo de prompt para geração de flashcards

**Objetivo:**
Criar o template de prompt que será enviado ao Gemini para geração de flashcards.

**Arquivo a criar:**
- `backend/src/main/resources/prompts/gerar-flashcards-main.txt`

**Conteúdo do arquivo:**
```
Você é um assistente pedagógico especializado em criar material de estudo.
Gere exatamente {{QUANTIDADE}} flashcards sobre o tema: {{TEMA}}.

Cada flashcard deve ter:
- textoFrente: uma pergunta, termo ou conceito conciso (máximo 200 caracteres)
- textoVerso: a resposta ou explicação completa (máximo 500 caracteres)

Regras obrigatórias:
1. Retorne APENAS JSON válido. Sem markdown. Sem texto antes ou depois do JSON.
2. O campo raiz deve ser "flashcards" contendo um array com exatamente {{QUANTIDADE}} objetos.
3. Cada objeto deve ter "textoFrente" e "textoVerso" preenchidos e não vazios.
4. Não repita o mesmo conteúdo em flashcards diferentes.
5. Os flashcards devem ser pedagogicamente úteis e factualmente corretos.
6. Não inclua gabaritos, alternativas ou enunciados de prova — apenas frente e verso.

Formato esperado (exatamente):
{"flashcards":[{"textoFrente":"...","textoVerso":"..."},{"textoFrente":"...","textoVerso":"..."}]}
```

**Regras de robustez (analogia com RN-06 para questões):**
- Saída estritamente JSON (sem markdown, sem texto extra)
- Exatamente `{{QUANTIDADE}}` flashcards
- Todos os flashcards com `textoFrente` e `textoVerso` não nulos e não vazios
- Sem flashcards com `textoFrente` duplicado na mesma geração

---

#### FASE 3.2 — Extensão do LlmService

**ID:** FLASH-3.2
**Título:** Adicionar gerarFlashcards() ao LlmService e LlmServiceImpl

**Objetivo:**
Estender a interface e implementação existente com suporte a geração de flashcards, reutilizando toda a infraestrutura (Gemini client, rate limiter, tratamento de exceções).

**Modificações em `LlmService.java` (interface):**
```java
// Adicionar método à interface existente:
List<FlashcardValidado> gerarFlashcards(String tema, int quantidade);
```

**Modificações em `LlmServiceImpl.java` (implementação):**
```java
@Override
public List<FlashcardValidado> gerarFlashcards(String tema, int quantidade) {
    rateLimiterService.verificar(); // reutiliza rate limiter existente
    String prompt = montarPromptFlashcards(tema, quantidade);
    String jsonRetornado = chamarGemini(prompt); // reutiliza método existente
    return llmValidationService.validarFlashcards(jsonRetornado);
}

private String montarPromptFlashcards(String tema, int quantidade) {
    return flashcardsPromptTemplate
        .replace("{{TEMA}}", tema)
        .replace("{{QUANTIDADE}}", String.valueOf(quantidade));
}
```

O `flashcardsPromptTemplate` é injetado da mesma forma que o prompt de questões — via `@Value` ou carregamento do arquivo `.txt` em `resources/prompts/`.

**Arquivos a modificar:**
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmService.java`
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmServiceImpl.java`

**Precaução:** Verificar que a modificação não altera a assinatura dos métodos existentes (`gerarQuestoes`). Usar `default` ou sobrecarga se necessário para manter compatibilidade.

---

#### FASE 3.3 — Extensão do LlmValidationService

**ID:** FLASH-3.3
**Título:** Adicionar validarFlashcards() ao LlmValidationService

**Objetivo:**
Criar a validação do JSON retornado pela LLM para flashcards, análoga à validação existente de questões.

**Validações obrigatórias (antes de qualquer `INSERT`):**
1. Campo `flashcards` existe e é array não vazio
2. Quantidade de itens no array ≥ 1
3. Cada item tem `textoFrente` não nulo e não vazio
4. Cada item tem `textoVerso` não nulo e não vazio
5. Não há flashcards com `textoFrente` duplicado na mesma resposta

Em caso de falha em qualquer validação: lançar `BusinessException` com mensagem clara. **Nenhum dado é persistido.**

**Método a adicionar em `LlmValidationService.java`:**
```java
public List<FlashcardValidado> validarFlashcards(String json) {
    // parse JSON
    // validar campo "flashcards"
    // validar cada item
    // retornar List<FlashcardValidado>
    // em caso de falha: throw new BusinessException("LLM retornou resposta inválida para flashcards: " + motivo)
}
```

**Arquivos a modificar:**
- `backend/src/main/java/br/com/ilumina/service/Llm/LlmValidationService.java`

---

#### FASE 3.4 — FlashcardService: método gerarFlashcards

**ID:** FLASH-3.4
**Título:** Adicionar gerarFlashcards() ao FlashcardService

**Objetivo:**
Orquestrar a chamada LLM e persistência dos flashcards gerados na coleção.

**Método a adicionar no `FlashcardService`:**
```java
@Transactional
public ColecaoDetalheResponse gerarFlashcards(UUID colecaoId, String email, GerarFlashcardsRequest request) {
    Professor professor = resolverProfessorPorEmail(email);
    ColecoesFlashcard colecao = colecaoRepository.findById(colecaoId)
        .orElseThrow(() -> new ResourceNotFoundException("Coleção não encontrada."));
    validarOwnership(colecao, professor);
    verificarEditavel(colecao);

    List<FlashcardValidado> flashcardsGerados =
        llmService.gerarFlashcards(request.getTema(), request.getQuantidade());

    int ordemAtual = flashcardRepository.countByColecaoId(colecaoId) + 1;
    for (FlashcardValidado fv : flashcardsGerados) {
        Flashcard f = new Flashcard();
        f.setTextoFrente(fv.getTextoFrente());
        f.setTextoVerso(fv.getTextoVerso());
        f.setOrdem(ordemAtual++);
        f.setColecao(colecao);
        flashcardRepository.save(f);
    }

    return buscarDetalhePorId(colecaoId, email);
}
```

**Endpoint correspondente:**
- `POST /api/v1/colecoes/{id}/gerar-flashcards` — adicionar ao `FlashcardController`
- Retorna `ColecaoDetalheResponse` com todos os cards (incluindo os recém-gerados)
- HTTP 201 Created

---

#### FASE 3.5 — Testes de integração (Bloco 3)

**ID:** FLASH-3.5
**Título:** Suite de integração para geração LLM de flashcards

**Estratégia de mock:** Os testes de integração do módulo de Avaliações mockam o `LlmService` para evitar dependência de API externa. Seguir a mesma estratégia: `@MockBean LlmService` com `when(llmService.gerarFlashcards(...)).thenReturn(...)`.

**Cenários mínimos obrigatórios (6):**
- Geração com sucesso → 201, flashcards persistidos com ordem sequencial
- Erro: coleção publicada → 400 (guard editável)
- Erro: coleção não existe → 404
- Erro: professor não é dono → 403
- Erro: LLM retorna JSON inválido → 400 (sem persistência)
- Erro: LLM retorna flashcard com textoFrente vazio → 400 (sem persistência)

**Teste de regressão obrigatório:**
- Rodar suite completa anterior (75+ testes) e confirmar 0 regressões após modificações no `LlmService`

---

### BLOCO 4 — Visão do Aluno

**Objetivo do bloco:** Implementar os dois endpoints do aluno para listar coleções disponíveis e estudar os flashcards. Sem submissão — apenas leitura.

**Complexidade:** Baixa (análogo ao AlunoProvaService mas sem lógica de resposta/resultado)
**Branch sugerida:** `feature/bloco4-flashcard-aluno`
**Pré-requisito:** Blocos 1–3 concluídos e mergeados

---

#### FASE 4.1 — AlunoFlashcardService

**ID:** FLASH-4.1
**Título:** Implementar AlunoFlashcardService

**Objetivo:**
Criar o serviço de visão do aluno: listagem de coleções publicadas da turma e detalhe com todos os cards em ordem.

**Métodos a implementar:**

```java
@Service
public class AlunoFlashcardService {

    public List<ColecaoAlunoResponse> listarColecoesParaAluno(String email) {
        Aluno aluno = resolverAlunoPorEmail(email);
        List<UUID> turmaIds = aluno.getTurmas().stream()
            .map(at -> at.getTurma().getId())
            .collect(Collectors.toList());
        List<ColecoesFlashcard> colecoes =
            colecaoRepository.findByTurmaIdInAndStatus(turmaIds, StatusColecao.PUBLICADA);
        return colecoes.stream()
            .map(this::toColecaoAlunoResponse)
            .collect(Collectors.toList());
    }

    public ColecaoDetalheAlunoResponse detalharColecaoParaAluno(UUID colecaoId, String email) {
        Aluno aluno = resolverAlunoPorEmail(email);
        ColecoesFlashcard colecao = colecaoRepository.findById(colecaoId)
            .orElseThrow(() -> new ResourceNotFoundException("Coleção não encontrada."));
        validarAcessoColecaoParaAluno(colecao, aluno);
        return toColecaoDetalheAlunoResponse(colecao);
    }

    private Aluno resolverAlunoPorEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        return alunoRepository.findByUser_Id(user.getId())
            .orElseThrow(() -> new BusinessException("Perfil de aluno não encontrado."));
    }
}
```

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/service/Flashcard/AlunoFlashcardService.java`

---

#### FASE 4.2 — AlunoFlashcardController

**ID:** FLASH-4.2
**Título:** Implementar AlunoFlashcardController

**Objetivo:**
Expor os dois endpoints de leitura do aluno.

**Estrutura:**
```java
@RestController
@RequestMapping("/api/v1/aluno/colecoes")
@PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
public class AlunoFlashcardController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<ColecaoAlunoResponse>>> listar(...) { ... }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ColecaoDetalheAlunoResponse>> detalhar(...) { ... }
}
```

**Arquivos a criar:**
- `backend/src/main/java/br/com/ilumina/controller/Flashcard/AlunoFlashcardController.java`

---

#### FASE 4.3 — Testes de integração (Bloco 4)

**ID:** FLASH-4.3
**Título:** Suite de integração para AlunoFlashcardController

**Cenários mínimos obrigatórios (8):**

**Listagem (2):**
- Listagem com sucesso — aluno com turma tem coleções publicadas → 200, lista correta
- Listagem vazia — nenhuma coleção publicada para as turmas do aluno → 200, lista vazia

**Detalhe (4):**
- Detalhe válido → 200, flashcards em ordem crescente de `ordem`
- Forbidden: coleção de turma diferente → 403
- Forbidden: coleção em RASCUNHO → 403
- Not found: coleção inexistente → 404

**Segurança (2):**
- Professor tenta acessar endpoint de aluno → 403
- Aluno tenta acessar endpoint de professor → 403

**Total mínimo: 8 testes**

**Estado final esperado após Bloco 4:**
- 75 testes anteriores: 0 regressões
- Bloco 1+2: ~16 novos testes
- Bloco 3: ~6 novos testes
- Bloco 4: ~8 novos testes
- **Total estimado: ~105 testes passando**

---

## 8. Dependências, Paralelismo e Gargalos

```
BLOCO 1 (fundação)
    ├── FLASH-1.1 (ColecoesFlashcard)
    │       └── FLASH-1.2 (Flashcard) ← depende de 1.1
    ├── FLASH-1.3 (repositórios) ← depende de 1.1 e 1.2
    └── FLASH-1.4 (DTOs) ← independente, pode ir em paralelo com 1.1-1.3

BLOCO 2 ← depende de Bloco 1 completo
    ├── FLASH-2.1 (FlashcardService) ← necessário antes de 2.2
    ├── FLASH-2.2 (FlashcardController) ← depende de 2.1
    └── FLASH-2.3 (testes Bloco 2) ← depende de 2.2

BLOCO 3 ← depende de Bloco 2 completo
    ├── FLASH-3.1 (prompt) ← independente, pode ser feito junto com Bloco 2
    ├── FLASH-3.2 (estender LlmService) ← depende de 3.1
    ├── FLASH-3.3 (estender LlmValidationService) ← pode ir em paralelo com 3.2
    ├── FLASH-3.4 (gerarFlashcards no FlashcardService) ← depende de 3.2 e 3.3
    └── FLASH-3.5 (testes Bloco 3) ← depende de 3.4

BLOCO 4 ← depende de Bloco 3 completo
    ├── FLASH-4.1 (AlunoFlashcardService)
    ├── FLASH-4.2 (AlunoFlashcardController) ← depende de 4.1
    └── FLASH-4.3 (testes Bloco 4) ← depende de 4.2
```

**Gargalo crítico:** A extensão do `LlmService` (FLASH-3.2) é o ponto de maior risco de regressão — modificar a interface existente pode quebrar o `LlmServiceImpl` e os testes do módulo de Avaliações se não feito com cuidado. Rodar regressão completa após cada modificação nessa classe.

---

## 9. Estratégia de Branch e PR

| Bloco | Branch | PR Target |
|---|---|---|
| 1 — Fundação | `feature/bloco1-flashcard-entidades` | `develop` |
| 2 — API Professor | `feature/bloco2-flashcard-professor` | `develop` |
| 3 — Geração LLM | `feature/bloco3-flashcard-llm` | `develop` |
| 4 — Visão Aluno | `feature/bloco4-flashcard-aluno` | `develop` |

**Regra de PR:** Cada bloco abre PR apenas após todos os seus testes passarem localmente. A suite completa anterior deve estar verde antes do merge.

---

## 10. Estratégia de Testes

### 10.1 Abordagem geral

Seguir exatamente o mesmo padrão do módulo de Avaliações:
- `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")`
- H2 in-memory como banco de testes
- `@MockBean LlmService` nos testes que testam geração LLM (evita chamada real à API externa)
- Um arquivo de teste por controller: `FlashcardControllerIntegrationTest`, `AlunoFlashcardControllerIntegrationTest`
- Setup com `@BeforeEach` criando usuários, turmas, vínculos, coleções e flashcards necessários

### 10.2 O que NÃO testar via integração

- Lógica interna do `LlmServiceImpl` com Gemini real — irrelevante em testes de integração
- Geração de `ordem` sequencial quando há N cards pré-existentes — testar via service unit test se necessário

### 10.3 Happy path críticos (devem passar antes de qualquer merge)

1. Professor cria coleção → adiciona cards manualmente → publica → aluno lista e estuda
2. Professor cria coleção → gera via LLM (mock) → publica → aluno vê cards em ordem
3. Professor tenta editar coleção publicada → 400

---

## 11. Estratégia de Rollout e Mitigação de Risco

### 11.1 Bloco 1 — zero risco funcional

Apenas entidades e DTOs. O risco é DDL inesperado pelo Hibernate. Verificar tabelas criadas antes de avançar.

### 11.2 Bloco 2 — isolado do módulo de Avaliações

Os novos controllers e services não tocam código existente. O risco é conflito de path de rotas — verificar que `/api/v1/colecoes` não colide com nenhum path existente (não colide — confirmado).

### 11.3 Bloco 3 — risco de regressão no LlmService

**Estratégia:** Adicionar novos métodos à interface sem modificar assinaturas existentes. Rodar suite completa (75+ testes) antes do merge. Se necessário, criar `FlashcardLlmService` separado (alternativa segura porém redundante).

### 11.4 Bloco 4 — dependência de módulo de Aluno

O `AlunoFlashcardService` usa `AlunoRepository` e `AlunoTurmaRepository` já existentes. O risco é uma alteração nessas entidades que quebre o acesso — improvável, mas rodar regressão após implementação.

---

## 12. Checklist de Pronto por Bloco e Final

### Bloco 1

- [ ] Enum `StatusColecao` criado com `@Enumerated(EnumType.STRING)`
- [ ] Entidade `ColecoesFlashcard` estende `BaseEntity`, campos conforme especificação
- [ ] Entidade `Flashcard` estende `BaseEntity`, FK para `ColecoesFlashcard`
- [ ] Cascade `ALL + orphanRemoval = true` em `ColecoesFlashcard.flashcards`
- [ ] `@OrderBy("ordem ASC")` em `ColecoesFlashcard.flashcards`
- [ ] Repositórios com queries customizadas necessárias
- [ ] Todos os DTOs criados com anotações de validação corretas
- [ ] `FlashcardValidado.java` em `dto/llm/`
- [ ] `IluminaBackendApplicationTests` passa (contexto carrega)
- [ ] 75 testes anteriores: 0 regressões

### Bloco 2

- [ ] `FlashcardService` com todos os 10 métodos implementados
- [ ] Guards: ownership (RN-07), editável (análogo RN-03), pertencimento de card à coleção
- [ ] Resolução de professor por email (analogia com AlunoProvaService)
- [ ] Publicação guarda: ao menos 1 card, todos com frente/verso preenchidos
- [ ] `FlashcardController` com 11 endpoints mapeados e `@PreAuthorize` correto
- [ ] Suite `FlashcardControllerIntegrationTest`: ≥ 16 testes, todos passando
- [ ] 75 testes anteriores: 0 regressões

### Bloco 3

- [ ] Arquivo `gerar-flashcards-main.txt` em `resources/prompts/`
- [ ] `LlmService` interface estendida com `gerarFlashcards()`
- [ ] `LlmServiceImpl` implementa `gerarFlashcards()` sem quebrar `gerarQuestoes()`
- [ ] `LlmValidationService` estendido com `validarFlashcards()`
- [ ] Validação LLM: quantidade, frente/verso não vazios, sem duplicatas de frente
- [ ] `FlashcardService.gerarFlashcards()` implementado com `@Transactional`
- [ ] `FlashcardController.gerarFlashcards()` endpoint adicionado
- [ ] Suite de integração LLM: ≥ 6 testes (mock do LlmService), todos passando
- [ ] Suite completa anterior (75+ testes): 0 regressões

### Bloco 4

- [ ] `AlunoFlashcardService` com 2 métodos (listagem + detalhe)
- [ ] Ownership chain por email → User → Aluno → turmas
- [ ] Guard: coleção PUBLICADA + turma do aluno inclui a da coleção
- [ ] Flashcards retornados em ordem crescente de `ordem`
- [ ] `AlunoFlashcardController` com 2 endpoints e `@PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")`
- [ ] Suite `AlunoFlashcardControllerIntegrationTest`: ≥ 8 testes, todos passando
- [ ] Suite completa (todos os blocos): 0 regressões, ~105 testes passando

---

## 13. Matriz de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Extensão do `LlmService` quebra fluxo de questões existente | Baixa | Alta | Adicionar métodos novos sem modificar assinaturas existentes; rodar regressão completa imediatamente após |
| LLM retorna JSON malformado para flashcards em produção | Média | Baixa | `validarFlashcards()` com 5 checks antes de qualquer `INSERT`; política de 400 sem persistência |
| `CascadeType.ALL` exclui cards em cascata mas Hibernate não propaga em alguns cenários | Baixa | Média | Verificar na fase de testes se `orphanRemoval = true` funciona corretamente com H2; testar exclusão de coleção com cards |
| Nome de tabela `colecoes_flashcard` conflita com palavra reservada do PostgreSQL | Baixíssima | Baixa | Especificar `@Table(name = "colecoes_flashcard")` explicitamente na entidade |
| Aluno acessa coleção de outra turma por bypass de validação | Baixa | Alta | Dupla validação: status PUBLICADA + turma do aluno inclui a da coleção; coberto por teste de integração |
| N+1 queries em listagem de coleções com cards | Média | Baixa | Aceitável para MVP; `findByTurmaIdInAndStatus` já reduz queries de coleção; cards são carregados sob demanda por detalhe |
| Ordem de flashcards inconsistente após remoção de card individual | Baixa | Baixa | Documentado e aceito para MVP: lacunas na ordem são aceitáveis; `@OrderBy("ordem ASC")` mantém ordenação relativa correta |

---

## 14. Estimativa Relativa por Bloco

| Bloco | Complexidade | Componentes novos | Componentes modificados |
|---|---|---|---|
| 1 — Fundação | Baixa | 2 entidades + 2 repositórios + 13 DTOs | 0 |
| 2 — API Professor | Média | 1 service + 1 controller + 1 test suite (16 testes) | 0 |
| 3 — Geração LLM | Média | 1 arquivo prompt | 2 services existentes (LlmService + LlmValidationService) + 1 método no FlashcardService |
| 4 — Visão Aluno | Baixa | 1 service + 1 controller + 1 test suite (8 testes) | 0 |

**Complexidade total do módulo:** Menor que o módulo de Avaliações.
O Bloco 3 é o único de risco real — por modificar código existente. Todos os outros são implementações isoladas do zero.

---

## 15. Decisões Técnicas Pendentes

### DT-01 — Extensão de LlmService vs. novo FlashcardLlmService

**Questão:** Adicionar `gerarFlashcards()` ao `LlmService` existente (interface única) ou criar um `FlashcardLlmService` separado?

**Análise:**
- Interface única: mais simples, reutiliza toda a infraestrutura (Gemini client, rate limiter, configurações), menor superfície de código
- Serviço separado: isolamento total de risco, mas duplica boilerplate de configuração

**Recomendação:** Estender interface existente. O risco de regressão é baixo se os métodos forem adicionados sem alterar assinaturas existentes. Menos código, mesma infraestrutura.

**Precondição para aprovar:** Confirmar antes de executar que a interface `LlmService.java` atual não tem implementação default que colida.

---

### DT-02 — Exclusão de coleção PUBLICADA (permitido ou restrito?)

**Questão:** O RF-24 diz "o professor deve poder excluir uma coleção". Não especifica restrição de status. Deve-se permitir excluir coleção PUBLICADA?

**Análise:**
- Prova (no módulo de Avaliações) não tem endpoint de exclusão — irrelevante como referência
- Aluno pode estar estudando a coleção no momento da exclusão — os cards desaparecem imediatamente
- O README não cria restrição explícita de status para exclusão

**Recomendação para MVP:** Permitir exclusão em qualquer status (RASCUNHO ou PUBLICADA). A decisão impacta UX, não integridade de dados (não há tabela de "progresso do aluno" para ficar orfã).

**A validar com PM se houver restrição de negócio não documentada.**

---

### DT-03 — Reordenação após remoção de card

**Questão:** Ao remover um flashcard, os demais cards devem ser reordenados para preencher a lacuna?

**Análise:**
- Reordenação requer UPDATE em N registros — custo extra
- O `@OrderBy("ordem ASC")` garante que a ordem relativa entre cards restantes é mantida — apenas haverá uma lacuna numérica
- Para o aluno, o impacto é zero — os cards aparecem em ordem correta

**Recomendação:** Não reordenar para MVP. Lacunas numéricas em `ordem` são aceitáveis.

---

## 16. Definition of Ready e Definition of Done por Bloco

### Definition of Ready (antes de iniciar qualquer bloco)

- [ ] Bloco anterior mergeado em `develop` com suite completa verde
- [ ] Este guia disponível e revisado pelo time
- [ ] Estrutura de packages `entity/Flashcard/`, `service/Flashcard/`, etc. entendida
- [ ] Decisões DT-01, DT-02 e DT-03 confirmadas (ou aceitas as recomendações deste guia)

### Definition of Done por bloco

| Critério | Bloco 1 | Bloco 2 | Bloco 3 | Bloco 4 |
|---|---|---|---|---|
| Compilação sem erros | ✓ | ✓ | ✓ | ✓ |
| Testes do bloco passando | — | ≥ 16 | ≥ 6 | ≥ 8 |
| 0 regressões na suite anterior | ✓ | ✓ | ✓ | ✓ |
| PR aprovado e mergeado em `develop` | ✓ | ✓ | ✓ | ✓ |
| Swagger/OpenAPI atualizado | — | ✓ | ✓ | ✓ |

### Definition of Done — Módulo Completo

- [ ] ~105 testes passando (75 anteriores + ~30 novos)
- [ ] 0 regressões em nenhum módulo anterior
- [ ] Todos os RFs (RF-17 a RF-24) com critério de aceite testado
- [ ] RN-04, RN-07, RN-08, RN-09 validados por testes de integração explícitos
- [ ] Swagger documentado com exemplos de request/response para todos os 13 endpoints
- [ ] Módulo entregue em `develop`, pronto para merge em `main`