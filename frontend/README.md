# Ilumina Frontend

Frontend inicial da plataforma Ilumina, com foco em navegação professor/aluno e telas de demonstração para apresentação.

## Objetivo desta versão

- Entregar uma base visual navegável e consistente para validação inicial.
- Demonstrar fluxos principais de professor e aluno com dados mockados.
- Manter algumas telas avançadas fora de rota nesta etapa.

## Stack

- React 18
- React Router 7 (`createBrowserRouter`)
- Vite 6
- Tailwind CSS 4
- Lucide React (ícones)

## Como rodar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

App disponível em: `http://localhost:5173`

### Build de produção

```bash
npm run build
```

## Estrutura principal

```text
src/
	app/
		components/   # componentes reutilizáveis (Button, Input, Sidebar, TopBar, etc.)
		layouts/      # layouts por perfil (ProfessorLayout, AlunoLayout)
		pages/        # telas por domínio (professor, aluno, login)
		routes.tsx    # definição central de rotas
	imports/
		Logo_ilumina.svg
	styles/
		fonts.css
		tailwind.css
		theme.css
```

## Rotas ativas

### Públicas

- `/` (login)

### Professor

- `/professor`
- `/professor/turmas`
- `/professor/provas/criar`
- `/professor/provas/:id/revisar`
- `/professor/flashcards`
- `/professor/flashcards/:id`

### Aluno

- `/aluno`
- `/aluno/provas`
- `/aluno/prova/:id`
- `/aluno/resultado/:id`
- `/aluno/flashcards`
- `/aluno/flashcards/:id`


## Observações importantes

- Esta versão usa dados mockados.
- O login é de navegação (não realiza autenticação real).

## Próximos passos sugeridos

- Conectar telas com backend real.
- Reintroduzir telas avançadas gradualmente por feature flag/rota controlada.
- Adicionar rota de fallback (`404`) para evitar página de erro padrão do router.