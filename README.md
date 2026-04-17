# Ilumina — Documentação Técnica de Projeto

<img src='https://raw.githubusercontent.com/VictorBrasileiroo/projeto_ilumina_p3/refs/heads/develop/frontend/src/imports/banner.png'></img>

> Plataforma web de apoio pedagógico para criação e gestão de avaliações e coleções de flashcards com geração automática de conteúdo via inteligência artificial.

- **Status:** Em andamento — Mês 4 de 6
- **Fase atual:** Fase 1 — AB1
- **Versão do documento:** 2.0 · 2026

---

## 01. Apresentação do Projeto

O **Ilumina** é uma plataforma web de apoio pedagógico que automatiza a elaboração de avaliações e coleções de flashcards por meio de modelos de linguagem de grande escala (LLMs). O sistema centraliza o gerenciamento de professores, turmas e alunos, reduzindo o esforço manual na criação de material avaliativo e de revisão, e permitindo que o professor dedique mais tempo à prática pedagógica.

A criação manual de questões e de fichas de revisão é uma das tarefas mais recorrentes e trabalhosas da rotina docente. No contexto da educação básica e superior, professores precisam elaborar avaliações alinhadas ao conteúdo programático, gerenciar múltiplas turmas e ainda produzir material de apoio para os alunos — atividades que consomem um tempo que poderia ser direcionado ao ensino.

O Ilumina resolve esse problema ao fornecer uma interface estruturada em que o professor informa o tema e a quantidade de itens desejados, e o sistema aciona automaticamente uma API de inteligência artificial para gerar questões de múltipla escolha com gabarito, ou pares frente/verso de flashcards. O conteúdo gerado pode ser revisado, editado e publicado para os alunos das turmas cadastradas.

### Módulos

| Módulo | Descrição | Fase |
|--------|-----------|------|
| **01 — Gestão de avaliações** | Criação, revisão e publicação de provas com questões geradas via LLM. | Fase 1 |
| **02 — Turmas e alunos** | Cadastro e organização de alunos e turmas por nível de ensino. | Fase 1 |
| **03 — Flashcards** | Coleções de flashcards geradas pela IA para revisão assíncrona por turma. | Fase 1 |
| **04 — Desempenho** | Dashboard analítico com métricas por prova, questão, aluno e período. | Fase 2 |

---

## 02. Objetivos do Projeto

### Objetivo Geral

Desenvolver uma plataforma web que automatize a geração de questões avaliativas e coleções de flashcards a partir de inteligência artificial, centralizando o gerenciamento de turmas, alunos e professores em um único ambiente pedagógico.

### Objetivos Específicos

1. Implementar um módulo de geração automática de questões de múltipla escolha com gabarito via API de LLM.
2. Implementar um módulo de geração e gerenciamento de coleções de flashcards frente/verso via API de LLM.
3. Oferecer ao professor controle editorial completo sobre o conteúdo gerado pela IA antes da publicação.
4. Estruturar um sistema de gerenciamento de professores, alunos e turmas com relacionamentos configuráveis.
5. Disponibilizar aos alunos as avaliações e coleções de flashcards publicadas por seus professores.
6. Garantir autenticação segura com controle de acesso diferenciado por perfil de usuário.
7. Preparar a infraestrutura para expansão com módulo de desempenho e análise pedagógica na Fase 2.

---

## 03. 5W1H do Projeto

| | |
|---|---|
| **What — O que é?** | Plataforma web pedagógica que automatiza a criação de provas e coleções de flashcards via IA, centralizando professores, turmas e alunos. |
| **Who — Para quem?** | Professores que buscam agilidade na elaboração de material avaliativo e de revisão, e alunos que consomem esse conteúdo. |
| **Where — Onde?** | Ambiente escolar e universitário. Acesso via navegador em qualquer dispositivo. Hospedagem na plataforma Render. |
| **When — Quando?** | No cotidiano escolar: criação de provas e flashcards antes das avaliações, aplicação durante o período letivo, revisão com flashcards após a correção. |
| **Why — Por quê?** | A elaboração manual de questões e material de revisão consome tempo pedagógico valioso. A IA gera conteúdo em segundos, com qualidade revisável. |
| **How — Como?** | O professor informa tema e quantidade. O sistema aciona a API LLM, recebe JSON estruturado, valida os dados e persiste no banco em cascata. |

---

## 04. Stakeholders

| Stakeholder | Papel | Interesse |
|-------------|-------|-----------|
| **Professor** | Usuário principal — criador e publicador de conteúdo pedagógico. Gerencia turmas, cria provas e coleções de flashcards. | Reduzir o tempo de elaboração de avaliações, manter controle editorial sobre o conteúdo gerado pela IA, organizar turmas e acompanhar o aprendizado dos alunos de forma centralizada. |
| **Aluno** | Usuário final — consumidor das avaliações e das coleções de flashcards publicadas pelo professor. Realiza provas e utiliza os flashcards como recurso de revisão. | Acessar provas e flashcards de forma simples e responsiva, consultar resultados e dispor de material de revisão estruturado para reforço do aprendizado. |
| **Desenvolvedores** | Equipe técnica — responsáveis pela construção, manutenção e evolução da plataforma, incluindo frontend, backend, banco de dados e integração com a API LLM. | Manter arquitetura limpa e escalável, garantir integração estável com a API LLM, entregar funcionalidades com qualidade dentro do escopo e cronograma definidos. |

---

## 05. Requisitos do Projeto

### Requisitos Funcionais

#### Autenticação e Acesso

| ID | Nome | Descrição | Prioridade |
|----|------|-----------|------------|
| RF-01 | Autenticação por e-mail | O sistema deve permitir que professores e alunos realizem login com e-mail e senha cadastrados. | Alta |
| RF-02 | Controle de acesso por perfil | O sistema deve diferenciar as permissões de acesso entre os perfis Professor e Aluno, redirecionando cada um para sua interface específica após o login. | Alta |
| RF-03 | Cadastro de usuário | O sistema deve permitir o cadastro de novos professores e alunos com nome, e-mail, senha e demais dados básicos do perfil. | Alta |
| RF-04 | Recuperação de senha | O sistema deve oferecer um fluxo de recuperação de senha via e-mail cadastrado. | Média |

#### Gerenciamento de Professores e Alunos

| ID | Nome | Descrição | Prioridade |
|----|------|-----------|------------|
| RF-05 | Edição de perfil | Professores e alunos devem conseguir editar seus dados de perfil (nome, e-mail, disciplina/turma, senha). | Média |
| RF-06 | Listagem de professores | O sistema deve exibir a listagem de professores cadastrados com filtros por nome e disciplina. | Baixa |
| RF-07 | Listagem de alunos | O professor deve conseguir visualizar a lista de alunos vinculados às suas turmas. | Média |

#### Gerenciamento de Turmas

| ID | Nome | Descrição | Prioridade |
|----|------|-----------|------------|
| RF-08 | Cadastro de turma | O professor deve conseguir criar uma turma informando ano, turno, nível de ensino e quantidade de alunos. | Alta |
| RF-09 | Edição e exclusão de turma | O professor deve conseguir editar os dados de uma turma existente ou excluí-la, desde que não haja provas publicadas vinculadas. | Média |
| RF-10 | Vinculação professor-turma | O sistema deve suportar a associação de um professor a múltiplas turmas e de uma turma a múltiplos professores (relação N:N). | Alta |
| RF-11 | Matrícula de aluno em turma | O sistema deve permitir a matrícula de alunos em turmas específicas, com suporte à relação N:N (aluno em múltiplas turmas). | Alta |

#### Avaliações e Questões

| ID | Nome | Descrição | Prioridade |
|----|------|-----------|------------|
| RF-12 | Criação de prova | O professor deve conseguir criar uma prova informando título, quantidade de questões, disciplina e turma destino. | Alta |
| RF-13 | Geração de questões via IA | Ao criar uma prova, o professor deve ter a opção de gerar questões automaticamente via API LLM, informando o tema e a quantidade desejada. | Alta |
| RF-14 | Revisão editorial de questões | O professor deve conseguir visualizar, editar o enunciado, as alternativas e o gabarito de cada questão gerada antes da publicação. | Alta |
| RF-15 | Publicação de prova | O professor deve poder publicar a prova para a turma vinculada, alterando seu status de "rascunho" para "publicada". | Alta |
| RF-16 | Realização de prova pelo aluno | O aluno deve visualizar as provas publicadas para suas turmas e respondê-las dentro da plataforma. | Alta |

#### Coleções de Flashcards

| ID | Nome | Descrição | Prioridade |
|----|------|-----------|------------|
| RF-17 | Criação de coleção | O professor deve conseguir criar uma coleção de flashcards informando título, tema, quantidade de cards e turma destino. | Alta |
| RF-18 | Geração de flashcards via IA | Ao criar uma coleção, o professor deve poder gerar os flashcards automaticamente via API LLM, informando o tema e a quantidade. | Alta |
| RF-19 | Cadastro manual de flashcard | O professor deve poder adicionar flashcards manualmente a uma coleção, informando o texto da frente e do verso. | Alta |
| RF-20 | Edição de flashcard | O professor deve conseguir editar o texto da frente e do verso de qualquer flashcard de uma coleção. | Alta |
| RF-21 | Remoção de flashcard | O professor deve conseguir remover flashcards individuais de uma coleção sem excluir a coleção inteira. | Média |
| RF-22 | Publicação de coleção | O professor deve poder publicar uma coleção de flashcards para a turma vinculada, tornando-a visível aos alunos. | Alta |
| RF-23 | Estudo de flashcards pelo aluno | O aluno deve poder acessar as coleções publicadas para suas turmas e estudar no formato frente/verso, virando cada card individualmente. | Alta |
| RF-24 | Exclusão de coleção | O professor deve poder excluir uma coleção de flashcards, incluindo todos os cards associados. | Média |

---

### Requisitos Não Funcionais

| ID | Categoria | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RNF-01 | Desempenho | O sistema deve responder às requisições de interface em menos de 2 segundos em condições normais de operação. A geração via LLM pode levar até 15 segundos, com indicação de progresso ao usuário. | Alta |
| RNF-02 | Responsividade | A interface deve ser plenamente funcional em dispositivos desktop, tablet e mobile, com suporte a resoluções a partir de 360px de largura. | Alta |
| RNF-03 | Segurança | As senhas devem ser armazenadas com hashing seguro (bcrypt). A comunicação deve ocorrer via HTTPS. Tokens JWT devem ser utilizados para autenticação stateless. | Alta |
| RNF-04 | Disponibilidade | O sistema deve apresentar disponibilidade mínima de 95% em horário de uso escolar (07h–22h). | Média |
| RNF-05 | Escalabilidade | A arquitetura deve suportar o aumento de carga com múltiplas turmas e usuários simultâneos sem degradação significativa de desempenho. | Média |
| RNF-06 | Manutenibilidade | O código deve seguir padrões de arquitetura em camadas (controller, service, repository). A API deve estar documentada via Swagger/OpenAPI. | Média |
| RNF-07 | Usabilidade | A interface deve ser intuitiva o suficiente para que um professor sem familiaridade técnica consiga criar e publicar uma prova em menos de 5 minutos. | Alta |
| RNF-08 | Portabilidade | A aplicação deve funcionar nos navegadores Chrome, Firefox, Edge e Safari nas versões estáveis mais recentes. | Média |
| RNF-09 | Conteinerização | O sistema deve ser empacotado em containers Docker para garantir portabilidade de ambiente entre desenvolvimento, homologação e produção. | Média |
| RNF-10 | Resiliência à API externa | O sistema deve implementar tratamento de erros e fallback adequado nos casos de indisponibilidade ou resposta malformada da API LLM. | Alta |

---

### Regras de Negócio

| ID | Nome | Descrição |
|----|------|-----------|
| RN-01 | Unicidade de e-mail | O e-mail de cadastro deve ser único no sistema, independentemente do perfil (professor ou aluno). |
| RN-02 | Gabarito obrigatório | Toda questão de múltipla escolha deve ter exatamente uma alternativa marcada como gabarito, correspondente a uma das 4 alternativas cadastradas. |
| RN-03 | Prova somente editável em rascunho | Uma prova com status "publicada" não pode ter suas questões editadas ou excluídas. Para alterações, o professor deve despublicá-la primeiro. |
| RN-04 | Coleção visível apenas para turma vinculada | Uma coleção de flashcards publicada é visível apenas para alunos matriculados na turma à qual a coleção está vinculada. |
| RN-05 | Mínimo de alternativas por questão | Toda questão deve possuir no mínimo 2 e no máximo 4 alternativas. A LLM é instruída a sempre retornar 4 alternativas. |
| RN-06 | Validação da resposta LLM | O backend deve validar o JSON retornado pela LLM antes de persistir: campos obrigatórios preenchidos, gabarito correspondente a uma alternativa existente, ausência de duplicatas. |
| RN-07 | Proprietário da coleção | Somente o professor que criou uma coleção de flashcards pode editá-la, publicá-la ou excluí-la. |
| RN-08 | Ordem de exibição | Questões e flashcards devem ser exibidos ao aluno na ordem definida pelo campo "ordem" em suas respectivas tabelas. |
| RN-09 | Frente e verso obrigatórios | Todo flashcard deve ter o campo `texto_frente` e `texto_verso` preenchidos. Flashcards com qualquer campo vazio devem ser rejeitados na validação. |
| RN-10 | Nível de ensino padronizado | O campo "ensino" da tabela turmas deve aceitar somente os valores: `'infantil'`, `'fundamental'`, `'medio'` ou `'superior'`. |

---

### Requisitos por Perfil de Usuário

**Perfil: Professor**
- Autenticar-se com e-mail e senha
- Gerenciar turmas e vínculos professor/aluno
- Criar, editar e publicar provas
- Gerar questões e flashcards via IA
- Criar, editar e publicar coleções de flashcards
- Remover questões, flashcards e coleções
- Visualizar alunos das turmas vinculadas

**Perfil: Aluno**
- Autenticar-se com e-mail e senha
- Visualizar provas publicadas para suas turmas
- Responder provas dentro da plataforma
- Consultar resultado e gabarito
- Acessar coleções de flashcards publicadas
- Estudar flashcards no formato frente/verso

---

### Critérios de Aceitação — Funcionalidades Críticas

| Ref. | Funcionalidade | Critério de aceitação |
|------|---------------|----------------------|
| RF-13 | Geração de questões via IA | Dado que o professor informa tema e quantidade válidos, o sistema deve retornar questões com enunciado, 4 alternativas e gabarito em menos de 15 segundos, ou exibir mensagem de erro tratada. |
| RF-18 | Geração de flashcards via IA | Dado que o professor informa tema e quantidade válidos, o sistema deve retornar flashcards com frente e verso preenchidos, na quantidade solicitada, em menos de 15 segundos. |
| RF-15 | Publicação de prova | Após a publicação, a prova deve aparecer imediatamente na listagem de provas disponíveis para os alunos da turma vinculada. O professor não deve conseguir editar questões de uma prova publicada sem despublicá-la. |
| RN-06 | Validação da resposta LLM | Caso a LLM retorne JSON inválido ou incompleto, o sistema não deve persistir dados parciais e deve exibir uma mensagem de erro clara ao professor, solicitando nova tentativa. |
| RF-23 | Estudo de flashcards | O aluno deve conseguir navegar por todos os flashcards de uma coleção, virando cada card individualmente, sem recarregar a página. |

---

## 06. Modelagem de Dados

### Usuários

#### `professores` — Cadastro de professores da instituição

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária auto-incremental |
| nome | VARCHAR(150) | NOT NULL | Nome completo do professor |
| materia | VARCHAR(100) | — | Disciplina que leciona |
| sexo | CHAR(1) | — | 'M', 'F' ou 'O' |
| email | VARCHAR(200) | UNIQUE | E-mail de autenticação — único no sistema |
| senha_hash | VARCHAR(255) | NOT NULL | Hash bcrypt da senha |
| data_cadastro | TIMESTAMP | — | Preenchido automaticamente com NOW() |

#### `alunos` — Cadastro de alunos

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| email | VARCHAR(200) | UNIQUE | E-mail de acesso — único no sistema |
| senha_hash | VARCHAR(255) | NOT NULL | Hash bcrypt da senha |
| sexo | CHAR(1) | — | 'M', 'F' ou 'O' |
| data_cadastro | TIMESTAMP | — | Preenchido automaticamente com NOW() |

---

### Turmas e Vínculos

#### `turmas` — Grupos de alunos por ano, turno e nível de ensino

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| nome | VARCHAR(60) | NOT NULL | Identificação da turma (ex.: "3.º Ano A") |
| ano | INT | NOT NULL | Ano letivo (ex.: 1, 2, 3) |
| turno | VARCHAR(20) | — | 'matutino', 'vespertino' ou 'noturno' |
| qnt_alunos | INT | — | Quantidade de alunos matriculados |
| ensino | VARCHAR(20) | NOT NULL | 'infantil', 'fundamental', 'medio' ou 'superior' |

#### `prof_turma` — Relacionamento N:N professor ↔ turma

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| id_professor | INT | FK | Referência a professores.id |
| id_turma | INT | FK | Referência a turmas.id |

#### `aluno_turma` — Relacionamento N:N aluno ↔ turma

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| id_aluno | INT | FK | Referência a alunos.id |
| id_turma | INT | FK | Referência a turmas.id |

---

### Avaliações e Questões

#### `provas` — Avaliações criadas pelos professores para as turmas

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| titulo | VARCHAR(255) | NOT NULL | Título da avaliação |
| descricao | TEXT | — | Descrição ou orientações gerais da prova |
| qnt_questoes | INT | — | Total de questões da avaliação |
| status | VARCHAR(20) | — | 'rascunho' ou 'publicada' |
| data_criacao | TIMESTAMP | — | Preenchido automaticamente com NOW() |
| id_prof | INT | FK | Referência a professores.id |
| id_turma | INT | FK | Referência a turmas.id |

#### `questoes` — Questões vinculadas a cada avaliação

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| enunciado | TEXT | NOT NULL | Texto do enunciado da questão |
| gabarito | CHAR(1) | NOT NULL | Letra da alternativa correta: A, B, C ou D |
| pontuacao | DECIMAL(5,2) | — | Peso da questão na nota final |
| ordem | INT | — | Posição de exibição na prova (1, 2, 3...) |
| id_prova | INT | FK | Referência a provas.id |

#### `alternativas` — Opções de resposta para cada questão

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| texto | TEXT | NOT NULL | Texto da alternativa |
| letra | CHAR(1) | NOT NULL | Identificador: A, B, C ou D |
| id_questao | INT | FK | Referência a questoes.id |

---

### Flashcards — Fase 1

#### `colecao_flashcards` — Deck de flashcards criado por um professor para uma turma

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| titulo | VARCHAR(255) | NOT NULL | Título da coleção (ex.: "Revisão — Revolução Industrial") |
| descricao | TEXT | — | Descrição opcional da coleção |
| qnt_flashcards | INT | — | Total de cards na coleção |
| status | VARCHAR(20) | — | 'rascunho' ou 'publicada' |
| data_criacao | TIMESTAMP | — | Preenchido automaticamente com NOW() |
| id_professor | INT | FK | Referência a professores.id |
| id_turma | INT | FK | Referência a turmas.id |

#### `flashcards` — Cards individuais de revisão frente/verso

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | SERIAL | PK | Chave primária |
| texto_frente | TEXT | NOT NULL | Pergunta ou termo apresentado ao aluno |
| texto_verso | TEXT | NOT NULL | Resposta ou definição revelada ao virar o card |
| ordem | INT | — | Posição de exibição na coleção (1, 2, 3...) |
| id_colecao | INT | FK | Referência a colecao_flashcards.id |

---

## 07. Diagramas do Sistema

### 7.1 Diagrama Entidade-Relacionamento (ERD)

```
professores ──┬── prof_turma ──── turmas ──── aluno_turma ──── alunos
              │
              ├── provas ──── questoes ──── alternativas
              │
              └── colecao_flashcards ──── flashcards
```

**Relacionamentos principais:**
- `professores` N:N `turmas` via `prof_turma`
- `alunos` N:N `turmas` via `aluno_turma`
- `professores` 1:N `provas`
- `turmas` 1:N `provas`
- `provas` 1:N `questoes`
- `questoes` 1:N `alternativas`
- `professores` 1:N `colecao_flashcards`
- `turmas` 1:N `colecao_flashcards`
- `colecao_flashcards` 1:N `flashcards`

---

### 7.2 Diagrama de Casos de Uso

**Professor:**
- Autenticar-se
- Gerenciar turmas
- Vincular professor/aluno a turma
- Criar e publicar prova
- Gerar questões via IA
- Criar coleção de flashcards
- Gerar flashcards via IA
- Editar e remover flashcards

**Aluno:**
- Autenticar-se
- Realizar prova
- Consultar resultado
- Estudar flashcards

---

### 7.3 Diagramas de Colaboração

#### 7.3A — Autenticação e Controle de Acesso

```
:Usuário → :Interface → :AuthService → :BancoDeDados
  1. fazerLogin(email, senha)
  2. autenticar()
  3. buscarUsuario()
  4. retornarPerfil()
  5. emitirJWT(perfil)
  6. redirecionarPorPerfil()
```

#### 7.3B — Gerenciamento de Turmas e Criação de Provas

```
:Professor → :TurmaService → :ProvaService → :LLM API → :BancoDeDados
  1. criarTurma() / vincular()
  2. persistirTurma()
  3. criarProva(tema, qtd)
  4. gerarQuestoes()
  5. retornarJSON()
  6. validarJSON()
  7. persistirProva()
  8. publicarProva()
```

#### 7.3C — Geração, Edição e Uso de Flashcards

```
:Professor / :Aluno → :FlashcardService → :LLM API → :BancoDeDados
  1. criarColecao(titulo, tema, qtd)
  2. gerarFlashcards()
  3. retornarJSON()
  4. validarJSON()
  5. persistirColecao()
  6. criarEntidade()
  7. criarCards(lista)
  8. editarCard() / removerCard()
  9. publicarColecao()
  10. estudarFlashcards()
  11. retornarCards()
```

---

## 08. Fluxo de Geração via IA

### 8.1 Geração de Flashcards

**1. Entrada do professor**
O professor informa o título da coleção, o tema, a quantidade de flashcards desejada (mín. 1, máx. 50) e seleciona a turma destino.

**2. Montagem do prompt e chamada à API LLM**

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

**3. Recebimento e validação da resposta**
O backend parseia a resposta e valida: (a) o campo `flashcards` é um array não vazio; (b) cada item possui `frente` e `verso` preenchidos; (c) a quantidade retornada corresponde à solicitada; (d) não há duplicatas. JSON inválido retorna erro sem persistir dados parciais.

**4. Persistência em cascata**
`INSERT` em `colecao_flashcards` com status `rascunho` → captura `id_colecao` → `INSERT` em `flashcards` para cada item, preservando a ordem.

**5. Revisão editorial**
O professor revisa, edita frente/verso, reordena, adiciona ou remove cards individualmente antes de publicar.

**6. Publicação e uso pelos alunos**
Ao publicar, o status muda de `rascunho` para `publicada`. Os alunos da turma vinculada passam a ver a coleção e podem estudar no formato frente/verso com navegação entre cards.

**Exemplo de resposta da LLM — flashcards:**
```json
{
  "flashcards": [
    {
      "ordem": 1,
      "frente": "O que foi a Revolução Industrial e onde se iniciou?",
      "verso": "Processo de transformação do modo de produção artesanal para o industrial, iniciado na Inglaterra."
    },
    {
      "ordem": 2,
      "frente": "Quais as principais consequências sociais da Revolução Industrial?",
      "verso": "Surgimento do proletariado, êxodo rural, urbanização acelerada, exploração do trabalho infantil."
    }
  ]
}
```

---

### 8.2 Geração de Questões (Provas)

**1. Entrada do professor**
O professor informa o título da prova, o tema, a quantidade de questões e a turma destino.

**2. Montagem do prompt e chamada à API LLM**

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

**3. Validação da resposta**
Valida: gabarito corresponde a uma das letras das alternativas; cada questão tem exatamente 4 alternativas; campos obrigatórios preenchidos; sem duplicatas de enunciado.

**4. Persistência em cascata**
`INSERT` em `provas` (status `rascunho`) → captura `id_prova` → `INSERT` em `questoes` → captura `id_questao` → `INSERT` em `alternativas`.

**5. Revisão e publicação**
O professor revisa enunciados, alternativas e gabarito. Ao publicar, a prova fica disponível para os alunos da turma vinculada.

**Exemplo de resposta da LLM — questões:**
```json
{
  "questoes": [
    {
      "enunciado": "Qual foi o principal motivo econômico que desencadeou a Revolução Francesa em 1789?",
      "gabarito": "C",
      "pontuacao": 2.5,
      "ordem": 1,
      "alternativas": [
        { "letra": "A", "texto": "Rivalidade militar entre França e Inglaterra" },
        { "letra": "B", "texto": "Invasão de tropas austríacas ao território francês" },
        { "letra": "C", "texto": "Falência do Estado, fome e tributação desigual sobre o Terceiro Estado" },
        { "letra": "D", "texto": "Reforma protestante e conflito entre Igreja e monarquia" }
      ]
    }
  ]
}
```

---

## 09. Visão Técnica da Solução

### 9.1 Arquitetura Conceitual do Backend

O backend do Ilumina segue o padrão de arquitetura em camadas, organizando as responsabilidades de forma hierárquica e com baixo acoplamento. Desenvolvido em **Java com Spring Boot**, o serviço expõe uma API REST consumida pelo frontend e orquestra as interações com o banco de dados e com a API LLM externa.

#### Camadas da Aplicação

**Controller — Camada de entrada**
Responsável por receber as requisições HTTP, deserializar os dados de entrada e delegar o processamento à camada de serviço. Não contém lógica de negócio. Define os endpoints da API, os métodos HTTP aceitos e os formatos de resposta. Também aplica controle de acesso via anotações de autorização.

**Service — Camada de negócio**
Concentra as regras de negócio, as validações de consistência e a orquestração dos fluxos da aplicação. É nessa camada que ocorrem as verificações de permissão por perfil, as validações de estado dos recursos (ex.: se uma prova pode ser editada), a preparação do prompt para a LLM e o processamento da resposta retornada.

**Repository — Camada de persistência**
Abstrai o acesso ao banco de dados por meio de interfaces gerenciadas pelo Spring Data JPA com Hibernate. Cada entidade do sistema possui seu repositório correspondente, responsável pelas operações de leitura, escrita, atualização e remoção. Esta camada desconhece as regras de negócio.

**Integration — Camada de integração externa**
Encapsula a comunicação com serviços externos, especialmente a API LLM. Isola os detalhes de protocolo, serialização e tratamento de erros de rede do restante da aplicação. Recebe instruções da camada de serviço (tema, quantidade, formato esperado), monta a requisição para a LLM e retorna a resposta já deserializada. Em caso de falha ou resposta inválida, lança exceções tratadas pela camada de serviço.

> **Fluxo geral:** Cliente → HTTP Request → Controller (valida JWT) → Service (regras de negócio) → Repository (banco de dados) e/ou Integration (LLM) → resposta percorre o caminho inverso.

---

### 9.2 Arquitetura Conceitual do Frontend

O frontend do Ilumina é uma **Single Page Application (SPA)** desenvolvida em React ou Angular, estruturada para separar claramente as responsabilidades de apresentação, estado e comunicação com o backend.

**Organização da interface:**
- **Páginas** — unidades de navegação direta, cada uma correspondendo a uma rota da aplicação (ex.: `/provas`, `/turmas`, `/flashcards`).
- **Componentes** — blocos reutilizáveis que compõem as páginas: cards, tabelas, formulários, modais, botões de ação e indicadores de estado.
- **Fluxos** — sequências de telas para operações de múltiplos passos (ex.: configurar → gerar → revisar → publicar).
- **Serviços/hooks** — módulos responsáveis pelo consumo das APIs do backend, encapsulando as chamadas HTTP e o tratamento de respostas e erros.

**Comportamento por perfil:**
- **Professor** — acesso ao painel de gestão com módulos de provas, turmas e flashcards.
- **Aluno** — acesso restrito à área de estudo: visualização de provas publicadas, resposta às avaliações e navegação pelas coleções de flashcards.
- **Rota protegida** — qualquer rota que exija autenticação redireciona para o login caso o token JWT esteja ausente ou expirado.

**Estados principais da interface:**

| Estado | Comportamento |
|--------|---------------|
| Carregamento | Skeleton ou spinner enquanto dados são buscados ou a LLM está processando |
| Sucesso | Feedback visual confirmando a ação realizada com redirecionamento ou atualização da listagem |
| Vazio | Estado de lista vazia com mensagem contextual e atalho para a ação principal |
| Erro | Mensagem clara informando o que falhou, com orientação de nova tentativa ou suporte |

---

### 9.3 Lista de Telas do Sistema

#### Acesso e Autenticação

| Tela | Descrição |
|------|-----------|
| Login | Autenticação com e-mail e senha. Redireciona conforme perfil (Professor ou Aluno). |
| Cadastro | Registro de novo usuário com seleção de perfil, dados pessoais e criação de senha. |
| Recuperação de senha | Solicitação de redefinição via e-mail cadastrado. |

#### Professor — Painel e Turmas

| Tela | Descrição |
|------|-----------|
| Dashboard do professor | Visão geral com acesso rápido às provas recentes, coleções de flashcards e turmas vinculadas. |
| Listagem de turmas | Lista de turmas cadastradas pelo professor, com opções de criar, editar e excluir. |
| Detalhe da turma | Exibe os alunos matriculados na turma, as provas e coleções de flashcards publicadas para ela. |
| Formulário de turma | Criação e edição de turma com campos de nome, ano, turno e nível de ensino. |
| Perfil do professor | Edição dos dados pessoais e de senha do professor autenticado. |

#### Professor — Provas e Questões

| Tela | Descrição |
|------|-----------|
| Listagem de provas | Lista de provas criadas pelo professor, com filtro por status (rascunho / publicada) e turma. |
| Criação de prova | Formulário de configuração inicial da prova: título, turma destino, tema e quantidade de questões. Inclui opção de geração via IA. |
| Revisão de questões | Tela de revisão editorial das questões geradas: edição de enunciado, alternativas e gabarito. Exibe indicador de progresso da geração enquanto a LLM processa. |
| Detalhe da prova | Visualização completa da prova com suas questões e alternativas. Permite publicar ou despublicá-la. |

#### Professor — Coleções de Flashcards

| Tela | Descrição |
|------|-----------|
| Listagem de coleções | Lista de coleções de flashcards criadas pelo professor, com filtro por status e turma. |
| Criação de coleção | Formulário com título, tema, quantidade de cards e turma destino. Inclui opção de geração via IA ou adição manual. |
| Revisão de flashcards | Tela de revisão da coleção gerada: edição de frente e verso, reordenação, adição e remoção de cards individuais. |
| Detalhe da coleção | Visualização dos flashcards da coleção com opção de publicar ou despublicá-la. |

#### Aluno — Área de Estudo

| Tela | Descrição |
|------|-----------|
| Dashboard do aluno | Painel com provas disponíveis e coleções de flashcards publicadas para as turmas do aluno. |
| Realização de prova | Interface de resposta às questões da prova, com navegação entre questões e submissão ao final. |
| Resultado da prova | Exibe o gabarito e o desempenho do aluno após a submissão. |
| Estudo de flashcards | Interface de revisão em formato frente/verso com navegação entre cards. Cada card é virado individualmente ao clicar. |
| Perfil do aluno | Edição dos dados pessoais e senha do aluno autenticado. |

---

### 9.4 Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| **01 — Autenticação e autorização** | Gerencia o ciclo de vida da sessão do usuário: cadastro, login, emissão e validação de token JWT, controle de acesso por perfil e proteção de rotas. **Status atual: implementado no backend (base funcional pronta).** |
| **02 — Gestão de turmas e usuários** | Abrange o cadastro e a manutenção de professores, alunos e turmas, além dos vínculos entre eles. Suporta os relacionamentos N:N professor-turma e aluno-turma. |
| **03 — Avaliações e questões** | Responsável pelo ciclo completo das provas: criação, geração automática de questões via LLM, revisão editorial pelo professor, controle de status e disponibilização para os alunos. |
| **04 — Coleções de flashcards** | Gerencia o ciclo das coleções de flashcards: criação, geração via LLM, cadastro manual, edição e remoção de cards individuais, controle de publicação e acesso pelos alunos. |
| **05 — Integração com LLM** | Encapsula toda a comunicação com a API LLM externa. Monta os prompts, envia as requisições, deserializa as respostas e trata falhas de integração. Agnóstico ao conteúdo gerado. |
| **06 — Área do aluno** | Consolida as funcionalidades voltadas ao aluno: listagem de provas e coleções disponíveis, realização de avaliações, consulta de gabarito e navegação pelos flashcards. |

---

### 9.5 Responsabilidades de Cada Camada

| Camada | Responsabilidades |
|--------|------------------|
| **Frontend** | Apresentação, interação e estado da interface. Consome a API REST do backend via HTTP, gerencia o token JWT localmente, controla a navegação entre telas e adapta os componentes exibidos conforme o perfil autenticado. Não contém regras de negócio. |
| **Backend** | Núcleo da solução. Centraliza todas as regras de negócio, validações, controle de acesso e orquestração dos fluxos. Expõe endpoints REST documentados via Swagger, processa as requisições do frontend, aciona o banco de dados para persistência e delega ao módulo de integração as chamadas à LLM. |
| **Banco de dados** | Armazena o estado persistente de toda a aplicação. Gerenciado pelo PostgreSQL, é acessado exclusivamente pelo backend via ORM (Hibernate/Spring Data JPA). Não expõe dados diretamente ao frontend nem à LLM. |
| **Integração LLM** | Serviço isolado responsável pela comunicação com a API LLM externa. Recebe parâmetros estruturados, monta o prompt, realiza a chamada HTTP, deserializa e valida a resposta JSON. Em caso de falha, retorna exceções tratadas pelo backend. |

---

### 9.6 Padrão de Erros e Validações

#### Validações de Entrada
- **Campos obrigatórios** — verificados no backend em toda operação de criação e edição. Resposta `400 Bad Request` com mensagem descritiva por campo.
- **Unicidade** — e-mails duplicados retornam erro específico com orientação de login ou recuperação de senha.
- **Formato e tipo** — validação de tipos de dados, comprimentos máximos e valores aceitos nos campos enumerados (ex.: turno, nível de ensino).
- **Frontend** — validação prévia nos formulários antes do envio, para reduzir chamadas desnecessárias à API.

#### Validações de Consistência e Permissão
- **Estado do recurso** — verificações de regras de negócio como "prova publicada não pode ser editada". Resposta `409 Conflict`.
- **Propriedade** — o backend verifica se o usuário autenticado é o dono do recurso antes de qualquer operação de modificação. Resposta `403 Forbidden`.
- **Acesso por perfil** — endpoints exclusivos do professor retornam `403` se acionados por um aluno, e vice-versa.
- **Autenticação** — token ausente ou expirado retorna `401 Unauthorized`.

#### Validação da Resposta LLM
- **Estrutura JSON** — verificação de que o retorno é um JSON válido com os campos obrigatórios presentes.
- **Consistência do conteúdo** — gabarito deve corresponder a uma alternativa existente; frente e verso não podem estar vazios.
- **Quantidade** — o número de itens retornados é comparado com o solicitado. Divergências são reportadas ao professor.
- **Falha na integração** — em caso de timeout ou erro HTTP da LLM, nenhum dado é persistido e o professor recebe mensagem de nova tentativa.

#### Respostas e Comportamento da Interface
- **Padrão de resposta** — o backend adota um envelope de resposta padronizado com campos de sucesso, mensagem e dados.
- **Mensagens amigáveis** — erros técnicos são convertidos em mensagens compreensíveis antes de chegarem ao usuário. Logs detalhados ficam no servidor.
- **Estado de erro na UI** — a interface exibe alertas contextuais, não oculta o formulário e preserva os dados já preenchidos, permitindo correção sem retrabalho.
- **Indicador de progresso** — operações com LLM exibem um indicador visual enquanto aguardam resposta, com mensagem explicando que a geração pode levar alguns segundos.

---

## 10. Cronograma do Projeto

O projeto iniciou em março (mês 1) e tem duração total de 4 meses.

| Atividade | Mês 1 (Março) | Mês 2 (Abril) | Mês 3 (Maio) | Mês 4 (Junho) |
|-----------|:---:|:---:|:---:|:---:|
| Levantamento de requisitos | 🟠 | | | |
| Arquitetura e design de software | 🟠 | | | |
| Prototipagem (UX/UI) | | 🔵 | | |
| Desenvolvimento frontend | | 🔵 | 🔵 | |
| Desenvolvimento backend | | | 🔵 | 🔵 |
| Testes automatizados | | | | 🔵 |
| Infraestrutura e DevOps | | | 🔵 | 🔵 |
| Implementação e entrega | | | | 🔵 |

> 🟠 Em andamento · 🔵 Planejado

### Distribuição por Fase

**Fase 1 — AB1 (Meses 1–2) — Levantamento, design e frontend**
- Levantamento de requisitos
- Arquitetura e design de software
- Prototipagem e design system (Figma)
- Desenvolvimento frontend com dados mockados
- Módulo de flashcards (geração via IA) integrado ao frontend

**Fase 2 — AB2 (Meses 3–4) — Backend, integração e entrega**
- Desenvolvimento backend (Java + Spring Boot)
- Integração real frontend ↔ backend
- Testes automatizados (JUnit)
- Infraestrutura Docker e CI/CD
- Deploy em produção (Render)
- Documentação final da API (Swagger)

---

## 11. Equipe, Papéis e Atribuições

| Sigla | Nome | Papel | Foco |
|-------|------|-------|------|
| VA | Victor André Lopes Brasileiro | Gerente de Projeto · Dev Frontend | AB1 + AB2 |
| LB | Laura Beatriz Lins R. Mainero | Designer UX/UI | AB1 |
| YR | Yuri Raphael M. A. Barbosa | Desenvolvedor Frontend | AB1 |
| ES | Erasmo da Silva Sá Júnior | Desenvolvedor Backend | AB2 |
| JR | José Riquelme Teixeira da Silva | Desenvolvedor Backend | AB2 |

### Responsabilidades Detalhadas

**Victor André (Gerente de Projeto · Dev Frontend) — AB1 + AB2**
- Comunicação com os stakeholders e orientador do projeto
- Planejamento de requisitos, cronograma, riscos e qualidade
- Condução de reuniões, pitches e elaboração de diagramas
- QA — validação e aprovação de entregas antes da finalização
- Desenvolvimento frontend com dados mockados na AB1
- Integração real com backend na AB2

**Laura Beatriz (Designer UX/UI) — AB1**
- Design de interface e experiência do usuário
- Pesquisa de usabilidade e testes com usuários
- Criação de wireframes e protótipos navegáveis
- Design system e guia de componentes visuais
- Definição de fluxos de navegação e consistência visual

**Yuri Raphael (Desenvolvedor Frontend) — AB1**
- Desenvolvimento de interface e componentes de UI
- AB1 com dados mockados; integração real na AB2
- Responsividade, acessibilidade e componentização
- Consumo de APIs REST e gerenciamento de estado

**Erasmo da Silva / José Riquelme (Desenvolvedores Backend) — AB2**
- Modelagem do banco de dados e arquitetura do sistema
- Desenvolvimento de serviços e endpoints REST
- Testes automatizados com JUnit e tratamento de erros
- Deploy, infraestrutura Docker e documentação da API

---

## 12. Ambiente de Trabalho e Ferramentas

| Categoria | Ferramentas |
|-----------|-------------|
| **Frontend** | React, Angular |
| **Backend** | Java, Spring Boot |
| **Banco de dados** | PostgreSQL, Hibernate, Spring Data JPA |
| **API & Testes** | Swagger, SpringDoc OpenAPI, JUnit |
| **DevOps & Infra** | Docker, GitHub Actions, Render |
| **Versionamento** | Git, GitHub |
| **Design & Prototipagem** | Figma, Photoshop, Affinity |
| **Gestão & Documentação** | Trello, Notion, Miro |

---

## 13. Considerações Finais

O projeto Ilumina encontra-se em estágio de desenvolvimento ativo, com os requisitos levantados, a arquitetura definida e o design em andamento. Os módulos de gerenciamento de turmas, criação de provas e geração de flashcards via IA compõem o escopo da Fase 1, a ser entregue ao final da AB1.

A Fase 2 concentrará esforços na integração real entre frontend e backend, nos testes automatizados, na infraestrutura de produção e nos módulos analíticos de desempenho dos alunos. A arquitetura foi planejada para suportar essa expansão sem necessidade de refatoração estrutural.

A dependência da API LLM externa representa o **principal risco técnico do projeto**. Para mitigá-lo, o sistema prevê tratamento de erros robusto, mensagens de fallback e a possibilidade de inserção manual de questões e flashcards, garantindo continuidade mesmo em caso de indisponibilidade do serviço de IA.

---

*Ilumina — Plataforma web de apoio pedagógico com geração de avaliações e flashcards via IA.*  
*Documentação técnica — v2.0 · 2025 · Fase 1 em andamento*
