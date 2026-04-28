# Ilumina — Documentação Técnica de Projeto

<img src='https://raw.githubusercontent.com/VictorBrasileiroo/projeto_ilumina_p3/refs/heads/develop/frontend/src/imports/banner.png'></img>

Plataforma educacional para criacao e publicacao de avaliacoes e colecoes de flashcards com apoio de LLM.

- **Status:** Em andamento — Mês 4 de 6
- **Fase atual:** Fase 1 — AB1
- **Versão do documento:** 2.0 · 2026

---

## Acesso à aplicação

A aplicação está hospedada e pronta para uso. **Não é necessário rodar nada localmente para avaliar o sistema.**

| Recurso | URL |
|---|---|
| Aplicação (frontend) | https://ilumina-frontend.vercel.app |
| API (backend) | https://ilumina-backend.onrender.com |
| Health check | https://ilumina-backend.onrender.com/actuator/health |
| Documentação da API (Swagger) | https://ilumina-backend.onrender.com/swagger-ui.html |

### Aviso sobre o primeiro acesso (cold start)

O backend está hospedado no plano gratuito do Render, que **hiberna após 15 minutos de inatividade**. Isso significa que:

- A **primeira requisição** após um período de inatividade pode demorar **30 a 60 segundos** enquanto o serviço acorda (ex: ao tentar fazer login pela primeira vez)
- As requisições seguintes são instantâneas
- Sugestão prática: antes de testar, abra https://ilumina-backend.onrender.com/actuator/health em uma aba e aguarde retornar `{"status":"UP"}`. Isso "acorda" o backend e os próximos cliques na aplicação serão fluidos.

---

## Fluxos sugeridos para avaliação

### Fluxo 1 — Como Professor

1. Acesse https://ilumina-frontend.vercel.app
2. Na tela de login, clique em **Cadastre-se** e escolha o perfil **Professor**
3. Preencha os dados e crie a conta
4. Faça login
5. No dashboard do professor:
   - Crie uma turma
   - Crie uma coleção de flashcards
   - **Use a geração via LLM (Gemini)** para gerar flashcards a partir de um tema
   - Crie uma prova com questões manuais
   - Convide alunos copiando o link público da turma

### Fluxo 2 — Como Aluno

1. Acesse https://ilumina-frontend.vercel.app
2. Cadastre-se como **Aluno** (ou use o link público de uma turma)
3. Faça login
4. No dashboard do aluno:
   - Acesse uma coleção de flashcards e estude
   - Responda uma prova publicada pelo professor
   - Veja seu resultado e gabarito

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
- PostgreSQL (Neon em produção, perfil de teste com H2)
- Padrao de resposta: `ApiResponse<T>`

### 2.2 Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router 7

### 2.3 Hospedagem (produção)

- **Frontend:** Vercel
- **Backend:** Render (Web Service via Docker)
- **Banco:** Neon (PostgreSQL gerenciado)
- **LLM:** Google Gemini API (`gemini-2.5-flash-lite`)

### 2.4 Padroes arquiteturais

- Arquitetura em camadas (`controller -> service -> repository`).
- Regras de negocio concentradas em service.
- Tratamento global de excecoes com mapeamento HTTP consistente.
- Testes de unidade e integracao por modulo.

---

## 3. Como executar localmente (desenvolvimento)

> Esta seção é necessária apenas para desenvolvimento local. Para avaliar o sistema, use a aplicação no ar (link na seção "Acesso à aplicação" acima).

### 3.0 Pré-requisitos

- Java 21 (JDK)
- Node.js 18+ e npm
- Docker (para subir Postgres local)
- Arquivo `backend/.env` com credenciais locais e chave da API Gemini

### 3.1 Backend

Na pasta `backend`:

```powershell
docker compose up -d            # sobe Postgres em localhost:5432
.\mvnw.cmd spring-boot:run      # backend em localhost:8080
```

Para testes:

```powershell
.\mvnw.cmd test
```

### 3.2 Frontend

Na pasta `frontend`:

```powershell
npm install
npm run dev                     # frontend em localhost:5173
```

Por padrão o frontend local aponta para `http://localhost:8080/api/v1`. Para apontar para o backend hospedado, crie um arquivo `frontend/.env.local` com:

```
VITE_API_URL=https://ilumina-backend.onrender.com/api/v1
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
