import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./components/RequireAuth";
import { ALUNO_AREA_ROLES, PROFESSOR_AREA_ROLES } from "./lib/constants";
import SemPermissao from "./pages/SemPermissao";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfessorDashboard from "./pages/professor/Dashboard";
import ProfessorTurmas from "./pages/professor/Turmas";
import ProfessorTurmaDetalhes from "./pages/professor/TurmaDetalhes";
import ProfessorListaProvas from "./pages/professor/ListaProvas";
import ProfessorCriarProva from "./pages/professor/CriarProva";
import ProfessorRevisarQuestoes from "./pages/professor/RevisarQuestoes";
import ProfessorFlashcards from "./pages/professor/Flashcards";
import ProfessorFlashcardDetalhes from "./pages/professor/FlashcardDetalhes";
import AlunoDashboard from "./pages/aluno/Dashboard";
import AlunoProvas from "./pages/aluno/Provas";
import AlunoProva from "./pages/aluno/Prova";
import AlunoResultado from "./pages/aluno/Resultado";
import AlunoFlashcardsList from "./pages/aluno/FlashcardsList";
import AlunoFlashcards from "./pages/aluno/Flashcards";
import ProfessorLayout from "./layouts/ProfessorLayout";
import AlunoLayout from "./layouts/AlunoLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Register,
  },
  {
    path: "/cadastro/professor",
    Component: Register,
  },
  {
    path: "/cadastro/aluno",
    Component: Register,
  },
  {
    path: "/sem-permissao",
    Component: SemPermissao,
  },
  {
    path: "/professor",
    element: (
      <RequireAuth allowedRoles={PROFESSOR_AREA_ROLES}>
        <ProfessorLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: ProfessorDashboard },
      { path: "turmas", Component: ProfessorTurmas },
      { path: "turmas/:id", Component: ProfessorTurmaDetalhes },
      { path: "provas", Component: ProfessorListaProvas },
      { path: "provas/criar", Component: ProfessorCriarProva },
      { path: "provas/:id/revisar", Component: ProfessorRevisarQuestoes },
      { path: "flashcards", Component: ProfessorFlashcards },
      { path: "flashcards/:id", Component: ProfessorFlashcardDetalhes },
    ],
  },
  {
    path: "/aluno",
    element: (
      <RequireAuth allowedRoles={ALUNO_AREA_ROLES}>
        <AlunoLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: AlunoDashboard },
      { path: "provas", Component: AlunoProvas },
      { path: "prova/:id", Component: AlunoProva },
      { path: "resultado/:id", Component: AlunoResultado },
      { path: "flashcards", Component: AlunoFlashcardsList },
      { path: "flashcards/:id", Component: AlunoFlashcards },
    ],
  },
]);
