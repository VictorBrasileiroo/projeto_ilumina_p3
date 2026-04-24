export type ProvaStatus = "RASCUNHO" | "PUBLICADA";
export type AlternativaLetra = "A" | "B" | "C" | "D";

export interface ProvaResponse {
  id: string;
  titulo: string;
  disciplina: string | null;
  status: ProvaStatus;
  turmaId: string;
  turmaNome: string;
  professorId: string;
  professorNome: string;
  totalQuestoes: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlternativaResponse {
  id: string;
  letra: AlternativaLetra;
  texto: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestaoResponse {
  id: string;
  enunciado: string;
  gabarito: AlternativaLetra;
  pontuacao: number;
  ordem: number;
  alternativas: AlternativaResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ProvaDetalheResponse {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string | null;
  qntQuestoes: number | null;
  status: ProvaStatus;
  turmaId: string;
  turmaNome: string;
  professorId: string;
  professorNome: string;
  questoes: QuestaoResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProvaRequest {
  titulo: string;
  descricao?: string | null;
  disciplina?: string | null;
  qntQuestoes?: number | null;
  turmaId: string;
}

export type UpdateProvaRequest = Partial<CreateProvaRequest>;

export interface CreateAlternativaRequest {
  texto: string;
  letra: AlternativaLetra;
}

export interface CreateQuestaoRequest {
  enunciado: string;
  gabarito: AlternativaLetra;
  pontuacao?: number;
  ordem: number;
  alternativas: CreateAlternativaRequest[];
}

export interface UpdateQuestaoRequest {
  enunciado?: string;
  gabarito?: AlternativaLetra;
  pontuacao?: number;
  ordem?: number;
}

export interface UpdateAlternativaRequest {
  texto: string;
}

export interface GerarQuestoesRequest {
  tema: string;
  quantidade?: number;
}
