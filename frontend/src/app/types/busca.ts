export type BuscaTipo = "TURMA" | "PROVA" | "COLECAO" | "ALUNO";

export interface BuscaItem {
  id: string;
  tipo: BuscaTipo;
  titulo: string;
  subtitulo: string;
}

export interface BuscaGlobalResponse {
  turmas: BuscaItem[];
  provas: BuscaItem[];
  colecoes: BuscaItem[];
  alunos: BuscaItem[];
}
