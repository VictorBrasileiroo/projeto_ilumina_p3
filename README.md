# Ilumina — Documentação Técnica de Projeto

<img src='https://raw.githubusercontent.com/VictorBrasileiroo/projeto_ilumina_p3/refs/heads/develop/frontend/src/imports/banner.png'></img>

Plataforma web de apoio pedagógico para criação e gestão de avaliações e coleções de flashcards com geração automática de conteúdo via inteligência artificial (LLM).

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

## 1. Apresentação do projeto

O **Ilumina** é uma plataforma web de apoio pedagógico que automatiza a elaboração de avaliações e coleções de flashcards por meio de modelos de linguagem de grande escala (LLMs). O sistema centraliza o gerenciamento de professores, turmas e alunos, reduzindo o esforço manual na criação de material avaliativo e de revisão, e permitindo que o professor dedique mais tempo à prática pedagógica.

A criação manual de questões e fichas de revisão é uma das tarefas mais recorrentes e trabalhosas da rotina docente. Professores precisam elaborar avaliações alinhadas ao conteúdo programático, gerenciar múltiplas turmas e ainda produzir material de apoio para os alunos — atividades que consomem tempo que poderia ser direcionado ao ensino.

O Ilumina resolve esse problema fornecendo uma interface estruturada em que o professor informa o tema e a quantidade de itens desejados, e o sistema aciona automaticamente uma API de IA para gerar questões de múltipla escolha com gabarito ou pares frente/verso de flashcards. O conteúdo gerado pode ser revisado, editado e publicado para os alunos das turmas cadastradas.

### 1.1 Módulos do produto

| Módulo | Descrição | Fase |
|---|---|---|
| Gestão de avaliações | Criação, revisão e publicação de provas com questões geradas via LLM. | Fase 1 |
| Turmas e alunos | Cadastro e organização de alunos e turmas por nível de ensino. | Fase 1 |
| Flashcards | Coleções de flashcards geradas pela IA para revisão assíncrona por turma. | Fase 1 |
| Desempenho | Dashboard analítico com métricas por prova, questão, aluno e período. | Fase 2 |

---

## 2. Objetivos

### Objetivo geral

Desenvolver uma plataforma web que automatize a geração de questões avaliativas e coleções de flashcards a partir de inteligência artificial, centralizando o gerenciamento de turmas, alunos e professores em um único ambiente pedagógico.

### Objetivos específicos

1. Implementar geração automática de questões de múltipla escolha com gabarito via API de LLM.
2. Implementar geração e gerenciamento de coleções de flashcards frente/verso via API de LLM.
3. Oferecer ao professor controle editorial completo sobre o conteúdo gerado pela IA antes da publicação.
4. Estruturar gerenciamento de professores, alunos e turmas com relacionamentos configuráveis.
5. Disponibilizar aos alunos as avaliações e coleções de flashcards publicadas por seus professores.
6. Garantir autenticação segura com controle de acesso diferenciado por perfil.
7. Preparar a infraestrutura para expansão com módulo de desempenho na Fase 2.

---

## 3. 5W1H do projeto

| Dimensão | Resposta |
|---|---|
| **What** — O que é? | Plataforma web pedagógica que automatiza a criação de provas e coleções de flashcards via IA, centralizando professores, turmas e alunos. |
| **Who** — Para quem? | Professores que buscam agilidade na elaboração de material avaliativo e de revisão, e alunos que consomem esse conteúdo. |
| **Where** — Onde? | Ambiente escolar e universitário. Acesso via navegador em qualquer dispositivo. Hospedagem em Vercel (frontend) e Render (backend). |
| **When** — Quando? | No cotidiano escolar: criação de provas/flashcards antes das avaliações, aplicação durante o período letivo, revisão após a correção. |
| **Why** — Por quê? | A elaboração manual de questões e material de revisão consome tempo pedagógico valioso. A IA gera conteúdo em segundos, com qualidade revisável. |
| **How** — Como? | O professor informa tema e quantidade. O sistema aciona a API LLM, recebe JSON estruturado, valida os dados e persiste no banco em cascata. |

---

## 4. Stakeholders

| Stakeholder | Papel | Interesse |
|---|---|---|
| **Professor** (usuário principal) | Criador e publicador de conteúdo pedagógico. Gerencia turmas, cria provas e coleções de flashcards, acompanha desempenho dos alunos. | Reduzir tempo de elaboração de avaliações, manter controle editorial sobre o conteúdo gerado pela IA, organizar turmas e acompanhar o aprendizado de forma centralizada. |
| **Aluno** (usuário final) | Consumidor das avaliações e coleções publicadas. Realiza provas e usa flashcards como recurso de revisão. | Acessar provas e flashcards de forma simples e responsiva, consultar resultados e dispor de material de revisão estruturado. |
| **Desenvolvedores** (equipe técnica) | Construção, manutenção e evolução da plataforma (frontend, backend, banco e integração com a API LLM). | Manter arquitetura limpa e escalável, garantir integração estável com a API LLM, entregar funcionalidades com qualidade dentro do escopo e cronograma. |

---

## 5. Requisitos do projeto

### 5.1 Requisitos funcionais

#### Autenticação e acesso

| ID | Nome | Descrição | Prioridade |
|---|---|---|---|
| RF-01 | Autenticação por e-mail | Login de professores e alunos com e-mail e senha cadastrados. | Alta |
| RF-02 | Controle de acesso por perfil | Diferenciar permissões entre Professor e Aluno, redirecionando cada um após o login. | Alta |
| RF-03 | Cadastro de usuário | Cadastro de novos professores e alunos com dados básicos. | Alta |
| RF-04 | Recuperação de senha | Fluxo de recuperação de senha via e-mail cadastrado. | Média |

#### Gerenciamento de professores e alunos

| ID | Nome | Descrição | Prioridade |
|---|---|---|---|
| RF-05 | Edição de perfil | Editar dados pessoais (nome, e-mail, disciplina/turma, senha). | Média |
| RF-06 | Listagem de professores | Exibir professores cadastrados com filtros por nome e disciplina. | Baixa |
| RF-07 | Listagem de alunos | O professor visualiza alunos vinculados às suas turmas. | Média |

#### Gerenciamento de turmas

| ID | Nome | Descrição | Prioridade |
|---|---|---|---|
| RF-08 | Cadastro de turma | Criação informando ano, turno, nível de ensino e quantidade de alunos. | Alta |
| RF-09 | Edição/exclusão de turma | Editar ou excluir turma, desde que sem provas publicadas vinculadas. | Média |
| RF-10 | Vínculo professor-turma | Relação N:N entre professores e turmas. | Alta |
| RF-11 | Matrícula de aluno em turma | Relação N:N entre alunos e turmas. | Alta |

#### Avaliações e questões

| ID | Nome | Descrição | Prioridade |
|---|---|---|---|
| RF-12 | Criação de prova | Título, quantidade de questões, disciplina e turma destino. | Alta |
| RF-13 | Geração de questões via IA | Geração automática via API LLM informando tema e quantidade. | Alta |
| RF-14 | Revisão editorial de questões | Edição de enunciado, alternativas e gabarito antes da publicação. | Alta |
| RF-15 | Publicação de prova | Mudar status de "rascunho" para "publicada" para a turma vinculada. | Alta |
| RF-16 | Realização de prova pelo aluno | Aluno visualiza e responde provas publicadas para suas turmas. | Alta |

#### Coleções de flashcards

| ID | Nome | Descrição | Prioridade |
|---|---|---|---|
| RF-17 | Criação de coleção | Título, tema, quantidade e turma destino. | Alta |
| RF-18 | Geração de flashcards via IA | Geração automática via API LLM informando tema e quantidade. | Alta |
| RF-19 | Cadastro manual de flashcard | Adicionar flashcard manualmente informando frente e verso. | Alta |
| RF-20 | Edição de flashcard | Editar texto da frente e verso de qualquer card. | Alta |
| RF-21 | Remoção de flashcard | Remover cards individuais sem excluir a coleção inteira. | Média |
| RF-22 | Publicação de coleção | Tornar coleção visível para alunos da turma vinculada. | Alta |
| RF-23 | Estudo de flashcards pelo aluno | Aluno acessa coleções publicadas e estuda no formato frente/verso. | Alta |
| RF-24 | Exclusão de coleção | Excluir coleção e todos os cards associados. | Média |

### 5.2 Requisitos não funcionais

| ID | Categoria | Descrição | Prioridade |
|---|---|---|---|
| RNF-01 | Desempenho | Respostas de interface < 2s. Geração via LLM pode levar até 15s, com indicação de progresso. | Alta |
| RNF-02 | Responsividade | Interface funcional em desktop, tablet e mobile (a partir de 360px). | Alta |
| RNF-03 | Segurança | Senhas com bcrypt, comunicação via HTTPS, JWT para autenticação stateless. | Alta |
| RNF-04 | Disponibilidade | Mínimo 95% no horário escolar (07h–22h). | Média |
| RNF-05 | Escalabilidade | Suporte a múltiplas turmas e usuários simultâneos. | Média |
| RNF-06 | Manutenibilidade | Arquitetura em camadas. API documentada via Swagger/OpenAPI. | Média |
| RNF-07 | Usabilidade | Professor sem familiaridade técnica deve criar e publicar uma prova em < 5 min. | Alta |
| RNF-08 | Portabilidade | Suporte a Chrome, Firefox, Edge e Safari (versões estáveis recentes). | Média |
| RNF-09 | Conteinerização | Empacotamento em containers Docker para portabilidade entre ambientes. | Média |
| RNF-10 | Resiliência à API externa | Tratamento de erros e fallback em caso de indisponibilidade da LLM. | Alta |

### 5.3 Regras de negócio

| ID | Nome | Descrição |
|---|---|---|
| RN-01 | Unicidade de e-mail | E-mail único no sistema, independente do perfil. |
| RN-02 | Gabarito obrigatório | Toda questão de múltipla escolha deve ter exatamente uma alternativa marcada como gabarito. |
| RN-03 | Prova editável só em rascunho | Prova publicada não pode ter questões editadas; é necessário despublicar antes. |
| RN-04 | Coleção visível só para turma vinculada | Coleção publicada é visível apenas para alunos matriculados na turma. |
| RN-05 | Mínimo de alternativas por questão | Entre 2 e 4 alternativas; LLM é instruída a sempre retornar 4. |
| RN-06 | Validação da resposta LLM | Backend valida JSON da LLM antes de persistir (campos obrigatórios, gabarito válido, sem duplicatas). |
| RN-07 | Proprietário da coleção | Apenas o professor criador pode editar, publicar ou excluir uma coleção. |
| RN-08 | Ordem de exibição | Questões e flashcards exibidos na ordem definida pelo campo `ordem`. |
| RN-09 | Frente e verso obrigatórios | Todo flashcard deve ter `texto_frente` e `texto_verso` preenchidos. |
| RN-10 | Nível de ensino padronizado | Campo `ensino` aceita apenas: `infantil`, `fundamental`, `medio`, `superior`. |

### 5.4 Requisitos por perfil

**Perfil Professor**
- Autenticar-se com e-mail e senha
- Gerenciar turmas e vínculos professor/aluno
- Criar, editar e publicar provas
- Gerar questões e flashcards via IA
- Criar, editar e publicar coleções de flashcards
- Remover questões, flashcards e coleções
- Visualizar alunos das turmas vinculadas

**Perfil Aluno**
- Autenticar-se com e-mail e senha
- Visualizar provas publicadas para suas turmas
- Responder provas dentro da plataforma
- Consultar resultado e gabarito
- Acessar coleções de flashcards publicadas
- Estudar flashcards no formato frente/verso

---

## 6. Modelagem de dados

### 6.1 Usuários

**`professores`** — cadastro de professores

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| materia | VARCHAR(100) | — | Disciplina que leciona |
| sexo | CHAR(1) | — | 'M', 'F' ou 'O' |
| email | VARCHAR(200) | UNIQUE | E-mail de autenticação |
| senha_hash | VARCHAR(255) | NOT NULL | Hash bcrypt |
| data_cadastro | TIMESTAMP | — | Preenchido com NOW() |

**`alunos`** — cadastro de alunos

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| email | VARCHAR(200) | UNIQUE | E-mail de acesso |
| senha_hash | VARCHAR(255) | NOT NULL | Hash bcrypt |
| sexo | CHAR(1) | — | 'M', 'F' ou 'O' |
| data_cadastro | TIMESTAMP | — | Preenchido com NOW() |

### 6.2 Turmas e vínculos

**`turmas`** — grupos de alunos por ano, turno e nível de ensino

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| nome | VARCHAR(60) | NOT NULL | Identificação (ex.: "3.º Ano A") |
| ano | INT | NOT NULL | Ano letivo |
| turno | VARCHAR(20) | — | matutino, vespertino, noturno |
| qnt_alunos | INT | — | Quantidade matriculada |
| ensino | VARCHAR(20) | NOT NULL | infantil, fundamental, medio, superior |

**`prof_turma`** — relacionamento N:N professor ↔ turma

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| id_professor | INT | FK | Referência a `professores.id` |
| id_turma | INT | FK | Referência a `turmas.id` |

**`aluno_turma`** — relacionamento N:N aluno ↔ turma

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| id_aluno | INT | FK | Referência a `alunos.id` |
| id_turma | INT | FK | Referência a `turmas.id` |

### 6.3 Avaliações e questões

**`provas`** — avaliações criadas pelos professores

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| titulo | VARCHAR(255) | NOT NULL | Título |
| descricao | TEXT | — | Descrição/orientações |
| qnt_questoes | INT | — | Total de questões |
| status | VARCHAR(20) | — | rascunho, publicada |
| data_criacao | TIMESTAMP | — | Preenchido com NOW() |
| id_prof | INT | FK | Referência a `professores.id` |
| id_turma | INT | FK | Referência a `turmas.id` |

**`questoes`** — questões vinculadas a cada avaliação

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| enunciado | TEXT | NOT NULL | Texto do enunciado |
| gabarito | CHAR(1) | NOT NULL | A, B, C ou D |
| pontuacao | DECIMAL(5,2) | — | Peso na nota final |
| ordem | INT | — | Posição de exibição |
| id_prova | INT | FK | Referência a `provas.id` |

**`alternativas`** — opções de resposta

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| texto | TEXT | NOT NULL | Texto da alternativa |
| letra | CHAR(1) | NOT NULL | A, B, C ou D |
| id_questao | INT | FK | Referência a `questoes.id` |

### 6.4 Flashcards

**`colecao_flashcards`** — deck criado por um professor para uma turma

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| titulo | VARCHAR(255) | NOT NULL | Título |
| descricao | TEXT | — | Descrição opcional |
| qnt_flashcards | INT | — | Total de cards |
| status | VARCHAR(20) | — | rascunho, publicada |
| data_criacao | TIMESTAMP | — | Preenchido com NOW() |
| id_professor | INT | FK | Referência a `professores.id` |
| id_turma | INT | FK | Referência a `turmas.id` |

**`flashcards`** — cards individuais de revisão frente/verso

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | SERIAL | PK | Chave primária |
| texto_frente | TEXT | NOT NULL | Pergunta ou termo |
| texto_verso | TEXT | NOT NULL | Resposta ou definição |
| ordem | INT | — | Posição de exibição |
| id_colecao | INT | FK | Referência a `colecao_flashcards.id` |

---

## 7. Fluxo de geração via IA

Ambos os fluxos (questões e flashcards) seguem a mesma lógica:
**entrada do professor → prompt → resposta JSON → validação → persistência → publicação**.

### 7.1 Geração de flashcards

1. **Entrada do professor** — título, tema, quantidade (1–50) e turma destino.
2. **Montagem do prompt e chamada à LLM** — backend monta prompt instrucional especificando JSON esperado e idioma (pt-BR).
3. **Validação da resposta** — `flashcards` é array não vazio, cada item tem `frente` e `verso`, quantidade bate com o solicitado, sem duplicatas.
4. **Persistência em cascata** — INSERT em `colecao_flashcards` (status `rascunho`) → captura `id_colecao` → INSERT em `flashcards` preservando `ordem`.
5. **Revisão editorial** — professor edita, reordena, adiciona ou remove cards.
6. **Publicação** — status muda de `rascunho` para `publicada`; alunos da turma passam a ver e estudar.

Modelo do prompt:

```
Você é um assistente pedagógico. Gere {quantidade} flashcards sobre "{tema}"
no formato pergunta/resposta, em português do Brasil.

Retorne SOMENTE um JSON válido, sem texto adicional, markdown ou explicações.

Formato obrigatório:
{
  "flashcards": [
    { "ordem": 1, "frente": "...", "verso": "..." }
  ]
}
```

### 7.2 Geração de questões (provas)

1. **Entrada do professor** — título, tema, quantidade e turma destino.
2. **Montagem do prompt e chamada à LLM** — formato JSON com enunciado, gabarito, pontuação, ordem e alternativas.
3. **Validação da resposta** — gabarito corresponde a uma das letras das alternativas; cada questão tem 4 alternativas; sem duplicatas de enunciado.
4. **Persistência em cascata** — INSERT em `provas` → captura `id_prova` → INSERT em `questoes` → captura `id_questao` → INSERT em `alternativas`.
5. **Revisão e publicação** — professor revisa enunciados, alternativas e gabarito antes de publicar.

Modelo do prompt:

```
Você é um assistente pedagógico. Gere {quantidade} questões de múltipla escolha
sobre "{tema}", em português do Brasil, com 4 alternativas cada.

Retorne SOMENTE um JSON válido, sem texto adicional, markdown ou explicações.

Formato obrigatório:
{
  "questoes": [
    {
      "enunciado": "...",
      "gabarito": "C",
      "pontuacao": 2.5,
      "ordem": 1,
      "alternativas": [
        { "letra": "A", "texto": "..." },
        { "letra": "B", "texto": "..." },
        { "letra": "C", "texto": "..." },
        { "letra": "D", "texto": "..." }
      ]
    }
  ]
}
```

---

## 8. Visão técnica da solução

### 8.1 Camadas do backend

| Camada | Responsabilidade |
|---|---|
| **Controller** | Recebe requisições HTTP, deserializa entrada, delega para o service. Aplica controle de acesso por anotações. Sem lógica de negócio. |
| **Service** | Regras de negócio, validações de consistência, verificação de permissão por perfil, preparação de prompts e processamento de respostas da LLM. |
| **Repository** | Acesso ao banco via Spring Data JPA / Hibernate. Sem regras de negócio. |
| **Integration** | Comunicação com a API LLM. Monta requisição, deserializa resposta, isola erros de rede. |

**Fluxo geral de uma requisição:** cliente → Controller (valida JWT) → Service (regras + decisões) → Repository ou Integration → resposta padronizada de volta.

### 8.2 Estado atual dos módulos

| Módulo | Estado |
|---|---|
| Autenticação/JWT | Concluído e estabilizado |
| Professores | Concluído (CRUD principal) |
| Turmas | Concluído (CRUD principal) |
| Aluno-Turma-Matrículas | Concluído |
| Avaliações (blocos 1–4) | Concluído |
| Flashcards BLOCO 1 (fundação) | Concluído |
| Flashcards BLOCO 2 (API professor/admin) | Concluído |
| Flashcards BLOCO 3 (geração LLM) | Concluído |
| Flashcards BLOCO 4 (consumo aluno) | Pendente |

### 8.3 Resumo do módulo Flashcards

- Coleções em `RASCUNHO` / `PUBLICADA`.
- CRUD completo para professor/admin em `/api/v1/colecoes`.
- Geração via LLM em `POST /api/v1/colecoes/{id}/gerar-flashcards`.
- Validação defensiva de payload LLM antes de persistir.
- Cobertura de erros operacionais: `400`, `403`, `404`, `429`, `503`.

### 8.4 Padrão de erros e validações

- **Validações de entrada** — campos obrigatórios (`400`), unicidade de e-mail, formato/tipo, validação prévia no frontend.
- **Validações de consistência e permissão** — estado do recurso (`409`), propriedade (`403`), acesso por perfil (`403`), autenticação (`401`).
- **Validação da resposta LLM** — estrutura JSON, consistência do conteúdo, quantidade, falha na integração (sem persistência parcial).
- **Comportamento da UI** — envelope `ApiResponse<T>` padronizado, mensagens amigáveis, preservação dos dados em estado de erro, indicador de progresso nas operações com LLM.

---

## 9. Stack e arquitetura

### 9.1 Backend

- Java 21
- Spring Boot 3.5.x
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- PostgreSQL (Neon em produção, perfil de teste com H2)
- Padrão de resposta: `ApiResponse<T>`
- JUnit (testes de unidade e integração)
- Swagger / SpringDoc OpenAPI

### 9.2 Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router 7

### 9.3 Hospedagem (produção)

- **Frontend:** Vercel
- **Backend:** Render (Web Service via Docker)
- **Banco:** Neon (PostgreSQL gerenciado)
- **LLM:** Google Gemini API (`gemini-2.5-flash-lite`)

### 9.4 DevOps e ferramentas

| Categoria | Ferramentas |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind |
| Backend | Java, Spring Boot |
| Banco | PostgreSQL, Hibernate, Spring Data JPA |
| API & Testes | Swagger, SpringDoc OpenAPI, JUnit |
| DevOps & Infra | Docker, GitHub Actions, Render, Vercel, Neon |
| Versionamento | Git, GitHub |
| Design & Prototipagem | Figma, Photoshop, Affinity |
| Gestão & Documentação | Trello, Notion, Miro |

---

## 10. Como executar localmente (desenvolvimento)

> Esta seção é necessária apenas para desenvolvimento local. Para avaliar o sistema, use a aplicação no ar (link na seção "Acesso à aplicação" acima).

### 10.1 Pré-requisitos

- Java 21 (JDK)
- Node.js 18+ e npm
- Docker (para subir Postgres local)
- Arquivo `backend/.env` com credenciais locais e chave da API Gemini

### 10.2 Backend

Na pasta `backend`:

```powershell
docker compose up -d            # sobe Postgres em localhost:5432
.\mvnw.cmd spring-boot:run      # backend em localhost:8080
```

Para testes:

```powershell
.\mvnw.cmd test
```

### 10.3 Frontend

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

## 11. Cronograma do projeto

O projeto tem duração total de 6 meses, organizado em duas fases (AB1 e AB2).

### Fase 1 — AB1 (meses 1–3): levantamento, design e frontend

- Levantamento de requisitos
- Arquitetura e design de software
- Prototipagem e design system (Figma)
- Desenvolvimento frontend com dados mockados
- Módulo de flashcards (geração via IA) integrado ao frontend

### Fase 2 — AB2 (meses 4–6): backend, integração e entrega

- Desenvolvimento backend (Java + Spring Boot)
- Integração real frontend ↔ backend
- Testes automatizados (JUnit)
- Infraestrutura Docker e CI/CD
- Deploy em produção (Render + Vercel + Neon)
- Documentação final da API (Swagger)

---

## 12. Equipe, papéis e atribuições

| Integrante | Papel | Foco |
|---|---|---|
| **Victor André Lopes Brasileiro** | Gerente de Projeto · Dev Frontend | AB1 + AB2 — comunicação com stakeholders, planejamento, condução de reuniões e diagramas, QA, frontend (mock na AB1, integração real na AB2) |
| **Laura Beatriz Lins R. Mainero** | Designer UX/UI | AB1 — interface, pesquisa de usabilidade, wireframes, protótipos, design system, fluxos de navegação |
| **Yuri Raphael M. A. Barbosa** | Desenvolvedor Frontend | AB1 — interface e componentes de UI, dados mockados na AB1 e integração real na AB2, responsividade, consumo de APIs |
| **Erasmo da Silva Sá Júnior** | Desenvolvedor Backend | AB2 — modelagem do banco, serviços e endpoints REST, testes JUnit, deploy e documentação da API |
| **José Riquelme Teixeira da Silva** | Desenvolvedor Backend | AB2 — modelagem do banco, serviços e endpoints REST, testes JUnit, deploy e documentação da API |

---

## 13. Documentação técnica complementar

A documentação detalhada está na pasta `docs`.

Pontos de entrada principais:

- Visão geral: `docs/README.md`
- API Flashcards unificada: `docs/api/2026-04-19-api-modulo-flashcards-unificado.md`
- Feature Flashcards unificada: `docs/features/2026-04-19-feature-modulo-flashcards-unificada.md`
- Arquitetura Flashcards (estado atual): `docs/arquitetura/2026-04-19-estado-atual-do-sistema-modulo-flashcards-geral.md`
- Trilha por etapas Flashcards: `docs/etapas/2026-04-19-11-modulo-flashcards-trilha-unica.md`

---

## 14. Considerações finais

O projeto Ilumina encontra-se em estágio de desenvolvimento ativo, com requisitos levantados, arquitetura definida, frontend integrado ao backend hospedado e os módulos principais da Fase 1 entregues. Os módulos de gerenciamento de turmas, criação de provas e geração de flashcards via IA compõem o escopo da AB1 e estão funcionais em produção.

A Fase 2 (AB2) concentra esforços na consolidação da integração real entre frontend e backend, nos testes automatizados, na infraestrutura de produção e na preparação para os módulos analíticos de desempenho dos alunos. A arquitetura foi planejada para suportar essa expansão sem necessidade de refatoração estrutural.

A dependência da API LLM externa representa o principal risco técnico do projeto. Para mitigá-lo, o sistema implementa tratamento de erros robusto, mensagens de fallback e a possibilidade de inserção manual de questões e flashcards, garantindo continuidade mesmo em caso de indisponibilidade do serviço de IA.