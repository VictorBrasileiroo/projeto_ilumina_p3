# Ilumina — Documentação Técnica de Projeto

<img src='https://raw.githubusercontent.com/VictorBrasileiroo/projeto_ilumina_p3/refs/heads/develop/frontend/src/imports/banner.png'></img>

Plataforma educacional para criacao e publicacao de avaliacoes e colecoes de flashcards com apoio de LLM.

- **Status:** Em andamento — Mês 4 de 6
- **Fase atual:** Fase 1 — AB1
- **Versão do documento:** 2.0 · 2026

---

## 1. Estado atual do produto

### 1.1 Modulos

| Modulo | Estado |
|---|---|
| Autenticacao/JWT | Concluido e estabilizado |
| Professores | Concluido (CRUD principal) |
| Turmas | Concluido (CRUD principal) |
| Aluno-Turma-Matriculas | Concluido |
| Avaliacoes (blocos 1-4) | Concluido |
| Flashcards BLOCO 1 (fundacao) | Concluido |
| Flashcards BLOCO 2 (API professor/admin) | Concluido |
| Flashcards BLOCO 3 (geracao LLM) | Concluido |
| Flashcards BLOCO 4 (consumo aluno) | Pendente |

### 1.2 Resumo do modulo Flashcards

- Colecoes em `RASCUNHO`/`PUBLICADA`.
- CRUD completo para professor/admin em `/api/v1/colecoes`.
- Geracao via LLM em `POST /api/v1/colecoes/{id}/gerar-flashcards`.
- Validacao defensiva de payload LLM antes de persistir.
- Cobertura de erros operacionais: `400`, `403`, `404`, `429`, `503`.

---

## 2. Arquitetura e stack

### 2.1 Backend

- Java 21
- Spring Boot 3.5.x
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- Banco relacional (perfil de teste com H2)
- Padrao de resposta: `ApiResponse<T>`

### 2.2 Frontend

- Vite
- TypeScript

### 2.3 Padroes arquiteturais

- Arquitetura em camadas (`controller -> service -> repository`).
- Regras de negocio concentradas em service.
- Tratamento global de excecoes com mapeamento HTTP consistente.
- Testes de unidade e integracao por modulo.

---

## 3. Como executar

### 3.1 Backend

Na pasta `backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

Para testes:

```powershell
.\mvnw.cmd test
```

### 3.2 Frontend

Na pasta `frontend`:

```powershell
npm install
npm run dev
```

---

## 4. Documentacao tecnica

A documentacao detalhada esta na pasta `docs`.

Pontos de entrada principais:

- Visao geral: `docs/README.md`
- API Flashcards unificada: `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- Feature Flashcards unificada: `docs/features/2026-04-19-feature-modulo-flashcards-unificada.md`
- Arquitetura Flashcards (estado atual): `docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md`
- Trilha por etapas Flashcards: `docs/etapas/2026-04-19-11-modulo-flashcards-trilha-unica.md`

---

