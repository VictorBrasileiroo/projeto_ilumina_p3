import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import ProfessorDashboard from "./pages/professor/Dashboard";
import ProfessorTurmas from "./pages/professor/Turmas";
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
    path: "/professor",
    Component: ProfessorLayout,
    children: [
      { index: true, Component: ProfessorDashboard },
      { path: "turmas", Component: ProfessorTurmas },
      { path: "provas/criar", Component: ProfessorCriarProva },
      { path: "provas/:id/revisar", Component: ProfessorRevisarQuestoes },
      { path: "flashcards", Component: ProfessorFlashcards },
      { path: "flashcards/:id", Component: ProfessorFlashcardDetalhes },
    ],
  },
  {
    path: "/aluno",
    Component: AlunoLayout,
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
