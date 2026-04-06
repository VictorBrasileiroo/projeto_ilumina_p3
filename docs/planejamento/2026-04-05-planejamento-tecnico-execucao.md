# Documento de Planejamento Técnico e Execução — Ilumina

> Versão 1.0 · 05/04/2026  
> Autor: Victor André (PM/Dev Frontend) com apoio de análise técnica automatizada

---

## 1. Objetivo do documento

Este documento consolida o estado real do projeto Ilumina na data de 05/04/2026, organiza a evolução do sistema em trilhas paralelas e transforma os objetivos pendentes em um backlog detalhado, pronto para conversão em tarefas no ClickUp.

Objetivos específicos:
- Consolidar o que já existe no backend, frontend e documentação
- Proteger os marcos críticos de abril (design até 08/04, frontend MVP até 15/04)
- Estruturar o backlog completo até junho de 2026
- Identificar dependências, riscos e paralelismo entre trilhas
- Fornecer granularidade suficiente para importação em ferramenta de gestão

---

## 2. Fontes analisadas

| Fonte | Tipo de informação | Relevância |
|-------|-------------------|------------|
| `README.md` (raiz) | Visão de produto, requisitos, modelagem, fluxos de IA, cronograma, equipe | **Principal** — define escopo, módulos, regras de negócio e público-alvo |
| `docs/arquitetura/2026-04-05-estado-atual-do-sistema.md` | Snapshot técnico do backend na data atual | **Crítica** — fonte de verdade sobre o que está implementado |
| `docs/arquitetura/2026-04-04-decisao-modelagem-user-professor-aluno.md` | Decisão canônica de modelagem User/Professor/Aluno | **Crítica** — define padrão arquitetural para todas as entidades de perfil |
| `docs/features/2026-04-05-feature-modulo-professor-crud-inicial.md` | Escopo e contrato do módulo Professor | Alta — define API e limites do primeiro corte |
| `docs/features/2026-04-05-feature-modulo-turma-crud-v1.md` | Escopo e contrato do módulo Turma | Alta — define API, regras e vínculo professor-turma |
| `docs/features/2026-04-05-feature-jwt-refresh-claims.md` | Evolução JWT com refresh e claims | Alta — define contrato de autenticação para o frontend |
| `docs/api/2026-04-05-api-auth-jwt-refresh-claims.md` | Contrato detalhado da API de auth | Alta — referência para integração frontend |
| `docs/api/2026-04-05-api-modulo-professor.md` | Contrato detalhado da API de Professor | Alta — referência para integração frontend |
| `docs/api/2026-04-05-api-modulo-turma.md` | Contrato detalhado da API de Turma | Alta — referência para integração frontend |
| `docs/etapas/2026-03-24-01` até `2026-04-05-06` | Histórico de implementação (6 etapas) | Média — evidencia a sequência e os arquivos criados |
| `docs/guias/01..04` | Guias de branches, PR, bloqueio de páginas, tokens | Média — processo de equipe |
| `docs/lembretes/2026-04-05-lembrete-claims-perfil-jwt.md` | Lembrete sobre alunoId no contrato JWT | Média — confirma que alunoId está previsto mas não resolvido |
| `backend/docker-compose.yml` | Infra de banco PostgreSQL com Docker | Média — confirma containerização parcial |
| `backend/src/main/resources/application-dev.yml` | Configuração de dev (PostgreSQL, Hibernate) | Média — confirma stack e modo ddl-auto:update |
| `frontend/README.md` | Placeholder sem código | **Crítica** — confirma que o frontend está completamente vazio |

---

## 3. Resumo executivo

### Situação atual
O projeto Ilumina possui um **backend funcional e bem estruturado** com autenticação JWT (access + refresh), módulo de Professor (CRUD completo) e módulo de Turma (CRUD + vínculo professor-turma). A arquitetura segue padrão em camadas, com 38 testes de integração passando, documentação técnica organizada e decisões canônicas registradas. O **frontend está completamente vazio** — não existe nenhum código, apenas um README placeholder. O **design** está em estado bruto e precisa de refinamento.

### Módulos já existentes no backend
1. Autenticação e autorização (JWT com refresh + claims enriquecidas)
2. Professor (CRUD + desativação lógica)
3. Turma (CRUD + desativação lógica + vínculo N:N professor-turma)
4. Health check e infraestrutura base (Swagger, CORS, GlobalExceptionHandler)

### Principal risco atual
**O frontend não existe e precisa estar minimamente funcional em 10 dias (até 15/04/2026).** Esse é o gargalo crítico do projeto.

### Foco imediato
1. Refinar design bruto até 08/04
2. Iniciar e entregar frontend MVP até 15/04
3. Manter backend evoluindo em paralelo (Aluno, Provas, Flashcards)

### Estratégia recomendada
Execução em **3 trilhas paralelas** com pontos de sincronização definidos. O frontend inicia com mocks e integra progressivamente conforme os contratos de API já documentados. O backend continua avançando nos módulos de Aluno, Provas e Flashcards sem bloquear o frontend.

### Visão macro até junho
- **Abril:** frontend MVP + módulos Aluno e Provas no backend
- **Maio:** integração real frontend-backend + módulo Flashcards + integração LLM
- **Junho:** testes, hardening, deploy, documentação final

---

## 4. Estado atual confirmado do sistema

### Arquitetura atual
- Backend Java 21 + Spring Boot 3.5.12, arquitetura em camadas (Controller → Service → Repository)
- Spring Security + JWT (JJWT) com access token e refresh token
- Spring Data JPA + Hibernate com PostgreSQL (dev) e H2 (teste)
- Swagger/OpenAPI + Actuator para documentação e monitoramento
- Docker Compose para PostgreSQL
- Hibernate ddl-auto: update (sem migrations formais)

### Backend existente
4 controllers, 3 services, 5 repositories, entidades para User, UserRole, Professor, Turma, ProfTurma. DTOs bem definidos para cada módulo. GlobalExceptionHandler com mapeamento completo de erros HTTP.

### Segurança/autenticação
JWT com access token (24h) e refresh token (7 dias). Claims enriquecidas com userId, professorId, alunoId, roles. Filtro de validação que distingue access de refresh. Roles: ROLE_ADMIN, ROLE_PROFESSOR, ROLE_ALUNO (esta última sem uso efetivo).

### Testes
38 testes de integração passando (Professor + Turma + contexto). Perfil de teste com H2. Sem testes unitários isolados. Sem CI/CD configurado (.github/ contém apenas .gitkeep).

### Frontend
**Inexistente.** Diretório `frontend/` contém apenas um README.md com uma frase genérica. Nenhum framework inicializado, nenhum componente, nenhuma rota.

### Design
Mencionado como "design bruto existente" pelo PM. Não há artefatos de design no repositório. **Hipótese:** o design está em ferramenta externa (Figma, conforme README menciona na equipe).

### Integrações externas
Nenhuma integração LLM implementada. O README descreve o fluxo completo de geração de questões e flashcards via API LLM, mas é apenas especificação. Não há código, serviço ou configuração de IA no backend.

---

### 4.1 O que já está implementado

| Item | Tipo | Status | Evidência documental | Observações |
|------|------|--------|---------------------|-------------|
| Estrutura de projeto Spring Boot | Infra | Completo | etapa 01 | Pacotes organizados por domínio |
| Docker Compose (PostgreSQL) | Infra | Completo | docker-compose.yml | Apenas banco, sem container da aplicação |
| CORS e configuração de segurança base | Segurança | Completo | etapa 01 | SecurityConfig com rotas públicas/protegidas |
| Health check endpoint | API | Completo | etapa 01 | /api/v1/health |
| ApiResponse envelope padrão | Infra | Completo | etapa 01 | Usado em todos os controllers |
| GlobalExceptionHandler | Infra | Completo | etapa 01 + 06 | 400/401/403/404/409/500 |
| Modelo User + UserRole | Módulo | Completo | etapa 02 | Identidade unificada, roles N:N |
| Autenticação JWT (login/register) | Segurança | Completo | etapa 03 | Login + cadastro com token |
| Refresh token + claims enriquecidas | Segurança | Completo | etapa 05 | Access + refresh com professorId/alunoId |
| Carga automática de roles | Infra | Completo | DataInitializerRole | ADMIN, PROFESSOR, ALUNO |
| Módulo Professor (CRUD completo) | Módulo | Completo | etapa 04, feature, API | Criar, listar, detalhar, editar, desativar |
| Módulo Turma (CRUD + vínculo) | Módulo | Completo | etapa 06, feature, API | CRUD + join/leave professor |
| Testes de integração (Professor) | Teste | Completo | ProfessorControllerIntegrationTest | Cenários de sucesso e erro |
| Testes de integração (Turma) | Teste | Completo | TurmaControllerIntegrationTest | Sucesso, validações, autorização, vínculo |
| Swagger/OpenAPI | Documentação | Completo | application config + Actuator | Auto-gerado |
| Documentação técnica organizada | Documentação | Completo | docs/ (20 arquivos) | Arquitetura, features, APIs, etapas, guias |

### 4.2 O que está parcial

| Item | Estado atual | O que falta | Impacto | Prioridade |
|------|-------------|-------------|---------|------------|
| Contrato alunoId no JWT | Campo existe mas retorna null | Implementar entidade Aluno e resolver alunoId no AuthService | Não bloqueia professor, bloqueia fluxo aluno | Alta (necessário para MVP aluno) |
| Criação de professor pública | Endpoint aberto sem autenticação | Definir política final (pública vs restrita) | Risco de segurança em produção | Média |
| Listagem de professor | Funcional, sem filtros/paginação | Adicionar filtro por nome/disciplina e paginação | UX do admin | Baixa para MVP |
| Listagem de turmas | Funcional, sem filtros/paginação | Adicionar filtros e paginação | UX do professor | Baixa para MVP |
| Docker | Apenas PostgreSQL | Falta Dockerfile da aplicação, docker-compose de prod | Deploy em produção | Média (necessário até junho) |
| CI/CD | .github/ vazio | Pipeline de build, teste e deploy | Qualidade e deploy contínuo | Média |

### 4.3 O que ainda não foi iniciado ou não foi confirmado

| Item | Origem | Necessidade | Observações |
|------|--------|-------------|-------------|
| Entidade Aluno + CRUD | README + decisão de modelagem | Essencial (Fase 1) | Segue padrão 1:1 com User, já decidido |
| Vínculo aluno-turma (N:N) | README (RF-11) | Essencial (Fase 1) | Estrutura análoga a prof_turma |
| Módulo Provas (entidade + CRUD) | README (RF-12 a RF-16) | Essencial (Fase 1) | Inclui questões e alternativas |
| Módulo Flashcards (entidade + CRUD) | README (RF-17 a RF-24) | Essencial (Fase 1) | Inclui coleção e cards individuais |
| Integração LLM (geração de questões) | README (RF-13, seção 08) | Essencial (Fase 1) | Prompt, chamada HTTP, validação JSON |
| Integração LLM (geração de flashcards) | README (RF-18, seção 08) | Essencial (Fase 1) | Prompt, chamada HTTP, validação JSON |
| Publicação de prova (status rascunho→publicada) | README (RF-15, RN-03) | Essencial (Fase 1) | Workflow de status com regras de negócio |
| Publicação de coleção de flashcards | README (RF-22) | Essencial (Fase 1) | Workflow de status análogo |
| Realização de prova pelo aluno | README (RF-16) | Essencial (Fase 1) | Tela de resposta + submissão |
| Estudo de flashcards pelo aluno | README (RF-23) | Essencial (Fase 1) | Interface frente/verso |
| Recuperação de senha | README (RF-04) | Média | Depende de serviço de e-mail |
| Frontend (completo) | README + realidade | **Crítico** | Diretório vazio |
| Design refinado | Requisito do PM | **Crítico** (até 08/04) | Presumivelmente em Figma |
| Dashboard de desempenho | README (Módulo 04) | Fase 2 | Não é escopo de abril |
| Testes unitários | Inferência | Desejável | Apenas testes de integração existem |
| CI/CD (GitHub Actions) | README (RNF-09) | Necessário até junho | .github/ vazio |
| Deploy em produção (Render) | README | Necessário até junho | Nenhuma configuração existe |

---

## 5. Restrições, premissas e marcos

### 5.1 Restrições

| Restrição | Descrição |
|-----------|-----------|
| R1 | Design refinado deve estar pronto até **08/04/2026** |
| R2 | Frontend mínimo funcional (mesmo com mocks) até **15/04/2026** |
| R3 | Backend continua evoluindo até **junho de 2026** |
| R4 | Equipe reduzida: 1 PM/dev frontend (Victor), 1 designer (Laura), 1 dev frontend (Yuri), 2 devs backend (Erasmo, Riquelme) |
| R5 | Designer (Laura) e dev frontend (Yuri) atuam apenas na Fase 1 (AB1) |
| R6 | Devs backend (Erasmo, Riquelme) atuam na Fase 2 (AB2) |
| R7 | Frontend não pode depender de backend para fluxos visuais iniciais — deve funcionar com mocks |
| R8 | Integração LLM depende de escolha e configuração de provedor de API (não definido ainda) |

### 5.2 Premissas

| Premissa | Descrição |
|----------|-----------|
| P1 | O design bruto existe em ferramenta externa (Figma) e está acessível à equipe |
| P2 | O framework frontend será React (mencionado no README como opção primária) |
| P3 | Os contratos de API documentados em `docs/api/` são estáveis e podem ser usados para mocks |
| P4 | Victor atuará simultaneamente como PM e dev frontend |
| P5 | Os devs backend (Erasmo, Riquelme) começam a atuar a partir de abril/maio |
| P6 | O provedor de LLM será uma API HTTP externa (OpenAI, Anthropic ou similar) |
| P7 | Hibernate ddl-auto:update é aceitável durante o desenvolvimento; migrations formais são desejáveis para produção |

### 5.3 Riscos de prazo

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Design não refinado até 08/04 | Frontend MVP atrasa | Média | Victor avança com wireframes funcionais mínimos caso design atrase |
| Frontend vazio + prazo de 10 dias | MVP não entregue | Alta | Usar scaffold rápido (Vite + React), priorizar só telas essenciais, mocks extensivos |
| Victor sobrecarregado (PM + dev frontend) | Gargalo em ambas frentes | Alta | Delegar tarefas de design fechado para Yuri, priorizar ruthlessly |
| Backend sem CI bloqueia integração | Regressões silenciosas | Média | Configurar CI mínimo com GitHub Actions no início de maio |

### 5.4 Dependências críticas

| Dependência | De | Para | Tipo |
|-------------|-----|------|------|
| Design refinado | Trilha A | Trilha B (frontend MVP) | Parcial — frontend pode iniciar com layout base enquanto design finaliza |
| Contratos de API documentados | Backend existente | Frontend (mocks) | Já satisfeita — docs/api/ tem contratos de Auth, Professor e Turma |
| Entidade Aluno no backend | Trilha C | Frontend (fluxo aluno real) | Frontend pode mockar até que backend implemente |
| Módulo Provas no backend | Trilha C | Frontend (fluxo de provas real) | Frontend pode mockar |
| Integração LLM | Decisão de provedor | Módulos de geração | Frontend pode simular resposta de IA |

---

## 6. Estratégia de execução recomendada

A estratégia é **execução paralela em 3 trilhas com desacoplamento via mocks**, protegendo o prazo do frontend MVP sem frear a evolução do backend.

Justificativa: O backend já possui contratos de API documentados e estáveis para Auth, Professor e Turma. Isso permite que o frontend seja construído contra esses contratos (usando mocks onde o backend ainda não implementou). O backend avança nos módulos restantes sem esperar pelo frontend. O design se fecha rapidamente e alimenta o frontend em tempo real.

### Trilha A — Design / UX (até 08/04/2026)

- **Objetivo:** Fechar o design visual mínimo para as telas do MVP
- **Entregáveis:** Fluxos navegáveis no Figma para login, dashboard professor, turmas, provas (mock), flashcards (mock), dashboard aluno
- **Dependências:** Acesso ao design bruto existente
- **Riscos:** Atraso no refinamento impacta diretamente a Trilha B
- **Paralelismo:** Pode rodar 100% em paralelo com Trilha C

### Trilha B — Frontend MVP (até 15/04/2026)

- **Objetivo:** Entregar interface mínima navegável e funcional com mocks
- **Entregáveis:** Projeto React inicializado, autenticação (login/cadastro), layout base, navegação por perfil, telas mínimas de professor e aluno com dados mockados
- **Dependências:** Design refinado (parcial — pode iniciar com wireframes); contratos de API (já existem)
- **Riscos:** Prazo apertado (10 dias); depende de Victor + Yuri focados
- **Paralelismo:** Inicia em paralelo com Trilha A a partir do dia 06/04

### Trilha C — Backend / Consolidação (até junho/2026)

- **Objetivo:** Completar todos os módulos do backend, integrar LLM, hardening e deploy
- **Entregáveis:** Módulo Aluno, Provas, Flashcards, integração LLM, testes, CI/CD, deploy
- **Dependências:** Decisões de modelagem (já documentadas); escolha de provedor LLM
- **Riscos:** Complexidade da integração LLM; módulo de Provas é o mais complexo (3 entidades cascateadas)
- **Paralelismo:** Corre independente das trilhas A e B; sincroniza com frontend nos pontos de integração

---

## 7. Priorização por horizonte

### 7.1 Urgente até 08/04/2026

**Objetivo:** Fechar design mínimo e iniciar frontend.

| Item | Justificativa |
|------|---------------|
| Refinamento visual das telas do MVP no Figma | Bloqueia qualidade visual do frontend |
| Definição de componentes base (botões, inputs, cards, tabela, modal) | Frontend precisa de componentes padronizados |
| Fluxo de login/cadastro no design | Primeira tela que será implementada |
| Fluxo de dashboard e navegação do professor | Core do MVP |
| Scaffold do projeto React (Vite + React + Router + Tailwind/lib UI) | Dia 1 do frontend |
| Estrutura de pastas, roteamento base, layout shell | Fundação para todas as telas |

**Risco se atrasar:** Frontend MVP de 15/04 fica inviável.

### 7.2 Urgente até 15/04/2026

**Objetivo:** Frontend MVP funcional.

| Item | Justificativa |
|------|---------------|
| Tela de login funcional (integrada com API real) | Demonstra autenticação funcionando |
| Tela de cadastro de professor (integrada com API real) | Demonstra fluxo de onboarding |
| Dashboard do professor (mockado) | Mostra experiência do professor |
| Listagem de turmas (integrada com API real) | Demonstra gestão de turmas |
| Formulário de criação de turma (integrado com API real) | Demonstra criação funcional |
| Telas de provas e flashcards (mockadas) | Mostra que os fluxos existem visualmente |
| Dashboard do aluno (mockado) | Mostra experiência do aluno |
| Proteção de rotas por perfil | Demonstra controle de acesso |

**Risco se atrasar:** Não há demonstração funcional da plataforma.

### 7.3 Importante de 16/04 até junho de 2026

**Objetivo:** Completar backend, integrar tudo, preparar para produção.

| Item | Justificativa |
|------|---------------|
| Módulo Aluno (backend) | Habilita fluxo real do aluno |
| Vínculo aluno-turma | Necessário para provas e flashcards por turma |
| Módulo Provas completo (backend) | Core do produto |
| Módulo Flashcards completo (backend) | Core do produto |
| Integração LLM | Diferencial do produto |
| Integração frontend ↔ backend (provas, flashcards, aluno) | Substituir mocks por dados reais |
| Testes automatizados expandidos | Qualidade para produção |
| CI/CD com GitHub Actions | Deploy automatizado |
| Dockerfile + deploy no Render | Entrega em produção |
| Documentação final da API (Swagger) | Entrega acadêmica |

**Risco se atrasar:** Projeto não chega a produção em junho.

### 7.4 Pós-junho / expansão futura

| Item | Justificativa |
|------|---------------|
| Dashboard de desempenho (Módulo 04) | Fase 2 — análise pedagógica |
| Recuperação de senha por e-mail | Nice-to-have para v1 |
| Revogação de refresh token (blacklist) | Segurança avançada |
| Paginação e filtros avançados em todas as listagens | Otimização de UX |
| Notificações | Engajamento |

---

## 8. Roadmap por janela de tempo

### 8.1 Janela 05/04–08/04 (4 dias)

**Meta:** Design fechado + fundação do frontend.

| Entregável | Trilha | Responsável sugerido |
|------------|--------|---------------------|
| Refinamento de todas as telas do MVP no Figma | A | Laura |
| Design system mínimo (cores, tipografia, componentes) | A | Laura |
| Scaffold do projeto React (Vite + React + React Router + lib UI) | B | Victor/Yuri |
| Estrutura de pastas frontend (pages, components, services, hooks, types) | B | Victor/Yuri |
| Layout shell (sidebar/header, área de conteúdo) | B | Victor/Yuri |
| Configuração de roteamento base com rotas públicas e protegidas | B | Victor/Yuri |
| Serviço de API base com interceptor de token e refresh | B | Victor |

**O que precisa estar pronto ao final:** Design aprovado no Figma. Projeto React rodando com layout base e roteamento.

### 8.2 Janela 09/04–15/04 (7 dias)

**Meta:** Frontend MVP completo com mocks.

| Entregável | Trilha | Responsável sugerido |
|------------|--------|---------------------|
| Tela de login (integrada com API real) | B | Victor/Yuri |
| Tela de cadastro de professor (integrada com API real) | B | Victor/Yuri |
| Lógica de sessão (armazenar tokens, contexto do usuário, proteção de rotas) | B | Victor |
| Dashboard do professor (layout + dados mockados) | B | Yuri |
| Listagem de turmas (integrada com API real) | B | Victor/Yuri |
| Formulário de criação/edição de turma (integrado com API real) | B | Victor/Yuri |
| Tela de listagem de provas (mockada) | B | Yuri |
| Tela de criação de prova (mockada) | B | Yuri |
| Tela de listagem de flashcards (mockada) | B | Yuri |
| Dashboard do aluno (mockado) | B | Yuri |
| Componentes compartilhados (Card, Table, Modal, Form, Button, Loading, Empty, Error) | B | Victor/Yuri |
| **Backend:** Início do módulo Aluno (entidade + CRUD) | C | Erasmo/Riquelme |

**O que precisa estar pronto ao final:** É possível demonstrar: login → dashboard professor → turmas → fluxo visual de provas/flashcards. Aluno pode logar e ver dashboard mockado.

### 8.3 Janela 16/04–30/04 (15 dias)

**Meta:** Backend Aluno + Provas. Integração progressiva no frontend.

| Entregável | Trilha |
|------------|--------|
| Módulo Aluno completo (backend): CRUD + vínculo aluno-turma | C |
| Módulo Provas (backend): entidade Prova + Questão + Alternativa, CRUD | C |
| Geração de questões via LLM (backend): integração HTTP + validação JSON | C |
| Workflow de publicação de prova (rascunho → publicada) | C |
| Frontend: integrar fluxo de Aluno com API real (cadastro, login, dashboard) | B+C |
| Frontend: começar integração real de Provas quando API estiver disponível | B+C |
| Frontend: tela de perfil do professor (edição) | B |

**O que precisa estar pronto ao final:** Backend com Aluno e Provas funcionais. Frontend começando a substituir mocks por APIs reais.

### 8.4 Maio de 2026

**Meta:** Backend Flashcards + integração LLM completa. Frontend integrado.

| Entregável | Trilha |
|------------|--------|
| Módulo Flashcards completo (backend): coleção + cards, CRUD | C |
| Geração de flashcards via LLM (backend) | C |
| Workflow de publicação de coleção | C |
| Frontend: integração completa de Provas (criar, revisar, publicar, responder) | B+C |
| Frontend: integração completa de Flashcards (criar, revisar, publicar, estudar) | B+C |
| Frontend: tela de realização de prova pelo aluno | B |
| Frontend: tela de estudo de flashcards pelo aluno | B |
| CI/CD com GitHub Actions (build + test) | Infra |
| Testes de integração para Aluno, Provas, Flashcards | QA |

**O que precisa estar pronto ao final:** Sistema funcional ponta a ponta. Professor cria prova/flashcard com IA, publica. Aluno responde/estuda.

### 8.5 Junho de 2026

**Meta:** Hardening, testes finais, deploy em produção, documentação.

| Entregável | Trilha |
|------------|--------|
| Dockerfile da aplicação backend | Infra |
| Deploy no Render (backend + banco) | Infra |
| Deploy do frontend (Render/Vercel/Netlify) | Infra |
| Testes de integração completos | QA |
| Documentação final da API via Swagger | Doc |
| Tratamento de edge cases LLM (timeout, resposta malformada) | C |
| Revisão de segurança (política de criação de professor, HTTPS, headers) | Segurança |
| Revisão de responsividade e usabilidade final | B |
| Documentação de entrega acadêmica | Doc |

---

## 9. Planejamento detalhado por trilha

### 9.1 Trilha A — Design / UX

---

#### A-01: Refinamento visual do fluxo de autenticação

- **Objetivo:** Fechar design de login, cadastro e recuperação de senha
- **Descrição:** Refinar as telas brutas de autenticação no Figma, garantindo consistência visual, estados de formulário (idle, erro, loading) e responsividade mobile/desktop
- **Entradas:** Design bruto existente, requisitos RF-01 a RF-04
- **Saídas:** Telas finais no Figma com especificações de componentes
- **Subtasks:**
  - Refinar tela de login (campos, botão, link para cadastro, link para recuperação)
  - Refinar tela de cadastro com seletor de perfil (professor/aluno)
  - Definir estados de erro por campo e mensagens
  - Definir estado de loading durante requisição
  - Garantir versão mobile
- **Dependências:** Nenhuma
- **Prioridade:** Crítica
- **Complexidade:** Baixa
- **Critério de aceite:** Telas aprovadas por Victor com todos os estados documentados
- **Prazo:** 05/04–07/04

---

#### A-02: Refinamento do layout base e navegação

- **Objetivo:** Definir o shell da aplicação (sidebar, header, área de conteúdo)
- **Descrição:** Criar o layout master que será usado em todas as telas autenticadas, diferenciado por perfil (professor vs aluno)
- **Entradas:** Estrutura de módulos do README, fluxos do professor e aluno
- **Saídas:** Layout base no Figma com sidebar (professor: turmas, provas, flashcards, perfil; aluno: minhas turmas, provas, flashcards, perfil)
- **Subtasks:**
  - Design da sidebar/menu para professor
  - Design da sidebar/menu para aluno
  - Header com nome do usuário, perfil e logout
  - Área de conteúdo com breadcrumb ou título de seção
  - Versão mobile (hamburger menu ou bottom nav)
- **Dependências:** Nenhuma
- **Prioridade:** Crítica
- **Complexidade:** Média
- **Critério de aceite:** Layout funcional com navegação clara entre módulos
- **Prazo:** 05/04–07/04

---

#### A-03: Design system mínimo

- **Objetivo:** Padronizar componentes visuais reutilizáveis
- **Descrição:** Definir a paleta de cores, tipografia, espaçamento e os componentes base (botão primário/secundário, input de texto, select, card, modal, tabela, badge de status, estados de loading/empty/error)
- **Entradas:** Identidade visual do Ilumina (se existir), referências
- **Saídas:** Biblioteca de componentes no Figma
- **Subtasks:**
  - Paleta de cores (primária, secundária, sucesso, erro, warning, neutros)
  - Tipografia (headings, body, captions)
  - Componentes: Button, Input, Select, Textarea, Card, Modal, Table, Badge, Alert, Spinner/Skeleton, Empty state
  - Definir tokens de espaçamento
- **Dependências:** Nenhuma
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Componentes documentados e consistentes
- **Prazo:** 06/04–08/04

---

#### A-04: Refinamento das telas do professor

- **Objetivo:** Fechar design das telas core do professor
- **Descrição:** Refinar dashboard, listagem de turmas, formulário de turma, listagem de provas e listagem de flashcards
- **Entradas:** Design bruto, lista de telas do README (seção 9.3), design system (A-03)
- **Saídas:** Telas finais no Figma
- **Subtasks:**
  - Dashboard do professor (cards resumo + acesso rápido)
  - Listagem de turmas (tabela com ações)
  - Formulário de criação/edição de turma
  - Detalhe da turma (alunos, provas, flashcards vinculados)
  - Listagem de provas (com filtro por status)
  - Listagem de flashcards (com filtro por status)
- **Dependências:** A-02 (layout), A-03 (componentes)
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Todas as telas listadas com estados completos
- **Prazo:** 07/04–08/04

---

#### A-05: Refinamento das telas do aluno

- **Objetivo:** Fechar design das telas core do aluno
- **Descrição:** Refinar dashboard do aluno, tela de realização de prova, resultado e estudo de flashcards
- **Entradas:** Design bruto, lista de telas do README, design system (A-03)
- **Saídas:** Telas finais no Figma
- **Subtasks:**
  - Dashboard do aluno (provas e flashcards disponíveis)
  - Tela de realização de prova (questão por questão ou scroll)
  - Tela de resultado (gabarito)
  - Tela de estudo de flashcards (card flip, navegação)
- **Dependências:** A-02 (layout), A-03 (componentes)
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Fluxo aluno completo e navegável no Figma
- **Prazo:** 07/04–08/04

---

### 9.2 Trilha B — Frontend MVP

---

#### B-01: Scaffold do projeto React

- **ID:** B-01
- **Objetivo:** Criar o projeto frontend com stack definida e estrutura de pastas
- **Descrição:** Inicializar projeto com Vite + React + TypeScript. Instalar dependências essenciais: React Router, Axios (ou fetch wrapper), biblioteca de UI (shadcn/ui, Chakra ou similar), Tailwind CSS
- **Entradas:** Decisão de stack (React + TypeScript + Vite)
- **Saídas:** Projeto buildável com `npm run dev`
- **Subtasks:**
  - `npm create vite@latest frontend -- --template react-ts`
  - Instalar e configurar Tailwind CSS
  - Instalar React Router DOM v6
  - Instalar Axios
  - Instalar biblioteca de componentes UI (decisão necessária)
  - Criar estrutura de pastas: `src/{pages,components,services,hooks,types,contexts,lib,mocks}`
  - Configurar path aliases no tsconfig
  - Limpar boilerplate do Vite
- **Dependências:** Nenhuma
- **Prioridade:** Crítica
- **Complexidade:** Baixa
- **Critério de aceite:** `npm run dev` funciona, estrutura de pastas criada, build sem erros
- **Prazo:** 05/04–06/04

---

#### B-02: Layout shell e roteamento base

- **ID:** B-02
- **Objetivo:** Implementar o layout master e a estrutura de rotas
- **Descrição:** Criar o layout com sidebar/header compartilhado, área de conteúdo dinâmica. Configurar React Router com rotas públicas (login, cadastro) e privadas (dashboard, turmas, provas, flashcards, perfil) separadas por perfil
- **Entradas:** Design do layout (A-02), estrutura de módulos
- **Saídas:** Navegação funcional entre todas as rotas (páginas placeholder)
- **Subtasks:**
  - Componente `AuthLayout` (rotas públicas, sem sidebar)
  - Componente `AppLayout` (rotas privadas, com sidebar + header)
  - Sidebar com links para módulos do professor
  - Sidebar com links para módulos do aluno
  - Lógica de roteamento condicional por perfil (professor vs aluno)
  - Páginas placeholder para todas as rotas
  - Componente `ProtectedRoute` (redireciona para login se não autenticado)
  - Rota 404
- **Dependências:** B-01
- **Prioridade:** Crítica
- **Complexidade:** Média
- **Critério de aceite:** Navegação funcional entre todas as seções; rotas protegidas redirecionam; sidebar muda por perfil
- **Prazo:** 06/04–08/04

---

#### B-03: Serviço de API e interceptor de autenticação

- **ID:** B-03
- **Objetivo:** Criar a camada de comunicação com o backend
- **Descrição:** Configurar Axios instance com base URL, interceptor de request (adiciona Bearer token), interceptor de response (detecta 401, faz refresh automático, retry). Criar AuthContext com estado de sessão
- **Entradas:** Contrato de API de auth (`docs/api/2026-04-05-api-auth-jwt-refresh-claims.md`), guia de tokens (`docs/guias/04`)
- **Saídas:** `api.ts` (Axios configurado), `AuthContext.tsx` (estado de sessão), `useAuth` hook
- **Subtasks:**
  - Criar `src/services/api.ts` com Axios instance configurada
  - Implementar interceptor de request (adicionar Authorization header)
  - Implementar interceptor de response (refresh automático em 401)
  - Criar `src/contexts/AuthContext.tsx` com estado: user, tokens, isAuthenticated, login(), logout(), refresh()
  - Criar `src/hooks/useAuth.ts`
  - Armazenar tokens em localStorage (ou sessionStorage, decisão)
  - Decodificar claims do JWT para obter userId, professorId, roles
  - Criar tipos TypeScript para AuthResponse, User
- **Dependências:** B-01
- **Prioridade:** Crítica
- **Complexidade:** Média-Alta
- **Critério de aceite:** Login funcional com API real; refresh automático; logout limpa sessão; contexto disponível em toda a app
- **Prazo:** 06/04–09/04

---

#### B-04: Tela de login

- **ID:** B-04
- **Objetivo:** Implementar tela de login integrada com API real
- **Descrição:** Formulário com email e senha, validação frontend, chamada a `POST /api/v1/auth/login`, tratamento de erros (401, 400), redirecionamento por perfil após sucesso
- **Entradas:** Design (A-01), contrato de API de auth, AuthContext (B-03)
- **Saídas:** Tela de login funcional e integrada
- **Subtasks:**
  - Formulário com validação (email obrigatório, formato; senha obrigatória, min 6)
  - Estado de loading durante requisição
  - Tratamento de erro (credenciais inválidas, erro de rede)
  - Chamada a `POST /api/v1/auth/login`
  - Salvar tokens e dados do usuário no AuthContext
  - Redirecionar para dashboard correto conforme role (PROFESSOR → /professor, ALUNO → /aluno)
  - Link para cadastro
- **Dependências:** B-02, B-03, A-01 (parcial)
- **Prioridade:** Crítica
- **Complexidade:** Baixa-Média
- **Critério de aceite:** Login funcional com backend real; erro mostrado ao usuário; redirecionamento correto
- **Prazo:** 09/04–10/04

---

#### B-05: Tela de cadastro de professor

- **ID:** B-05
- **Objetivo:** Implementar cadastro de professor integrado com API real
- **Descrição:** Formulário com nome, email, senha, disciplina, sexo. Chamada a `POST /api/v1/professor`. Login imediato com tokens retornados
- **Entradas:** Design (A-01), contrato de API de professor, AuthContext (B-03)
- **Saídas:** Cadastro funcional e integrado
- **Subtasks:**
  - Formulário com todos os campos e validações
  - Chamada a `POST /api/v1/professor`
  - Tratamento de erro 409 (email duplicado) e 400
  - Login automático com tokens retornados
  - Redirecionamento para dashboard do professor
- **Dependências:** B-03, B-04
- **Prioridade:** Alta
- **Complexidade:** Baixa-Média
- **Critério de aceite:** Cadastro funcional; professor logado após cadastro; erros exibidos
- **Prazo:** 10/04–11/04

---

#### B-06: Dashboard do professor (mockado)

- **ID:** B-06
- **Objetivo:** Implementar dashboard principal do professor com dados mockados
- **Descrição:** Página inicial do professor após login com cards resumo (total de turmas, provas, flashcards) e acesso rápido aos módulos. Dados inicialmente mockados
- **Entradas:** Design (A-04), dados do AuthContext
- **Saídas:** Dashboard visual funcional
- **Subtasks:**
  - Card de resumo: turmas (quantidade)
  - Card de resumo: provas recentes
  - Card de resumo: flashcards recentes
  - Links rápidos para criar turma, criar prova, criar flashcard
  - Saudação com nome do professor (do AuthContext)
  - Mock de dados de resumo
- **Dependências:** B-02, B-03
- **Prioridade:** Alta
- **Complexidade:** Baixa
- **Critério de aceite:** Dashboard renderiza com dados mockados; navegação funciona
- **Prazo:** 10/04–11/04

---

#### B-07: Listagem e criação de turmas (integrada)

- **ID:** B-07
- **Objetivo:** Implementar listagem e criação de turmas integradas com API real
- **Descrição:** Tela de listagem com tabela mostrando turmas do professor (API real: `GET /api/v1/turmas`). Modal ou página de criação (API real: `POST /api/v1/turmas`). Edição e desativação
- **Entradas:** Design (A-04), contrato de API de turma
- **Saídas:** CRUD de turmas funcional com API real
- **Subtasks:**
  - Serviço de API para turmas (`src/services/turmaService.ts`)
  - Tela de listagem com tabela (nome, ano, turno, ensino, qtd alunos, status)
  - Formulário de criação de turma com selects para turno e ensino (enums)
  - Formulário de edição de turma
  - Ação de desativação com confirmação
  - Loading state, empty state, error state
  - Chamadas reais à API
- **Dependências:** B-03, B-04 (autenticação funcional)
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Professor cria, lista, edita e desativa turmas via API real
- **Prazo:** 11/04–13/04

---

#### B-08: Telas de provas (mockadas)

- **ID:** B-08
- **Objetivo:** Implementar telas de provas com dados mockados
- **Descrição:** Listagem de provas, formulário de criação de prova (título, turma, tema, quantidade), tela de revisão de questões geradas, todos com mocks
- **Entradas:** Design (A-04), modelo de dados do README
- **Saídas:** Fluxo visual completo de provas
- **Subtasks:**
  - Mock data: lista de provas com status rascunho/publicada
  - Mock data: questões com enunciado, 4 alternativas, gabarito
  - Tela de listagem de provas (tabela com status badge)
  - Formulário de criação de prova (título, turma select, tema, quantidade)
  - Simulação de loading de geração IA (skeleton/progress)
  - Tela de revisão de questões (editar enunciado, alternativas, gabarito)
  - Botão de publicar (muda status no mock)
- **Dependências:** B-02, B-06
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Fluxo completo navegável: criar → gerar (simulado) → revisar → publicar
- **Prazo:** 12/04–14/04

---

#### B-09: Telas de flashcards (mockadas)

- **ID:** B-09
- **Objetivo:** Implementar telas de flashcards com dados mockados
- **Descrição:** Listagem de coleções, formulário de criação, tela de revisão de cards, todas mockadas
- **Entradas:** Design (A-04), modelo de dados do README
- **Saídas:** Fluxo visual completo de flashcards
- **Subtasks:**
  - Mock data: lista de coleções com status
  - Mock data: flashcards com frente/verso
  - Tela de listagem de coleções
  - Formulário de criação de coleção
  - Simulação de loading de geração IA
  - Tela de revisão de flashcards (editar frente/verso, reordenar)
  - Botão de publicar
- **Dependências:** B-02, B-06
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Fluxo completo navegável
- **Prazo:** 13/04–15/04

---

#### B-10: Dashboard e telas do aluno (mockadas)

- **ID:** B-10
- **Objetivo:** Implementar área do aluno com dados mockados
- **Descrição:** Dashboard do aluno com provas e flashcards disponíveis. Tela de realização de prova (mockada). Tela de estudo de flashcards (card flip mockado)
- **Entradas:** Design (A-05), modelo de dados do README
- **Saídas:** Experiência mínima do aluno
- **Subtasks:**
  - Dashboard: lista de provas disponíveis + lista de flashcards disponíveis
  - Tela de prova: questões com alternativas (mockadas), seleção de resposta, submissão
  - Tela de resultado (gabarito mockado)
  - Tela de flashcards: componente de card flip (frente/verso), navegação entre cards
  - Mock data para todas as telas
- **Dependências:** B-02
- **Prioridade:** Média-Alta
- **Complexidade:** Média
- **Critério de aceite:** Aluno navega por provas e flashcards mockados; card flip funcional
- **Prazo:** 13/04–15/04

---

#### B-11: Componentes compartilhados

- **ID:** B-11
- **Objetivo:** Criar biblioteca de componentes reutilizáveis
- **Descrição:** Implementar componentes que são usados em múltiplas telas
- **Entradas:** Design system (A-03)
- **Saídas:** Componentes prontos para uso
- **Subtasks:**
  - `LoadingSpinner` / `Skeleton`
  - `EmptyState` (com ícone, mensagem e CTA)
  - `ErrorAlert` (com mensagem e retry)
  - `ConfirmModal` (ação destrutiva)
  - `StatusBadge` (rascunho, publicada, ativa, inativa)
  - `PageHeader` (título + ação principal)
  - `DataTable` (genérica com sorting básico)
  - `FormField` (wrapper de label + input + erro)
- **Dependências:** B-01, A-03
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Componentes usados consistentemente em todas as telas
- **Prazo:** 07/04–10/04 (progressivo, conforme necessidade das telas)

---

### 9.3 Trilha C — Backend / Consolidação

---

#### C-01: Módulo Aluno — Entidade e CRUD

- **ID:** C-01
- **Objetivo:** Implementar entidade Aluno com CRUD seguindo o padrão do Professor
- **Descrição:** Criar Aluno como perfil 1:1 de User (mesma decisão canônica). CRUD: criar, listar, detalhar, editar, desativar. Cadastro transacional (User + Aluno em uma transação). Resolver alunoId no AuthService
- **Entradas:** Decisão de modelagem (`docs/arquitetura/2026-04-04-decisao-modelagem-user-professor-aluno.md`), padrão do módulo Professor
- **Saídas:** API funcional em `/api/v1/aluno`
- **Subtasks:**
  - Criar entidade `Aluno` (user_id FK única, matricula, sexo)
  - Criar `AlunoRepository`
  - Criar DTOs: `CreateAlunoRequest`, `UpdateAlunoRequest`, `AlunoResponse`, `CreateAlunoResponse`
  - Criar `AlunoService` (seguir padrão ProfessorService)
  - Criar `AlunoController` em `/api/v1/aluno`
  - Configurar SecurityConfig: POST /api/v1/aluno público (ou conforme política)
  - Resolver `alunoId` no `JwtTokenService` / `AuthService` para claims
  - Atribuir ROLE_ALUNO na criação
  - Retornar tokens no cadastro (como Professor)
  - Testes de integração (sucesso, validações, autorização)
  - Documentação: feature, API, etapa
- **Dependências:** Nenhuma (backend independente)
- **Prioridade:** Alta
- **Complexidade:** Média (padrão já estabelecido)
- **Critério de aceite:** CRUD funcional; alunoId presente nas claims JWT; testes passando
- **Prazo:** 09/04–16/04

---

#### C-02: Vínculo aluno-turma (matrícula)

- **ID:** C-02
- **Objetivo:** Implementar relação N:N entre aluno e turma
- **Descrição:** Criar entidade AlunoTurma (pivot). Endpoints para matricular e desmatricular aluno. Listar alunos de uma turma. Listar turmas de um aluno
- **Entradas:** Modelo de ProfTurma como referência, RF-11
- **Saídas:** API funcional para matrícula
- **Subtasks:**
  - Criar entidade `AlunoTurma` com constraint de unicidade (aluno_id, turma_id)
  - Criar `AlunoTurmaRepository`
  - Endpoints em TurmaController ou AlunoController:
    - `POST /api/v1/turmas/{id}/alunos` (matricular)
    - `DELETE /api/v1/turmas/{id}/alunos/{alunoId}` (desmatricular)
    - `GET /api/v1/turmas/{id}/alunos` (listar alunos da turma)
  - Endpoint em AlunoController:
    - `GET /api/v1/aluno/{id}/turmas` (listar turmas do aluno)
  - Autorização: professor vinculado à turma ou admin pode matricular/desmatricular
  - Testes de integração
  - Documentação
- **Dependências:** C-01 (Aluno precisa existir)
- **Prioridade:** Alta
- **Complexidade:** Média
- **Critério de aceite:** Matrícula/desmatrícula funcional; listagem de alunos por turma; listagem de turmas por aluno
- **Prazo:** 16/04–21/04

---

#### C-03: Módulo Provas — Entidades e CRUD

- **ID:** C-03
- **Objetivo:** Implementar entidades Prova, Questão e Alternativa com CRUD
- **Descrição:** Três entidades em cascata. Prova vinculada a professor e turma. Questões vinculadas a prova. Alternativas vinculadas a questão. Status de prova: rascunho/publicada
- **Entradas:** Modelagem do README (seção 06), RF-12 a RF-16, RN-02/03/05
- **Saídas:** API funcional em `/api/v1/provas`
- **Subtasks:**
  - Criar entidade `Prova` (titulo, descricao, qntQuestoes, status, idProf, idTurma)
  - Criar entidade `Questao` (enunciado, gabarito, pontuacao, ordem, idProva)
  - Criar entidade `Alternativa` (texto, letra, idQuestao)
  - Criar repositories para as 3 entidades
  - Criar DTOs de request e response para Prova, Questão e Alternativa
  - Criar `ProvaService`:
    - Criar prova (status = rascunho)
    - Listar provas do professor (com filtro por status)
    - Detalhar prova com questões e alternativas
    - Editar prova (apenas se rascunho — RN-03)
    - Publicar prova (rascunho → publicada)
    - Despublicar prova (publicada → rascunho)
    - Excluir prova (apenas se rascunho)
  - Criar `ProvaController` com endpoints REST
  - Adicionar/editar/remover questões individuais
  - Validar: gabarito corresponde a uma alternativa (RN-02); 2-4 alternativas por questão (RN-05)
  - Autorização: apenas professor criador ou admin
  - Testes de integração
  - Documentação
- **Dependências:** Nenhuma direta (usa Professor e Turma já existentes)
- **Prioridade:** Alta
- **Complexidade:** Alta (3 entidades, regras de negócio complexas)
- **Critério de aceite:** CRUD completo de prova com questões e alternativas; publicação/despublicação funcional; regras de negócio validadas; testes passando
- **Prazo:** 18/04–30/04

---

#### C-04: Integração LLM — Geração de questões

- **ID:** C-04
- **Objetivo:** Implementar chamada à API LLM para gerar questões automaticamente
- **Descrição:** Criar camada de integração que monta o prompt, chama a API LLM (HTTP), recebe JSON, valida e persiste em cascata (Prova → Questões → Alternativas)
- **Entradas:** Fluxo descrito no README seção 08.2, contratos JSON de resposta
- **Saídas:** Endpoint que gera questões via IA e persiste
- **Subtasks:**
  - Definir provedor LLM e obter API key (OpenAI, Anthropic, etc.)
  - Criar `LlmIntegrationService` (camada de integração isolada)
  - Montar prompt parametrizado (tema, quantidade, idioma)
  - Chamada HTTP à API LLM (RestTemplate ou WebClient)
  - Deserialização da resposta JSON
  - Validação: campos obrigatórios, gabarito válido, 4 alternativas, sem duplicatas
  - Tratamento de timeout e resposta malformada (sem persistir dados parciais — RN-06)
  - Endpoint: `POST /api/v1/provas/{id}/gerar-questoes` (gera e vincula à prova)
  - Ou: gerar no momento da criação da prova (decisão de UX)
  - Configuração de timeout (15 segundos máximo)
  - Testes com mock de resposta LLM
  - Documentação
- **Dependências:** C-03 (Provas precisa existir), decisão de provedor LLM
- **Prioridade:** Alta
- **Complexidade:** Alta
- **Critério de aceite:** Questões geradas, validadas e persistidas; falha na LLM não persiste dados; timeout tratado
- **Prazo:** 01/05–10/05

---

#### C-05: Módulo Flashcards — Entidades e CRUD

- **ID:** C-05
- **Objetivo:** Implementar entidades ColecaoFlashcards e Flashcard com CRUD
- **Descrição:** Coleção vinculada a professor e turma. Flashcards vinculados a coleção. Status: rascunho/publicada. CRUD individual de cards
- **Entradas:** Modelagem do README (seção 06), RF-17 a RF-24, RN-04/07/08/09
- **Saídas:** API funcional em `/api/v1/colecoes`
- **Subtasks:**
  - Criar entidade `ColecaoFlashcards` (titulo, descricao, qntFlashcards, status, idProfessor, idTurma)
  - Criar entidade `Flashcard` (textoFrente, textoVerso, ordem, idColecao)
  - Criar repositories
  - Criar DTOs
  - Criar `FlashcardService`:
    - Criar coleção (status = rascunho)
    - Listar coleções do professor
    - Detalhar coleção com flashcards
    - Editar coleção
    - Adicionar flashcard manual (RF-19)
    - Editar flashcard (RF-20)
    - Remover flashcard individual (RF-21)
    - Publicar coleção (RF-22)
    - Despublicar coleção
    - Excluir coleção (RF-24)
  - Validar: frente e verso obrigatórios (RN-09); apenas professor criador pode modificar (RN-07)
  - Testes de integração
  - Documentação
- **Dependências:** Nenhuma direta
- **Prioridade:** Alta
- **Complexidade:** Média-Alta
- **Critério de aceite:** CRUD completo; publicação funcional; regras de negócio validadas
- **Prazo:** 01/05–12/05

---

#### C-06: Integração LLM — Geração de flashcards

- **ID:** C-06
- **Objetivo:** Implementar geração automática de flashcards via LLM
- **Descrição:** Reutilizar `LlmIntegrationService` com prompt específico para flashcards. Validar resposta e persistir em cascata
- **Entradas:** Fluxo do README seção 08.1, contratos JSON
- **Saídas:** Endpoint que gera flashcards via IA
- **Subtasks:**
  - Montar prompt parametrizado para flashcards
  - Validação: frente e verso preenchidos, quantidade correta, sem duplicatas
  - Endpoint: `POST /api/v1/colecoes/{id}/gerar-flashcards`
  - Tratamento de falha sem persistir dados parciais
  - Testes com mock de resposta LLM
  - Documentação
- **Dependências:** C-04 (LlmIntegrationService já existe), C-05 (Flashcards)
- **Prioridade:** Alta
- **Complexidade:** Média (reutiliza infra de C-04)
- **Critério de aceite:** Flashcards gerados, validados e persistidos
- **Prazo:** 10/05–15/05

---

#### C-07: Área do aluno — Endpoints de consumo

- **ID:** C-07
- **Objetivo:** Implementar endpoints para o aluno consumir provas e flashcards publicados
- **Descrição:** Listar provas publicadas para as turmas do aluno. Submeter respostas de prova. Consultar gabarito. Listar coleções publicadas para as turmas do aluno. Listar flashcards de uma coleção
- **Entradas:** RF-16, RF-23, RN-04
- **Saídas:** APIs para consumo do aluno
- **Subtasks:**
  - `GET /api/v1/aluno/provas` — provas publicadas das turmas do aluno
  - `GET /api/v1/aluno/provas/{id}` — detalhe da prova com questões (sem gabarito)
  - `POST /api/v1/aluno/provas/{id}/responder` — submissão de respostas
  - `GET /api/v1/aluno/provas/{id}/resultado` — gabarito e acertos
  - `GET /api/v1/aluno/colecoes` — coleções publicadas das turmas do aluno
  - `GET /api/v1/aluno/colecoes/{id}/flashcards` — cards da coleção
  - Autorização: apenas ROLE_ALUNO matriculado nas turmas vinculadas
  - **Hipótese:** modelo de resposta do aluno (entidade RespostaProva) pode ser necessário para persistir resultados
  - Testes de integração
  - Documentação
- **Dependências:** C-01 (Aluno), C-02 (matrícula), C-03 (Provas), C-05 (Flashcards)
- **Prioridade:** Média-Alta
- **Complexidade:** Média-Alta
- **Critério de aceite:** Aluno acessa apenas provas/flashcards das suas turmas; submissão funcional; gabarito disponível após submissão
- **Prazo:** 15/05–25/05

---

#### C-08: Testes automatizados expandidos

- **ID:** C-08
- **Objetivo:** Expandir cobertura de testes para todos os módulos
- **Descrição:** Testes de integração para Aluno, Provas, Flashcards, matrícula. Testes unitários para validações de negócio e integração LLM (com mock)
- **Entradas:** Módulos implementados
- **Saídas:** Suite de testes completa e verde
- **Subtasks:**
  - Testes de integração: AlunoController
  - Testes de integração: matrícula aluno-turma
  - Testes de integração: ProvaController (CRUD + publicação + geração)
  - Testes de integração: FlashcardController (CRUD + publicação + geração)
  - Testes de integração: endpoints do aluno (consumo)
  - Testes unitários: validação de resposta LLM
  - Testes unitários: regras de negócio (RN-02 a RN-10)
- **Dependências:** C-01 a C-07
- **Prioridade:** Média
- **Complexidade:** Média
- **Critério de aceite:** Cobertura dos fluxos principais com testes passando
- **Prazo:** Maio–Junho (progressivo)

---

#### C-09: CI/CD com GitHub Actions

- **ID:** C-09
- **Objetivo:** Configurar pipeline de integração contínua
- **Descrição:** GitHub Actions workflow que executa build + testes em cada push/PR
- **Entradas:** Suite de testes existente
- **Saídas:** `.github/workflows/ci.yml` funcional
- **Subtasks:**
  - Workflow de CI: checkout → setup Java 21 → Maven build → testes
  - Cache de dependências Maven
  - Status check obrigatório em PRs
  - **Sugestão:** adicionar lint/format check
- **Dependências:** Testes devem estar estáveis
- **Prioridade:** Média
- **Complexidade:** Baixa
- **Critério de aceite:** Build e testes rodam automaticamente em cada PR
- **Prazo:** Início de maio

---

#### C-10: Infraestrutura de deploy

- **ID:** C-10
- **Objetivo:** Preparar aplicação para deploy em produção
- **Descrição:** Dockerfile do backend, docker-compose de produção, configuração do Render, profile de produção
- **Entradas:** docker-compose.yml existente (apenas PostgreSQL)
- **Saídas:** Aplicação deployável no Render
- **Subtasks:**
  - Criar Dockerfile multi-stage para backend (build + runtime)
  - Criar profile `application-prod.yml` (sem show-sql, ddl-auto:validate, secrets via env vars)
  - Configurar docker-compose de produção (app + banco)
  - Configurar serviço no Render (ou alternativa)
  - Deploy do frontend (build estático no Render/Vercel/Netlify)
  - Configurar variáveis de ambiente (DB, JWT secret, LLM API key)
  - Configurar HTTPS
  - **Sugestão:** considerar migrations formais (Flyway) em vez de ddl-auto:update para produção
- **Dependências:** Backend funcional completo
- **Prioridade:** Média
- **Complexidade:** Média
- **Critério de aceite:** Aplicação acessível via URL pública com HTTPS
- **Prazo:** Junho de 2026

---

## 10. Frontend mínimo necessário até 15/04/2026

### 10.1 Escopo mínimo de telas

| Tela | Estado | Integração |
|------|--------|-----------|
| Login | Funcional | API real |
| Cadastro de professor | Funcional | API real |
| Dashboard do professor | Visual | Mockado |
| Listagem de turmas | Funcional | API real |
| Criação de turma | Funcional | API real |
| Listagem de provas | Visual | Mockado |
| Criação de prova (configuração) | Visual | Mockado |
| Revisão de questões | Visual | Mockado |
| Listagem de flashcards | Visual | Mockado |
| Dashboard do aluno | Visual | Mockado |
| Estudo de flashcards (card flip) | Visual | Mockado |

### 10.2 Escopo mínimo de navegação

- Login → Cadastro (ida e volta)
- Login → Dashboard professor / Dashboard aluno (por perfil)
- Dashboard professor → Turmas, Provas, Flashcards, Perfil
- Dashboard aluno → Provas disponíveis, Flashcards disponíveis
- Sidebar/menu funcional em todas as telas autenticadas

### 10.3 Escopo mínimo de autenticação

- Login com email + senha (API real)
- Cadastro de professor (API real)
- Armazenamento de tokens (localStorage)
- Contexto de usuário com dados do JWT
- Proteção de rotas (redireciona para login se não autenticado)
- Logout funcional
- **Pode ficar de fora do MVP:** refresh automático (nice-to-have, mas se expirar o token o usuário reloga)

### 10.4 Escopo mínimo de professor

- Ver dashboard com dados mockados
- Criar, listar, editar turmas (API real)
- Ver listagem de provas (mockada)
- Ver listagem de flashcards (mockada)
- Visualizar fluxo de criação de prova (mockado)

### 10.5 Escopo mínimo de aluno

- Login (pode usar mesmo endpoint `/api/v1/auth/login` com role ALUNO)
- Dashboard com provas e flashcards mockados
- Card flip de flashcard (mockado)
- **Hipótese:** cadastro de aluno depende do módulo Aluno no backend; pode ficar mockado no MVP

### 10.6 O que pode ficar mockado

- Todos os dados de provas (listagem, questões, alternativas)
- Todos os dados de flashcards (coleções, cards)
- Dashboard do professor (métricas de resumo)
- Dashboard do aluno (conteúdo disponível)
- Cadastro de aluno (se backend não tiver pronto)
- Resultado de prova
- Geração via IA (simular delay + resposta fixa)

### 10.7 O que precisa estar integrado de verdade

- Login (POST /api/v1/auth/login)
- Cadastro de professor (POST /api/v1/professor)
- Listagem de turmas (GET /api/v1/turmas)
- Criação de turma (POST /api/v1/turmas)
- Edição de turma (PUT /api/v1/turmas/{id})
- Proteção de rotas (token no header)

### 10.8 O que pode ficar de fora do MVP

- Edição de perfil do professor
- Cadastro de aluno (se backend não estiver pronto)
- Recuperação de senha
- Refresh automático de token
- Paginação e filtros em listagens
- Responsividade completa (foco em desktop primeiro)
- Detalhe da turma (alunos vinculados)
- Tela de resultado de prova
- Qualquer funcionalidade de admin

---

## 11. Matriz de mocks vs integrações reais

| Fluxo / Tela | Pode iniciar mockado? | Integração real quando? | Dependência backend | Risco | Observação |
|---------------|----------------------|------------------------|--------------------|----|------------|
| Login | Não — integrar direto | Desde o dia 1 | Auth já implementado | Baixo | Contrato estável |
| Cadastro professor | Não — integrar direto | Desde o dia 1 | Professor já implementado | Baixo | Contrato estável |
| Cadastro aluno | Sim | Quando C-01 estiver pronto (~16/04) | C-01 (Aluno) | Baixo | Mock simples |
| Listagem de turmas | Não — integrar direto | Desde o dia 1 | Turma já implementado | Baixo | Contrato estável |
| CRUD turmas | Não — integrar direto | Desde o dia 1 | Turma já implementado | Baixo | — |
| Dashboard professor | Sim (métricas) | Maio (quando provas/flashcards existirem) | C-03, C-05 | Baixo | Dados de contagem |
| Listagem provas | Sim | Final de abril (C-03 pronto) | C-03 (Provas) | Médio | Formato de response a definir |
| Criação prova | Sim | Final de abril | C-03 | Médio | — |
| Geração questões IA | Sim (delay + mock JSON) | Maio (C-04 pronto) | C-04 (LLM) | Alto | Depende de provedor LLM |
| Revisão de questões | Sim | Final de abril / maio | C-03 | Baixo | Edição local independente |
| Publicação prova | Sim | Final de abril | C-03 | Baixo | PATCH de status |
| Listagem flashcards | Sim | Maio (C-05 pronto) | C-05 | Médio | — |
| Criação flashcards | Sim | Maio | C-05 | Médio | — |
| Geração flashcards IA | Sim (delay + mock JSON) | Maio (C-06 pronto) | C-06 (LLM) | Alto | Depende de provedor LLM |
| Dashboard aluno | Sim | Maio (C-07 pronto) | C-07 | Médio | — |
| Realização prova | Sim | Maio | C-07 | Médio | Precisa de modelo de resposta |
| Estudo flashcards | Sim (card flip é puro frontend) | Maio | C-07 | Baixo | Card flip independe de API |

---

## 12. Backlog técnico detalhado por módulo

### 12.1 Autenticação e Autorização

- **Objetivo:** Garantir acesso seguro e diferenciado por perfil
- **Escopo funcional:** Login, cadastro, refresh, proteção de rotas, roles
- **Status:** Implementado (base funcional completa)

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| Resolver alunoId no AuthService | Buscar perfil Aluno por userId; preencher claim | Alta | Junto com C-01 |
| Definir política de criação de professor | Decidir se POST /professor fica público ou exige auth | Média | Abril |
| Implementar revogação de refresh token | Blacklist ou versionamento de sessão | Baixa | Junho |

### 12.2 Professor

- **Objetivo:** Gerenciar perfil e operações do professor
- **Escopo funcional:** CRUD completo
- **Status:** Implementado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| Adicionar filtro por nome/disciplina na listagem | Query param + JPQL/Specification | Baixa | Maio |
| Adicionar paginação na listagem | Pageable + PageResponse | Baixa | Maio |

### 12.3 Aluno

- **Objetivo:** Gerenciar perfil do aluno, análogo ao professor
- **Escopo funcional:** CRUD + matrícula em turma + consumo de conteúdo
- **Status:** Não iniciado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| C-01: Entidade e CRUD | Ver detalhamento na seção 9.3 | Alta | 09/04–16/04 |
| C-02: Vínculo aluno-turma | Ver detalhamento na seção 9.3 | Alta | 16/04–21/04 |

### 12.4 Turma

- **Objetivo:** Gerenciar turmas e vínculos
- **Escopo funcional:** CRUD + vínculo professor + vínculo aluno
- **Status:** CRUD + vínculo professor implementado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| Vínculo aluno-turma | Coberto em C-02 | Alta | 16/04–21/04 |
| Filtros e paginação | Query params, Specification | Baixa | Maio |
| Listagem de provas por turma | Endpoint em TurmaController ou ProvaController | Média | Após C-03 |
| Listagem de flashcards por turma | Endpoint em TurmaController ou FlashcardController | Média | Após C-05 |

### 12.5 Provas e Questões

- **Objetivo:** Ciclo completo de avaliações com geração via IA
- **Escopo funcional:** CRUD de prova com questões e alternativas, geração IA, publicação, consumo pelo aluno
- **Status:** Não iniciado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| C-03: Entidades e CRUD | Ver detalhamento na seção 9.3 | Alta | 18/04–30/04 |
| C-04: Geração via LLM | Ver detalhamento na seção 9.3 | Alta | 01/05–10/05 |
| Consumo pelo aluno | Coberto em C-07 | Média-Alta | 15/05–25/05 |

### 12.6 Flashcards

- **Objetivo:** Ciclo completo de coleções de flashcards com geração via IA
- **Escopo funcional:** CRUD de coleção com cards, geração IA, publicação, estudo pelo aluno
- **Status:** Não iniciado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| C-05: Entidades e CRUD | Ver detalhamento na seção 9.3 | Alta | 01/05–12/05 |
| C-06: Geração via LLM | Ver detalhamento na seção 9.3 | Alta | 10/05–15/05 |
| Estudo pelo aluno | Coberto em C-07 | Média-Alta | 15/05–25/05 |

### 12.7 Integração LLM

- **Objetivo:** Encapsular comunicação com API de IA
- **Escopo funcional:** Montar prompt, chamar API, validar resposta, tratar falhas
- **Status:** Não iniciado

| Task | Subtasks | Prioridade | Prazo |
|------|----------|------------|-------|
| Escolher provedor LLM | Avaliar custo, qualidade, API key, limites | Alta | Até 25/04 |
| Criar LlmIntegrationService | Coberto em C-04 | Alta | Maio |
| Configuração externalizável | API key, URL, timeout em application.yml | Alta | Junto com C-04 |
| Fallback e retry | Retry com backoff, fallback para criação manual | Média | Maio |

---

## 13. Requisitos transversais

| Requisito | Por que importa | Quando entra | Como tratar |
|-----------|----------------|-------------|-------------|
| **Segurança (JWT, HTTPS, bcrypt)** | RNF-03; dados sensíveis de professores e alunos | Já implementado parcialmente | Manter padrão atual; adicionar HTTPS no deploy |
| **Autorização por perfil** | RF-02; professor e aluno têm acessos diferentes | Já implementado no backend; frontend MVP precisa de proteção de rotas | Backend: manter SecurityConfig. Frontend: ProtectedRoute por role |
| **Validações de entrada** | Integridade de dados; UX de formulários | Backend: já implementado. Frontend: MVP | Backend: Bean Validation. Frontend: validação de formulário |
| **Tratamento de exceções** | UX; sem stack traces expostas | Backend: GlobalExceptionHandler já existe | Manter e expandir para novos módulos |
| **Documentação de API (Swagger)** | RNF-06; entrega acadêmica | Já auto-gerado; revisar para entrega final | Adicionar anotações OpenAPI nos novos controllers |
| **Padronização de respostas** | Consistência; facilita parsing no frontend | ApiResponse já implementado | Usar em todos os novos endpoints |
| **Migrations / Banco** | Segurança de schema em produção | Atualmente ddl-auto:update; migrar para Flyway em produção | Introduzir Flyway antes do deploy (junho) |
| **Testes unitários** | Qualidade; regras de negócio isoladas | Atualmente só integração; adicionar unitários para serviços | Progressivo a partir de maio |
| **Testes de integração** | Confiança em fluxos completos | Já existe para Professor e Turma; expandir | Cada novo módulo inclui testes |
| **Logs** | Debugging em produção | Básico configurado (Hibernate SQL) | Adicionar logs de negócio nos services (INFO/WARN) |
| **Qualidade de código** | Manutenibilidade | Sem linter/formatter configurado | **Sugestão:** configurar Checkstyle ou SpotBugs |
| **Responsividade** | RNF-02; mobile a partir de 360px | Frontend MVP foca em desktop; responsividade completa em maio | Tailwind facilita; priorizar desktop primeiro |
| **Acessibilidade mínima** | Inclusão; boa prática | Maio | Labels em formulários, contraste, teclado |
| **Deploy / Ambiente** | RNF-09; entrega final | Junho | Docker + Render |
| **Mocks no frontend** | Desacoplar frontend de backend durante MVP | Abril (MVP) | Criar serviços com interface que abstrai mock vs real; feature flag simples (USE_MOCK=true/false) |

---

## 14. Riscos e pontos de atenção

### 14.1 Riscos de produto

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| LLM gera conteúdo de baixa qualidade pedagógica | Produto perde valor | Média | Prompt engineering cuidadoso; revisão editorial obrigatória; não depender 100% de IA |
| Alunos não entendem interface de flashcard | Baixa adoção | Baixa | Testes de usabilidade com Laura; card flip é padrão conhecido |
| Professor não consegue criar prova em 5 min (RNF-07) | Requisito não funcional falha | Média | Priorizar UX do fluxo de criação; feedback de loading claro |

### 14.2 Riscos técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Hibernate ddl-auto:update corrompe schema em evolução | Perda de dados ou schema inconsistente | Média | Introduzir Flyway antes de produção; backups regulares |
| 3 entidades cascateadas em Provas causam N+1 queries | Performance | Alta | Fetch join ou Entity Graph desde o início |
| Resposta da LLM fora do formato esperado | Geração falha para o professor | Alta | Validação robusta; retry; fallback para criação manual |
| Acoplamento temporal front-back em integração | Bloqueio mútuo | Média | Mocks no frontend; contratos documentados; integração progressiva |

### 14.3 Riscos de prazo

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Frontend MVP não entregue até 15/04 | Demonstração impossível | Média-Alta | Reduzir escopo: focar em login + turmas reais + mocks para o resto |
| Victor sobrecarregado (PM + frontend) | Qualidade cai em ambas frentes | Alta | Delegar implementação de telas para Yuri; Victor foca em arquitetura e integração |
| Design não refinado até 08/04 | Frontend começa sem referência visual | Média | Victor define wireframes mínimos se Laura atrasar |
| Devs backend (Erasmo/Riquelme) demoram para começar | Módulos de Provas e Flashcards atrasam | Média | Victor documenta padrões existentes para onboarding rápido |

### 14.4 Riscos de integração front-back

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Formato de resposta muda sem aviso | Frontend quebra | Média | Contratos documentados em docs/api; comunicação na equipe |
| CORS bloqueia chamadas do frontend | Bloqueio total de integração | Baixa | CORS já configurado; verificar ao subir frontend |
| Diferença de tipos UUID vs string | Erros de parsing | Baixa | Padronizar: backend retorna UUID como string; frontend trata como string |

### 14.5 Riscos ligados à IA/LLM

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Provedor LLM indisponível | Geração impossível | Baixa-Média | Implementar criação manual como alternativa (RF-19); fallback |
| Custo de API LLM excede orçamento | Inviabilidade financeira | Média | Limitar chamadas por conta; usar modelos mais baratos; cache de prompts |
| Latência > 15 segundos (RNF-01) | UX degradada | Média | Timeout configurável; indicador de progresso; possibilidade de cancelar |
| LLM retorna conteúdo ofensivo/incorreto | Risco pedagógico | Baixa | Revisão obrigatória pelo professor antes da publicação |

---

## 15. Dependências e paralelismo

### Atividades que podem ocorrer em paralelo

```
Trilha A (Design)     ════════════╗
                                   ║ Sincronização: design alimenta frontend
Trilha B (Frontend)   ═══╦════════╬══════════════════
                          ║        ║
Trilha C (Backend)    ════╩════════╩══════════════════
```

- **100% paralelas:** Design (A) com Backend (C) — zero dependência
- **Parcialmente paralelas:** Frontend (B) com Design (A) — B pode iniciar scaffold e layout enquanto A finaliza telas
- **Parcialmente paralelas:** Frontend (B) com Backend (C) — B usa mocks onde C não implementou

### Atividades que dependem de outras

| Atividade | Depende de | Tipo |
|-----------|-----------|------|
| B-04 (Login frontend) | B-03 (AuthContext) | Sequencial |
| B-07 (Turmas frontend) | B-04 (Login funcional) | Sequencial |
| C-02 (Aluno-turma) | C-01 (Aluno) | Sequencial |
| C-04 (Geração questões LLM) | C-03 (Provas) | Sequencial |
| C-06 (Geração flashcards LLM) | C-04 (LLM service) + C-05 (Flashcards) | Sequencial |
| C-07 (Área do aluno backend) | C-01, C-02, C-03, C-05 | Sequencial (todas as entidades precisam existir) |
| Integração real provas no frontend | C-03 (backend pronto) | Bloqueante |
| Integração real flashcards no frontend | C-05 (backend pronto) | Bloqueante |
| Deploy produção | Todos os módulos + testes | Bloqueante |

### Gargalos previsíveis

1. **Victor como gargalo:** PM + dev frontend + integração. Mitigação: Yuri assume implementação de telas; Victor foca em arquitetura, integração e decisões
2. **C-07 (Área do aluno):** depende de tudo. Mitigação: começar cedo com os módulos base
3. **Escolha de provedor LLM:** bloqueia C-04 e C-06. Mitigação: decidir até 25/04

### Pontos de sincronização

| Data | Sincronização |
|------|--------------|
| 08/04 | Design → Frontend: telas prontas para implementação |
| 15/04 | Frontend MVP: demonstrável |
| ~21/04 | Backend Aluno pronto → Frontend pode integrar cadastro de aluno |
| ~30/04 | Backend Provas pronto → Frontend pode integrar provas |
| ~15/05 | Backend Flashcards + LLM prontos → Frontend pode integrar tudo |
| Junho | Tudo integrado → Deploy |

---

## 16. Sugestão de estrutura no ClickUp

### Space
- **Ilumina**

### Folders

| Folder | Descrição |
|--------|-----------|
| Design / UX | Trilha A — todos os entregáveis de design |
| Frontend | Trilha B — scaffold, telas, componentes, integração |
| Backend | Trilha C — módulos, segurança, testes |
| Infraestrutura | CI/CD, Docker, Deploy |
| Documentação | API docs, entrega acadêmica |
| QA / Testes | Testes automatizados, testes manuais |

### Lists (dentro de cada Folder)

**Design / UX:**
- Refinamento de telas
- Design system

**Frontend:**
- Setup e arquitetura
- Autenticação
- Professor — telas
- Aluno — telas
- Componentes compartilhados
- Integração com backend

**Backend:**
- Aluno
- Provas e questões
- Flashcards
- Integração LLM
- Área do aluno (consumo)
- Evolução (filtros, paginação, segurança)

**Infraestrutura:**
- CI/CD
- Docker
- Deploy

### Tags sugeridas

| Tag | Uso |
|-----|-----|
| `mvp-abril` | Tudo que entra no MVP de 15/04 |
| `pós-mvp` | Itens de maio |
| `produção` | Itens de junho |
| `mockado` | Funcionalidade inicialmente com mock |
| `integração` | Task de integração front-back |
| `llm` | Tasks envolvendo IA |
| `bloqueante` | Task que bloqueia outras |

### Campos personalizados

| Campo | Tipo | Uso |
|-------|------|-----|
| Trilha | Dropdown (A/B/C) | Identificar trilha de execução |
| Horizonte | Dropdown (Urgente/Importante/Futuro) | Horizonte temporal |
| Complexidade | Dropdown (Baixa/Média/Alta) | Esforço estimado |
| Integração | Checkbox | Se envolve integração front-back |
| Mock → Real | Data | Quando o mock deve virar integração |

### Status

`Backlog → A fazer → Em progresso → Revisão → Concluído → Cancelado`

### Dependências

Usar dependências nativas do ClickUp (blocking/waiting) para as relações mapeadas na seção 15.

---

## 17. Sequência recomendada de criação das tasks no ClickUp

1. **Criar o Space "Ilumina"** com os Folders e Lists conforme seção 16

2. **Criar os épicos / marcos:**
   - MVP Design (até 08/04)
   - MVP Frontend (até 15/04)
   - Backend Aluno + Turmas (abril)
   - Backend Provas (abril-maio)
   - Backend Flashcards (maio)
   - Integração LLM (maio)
   - Integração Frontend (maio)
   - Hardening + Deploy (junho)

3. **Criar as tasks por trilha** (usar IDs deste documento: A-01 a A-05, B-01 a B-11, C-01 a C-10):
   - Cada task com título, descrição, prioridade, complexidade e prazo
   - Marcar com tags `mvp-abril`, `pós-mvp` ou `produção`

4. **Criar subtasks** dentro de cada task conforme detalhamento deste documento

5. **Configurar dependências:**
   - B-04 blocked by B-03
   - C-02 blocked by C-01
   - C-04 blocked by C-03
   - C-06 blocked by C-04 + C-05
   - C-07 blocked by C-01, C-02, C-03, C-05

6. **Atribuir responsáveis:**
   - Trilha A: Laura (designer)
   - Trilha B: Victor + Yuri
   - Trilha C: Erasmo + Riquelme (com onboarding de Victor)

7. **Configurar datas e milestones** conforme roadmap da seção 8

---

## 18. Lacunas documentais e hipóteses assumidas

### Lacunas documentais

| Lacuna | Impacto | Ação recomendada |
|--------|---------|-----------------|
| Não há artefatos de design no repositório | Não é possível avaliar o "design bruto existente" | Confirmar com Laura/Victor onde o design está e qual é o estado real |
| Provedor de LLM não definido | Bloqueia planejamento detalhado da integração | Decisão necessária até 25/04 |
| Framework frontend não confirmado formalmente | README menciona React e Angular | **Hipótese assumida:** React (mais mencionado, equipe parece preferir) |
| Papel do admin no sistema não está claro | Quem cria admins? Há tela de admin? | **Hipótese:** admin é criado diretamente no banco; sem tela de admin no MVP |
| Modelo de resposta do aluno (RespostaProva) | Necessário para persistir resultados de prova do aluno | **Dependente de validação:** definir se é entidade nova ou se resultado fica apenas no frontend |
| Recuperação de senha | RF-04 com prioridade média | **Hipótese:** fora do MVP de abril; depende de serviço de e-mail |
| Ownership de turma (quem criou) | Feature doc diz "fora de escopo" | **Hipótese:** qualquer professor vinculado pode operar; não há "dono" de turma |
| Política final de criação de professor | Doc registra como divergência operacional | **Dependente de validação:** manter público para onboarding simplificado ou restringir |

### Hipóteses assumidas

1. O frontend será React + TypeScript + Vite (não Angular)
2. O design bruto existe no Figma e está acessível à equipe de frontend
3. Os devs backend (Erasmo, Riquelme) terão acesso ao repositório e estarão disponíveis a partir de meados de abril
4. O Hibernate ddl-auto:update é aceitável durante desenvolvimento; Flyway será introduzido para produção
5. O provedor LLM será uma API HTTP com entrada de texto e saída JSON
6. Admin é um role técnico, sem interface dedicada no MVP
7. O modelo de dados do README (seção 06) é a fonte de verdade para entidades ainda não implementadas

---

## 19. Conclusão executiva

### Caminho recomendado

O projeto Ilumina tem uma base backend sólida e bem documentada, mas enfrenta um **déficit crítico de frontend** com um prazo apertado. A estratégia de 3 trilhas paralelas com desacoplamento via mocks é a abordagem mais viável para entregar valor em todas as frentes sem bloqueios mútuos.

### Foco da próxima semana (05/04–12/04)

1. **Laura:** fechar design no Figma (telas de auth, layout, professor, aluno)
2. **Victor + Yuri:** scaffold React, layout base, roteamento, serviço de API, telas de login e cadastro integradas
3. **Erasmo/Riquelme:** iniciar módulo Aluno no backend (seguir padrão do Professor)

### Foco até 15/04/2026

- Frontend MVP demonstrável: login real, turmas reais, provas e flashcards mockados
- Backend com módulo Aluno funcional
- Design refinado servindo de referência para todas as telas

### Foco até junho de 2026

- Backend completo: Aluno, Provas, Flashcards, LLM, área do aluno
- Frontend totalmente integrado com APIs reais
- Testes automatizados cobrindo todos os fluxos
- CI/CD configurado
- Deploy em produção no Render
- Documentação final entregue

---

*Documento gerado em 05/04/2026 com base na análise completa da documentação do projeto Ilumina.*  
*Pronto para conversão em tarefas no ClickUp.*
