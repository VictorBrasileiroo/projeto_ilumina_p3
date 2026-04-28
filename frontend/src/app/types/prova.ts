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

export interface ProvaAlunoResponse {
  id: string;
  titulo: string;
  disciplina: string | null;
  createdAt: string;
  turmaNome: string;
  totalQuestoes: number;
  jaRespondeu: boolean;
}

export interface AlternativaAlunoResponse {
  id: string;
  letra: AlternativaLetra;
  texto: string;
}

export interface QuestaoAlunoResponse {
  id: string;
  enunciado: string;
  ordem: number;
  alternativas: AlternativaAlunoResponse[];
}

export interface ProvaDetalheAlunoResponse {
  id: string;
  titulo: string;
  descricao: string | null;
  disciplina: string | null;
  turmaId: string;
  turmaNome: string;
  totalQuestoes: number;
  questoes: QuestaoAlunoResponse[];
  createdAt: string;
}

export interface RespostaItemRequest {
  questaoId: string;
  letraEscolhida: AlternativaLetra;
}

export interface SubmissaoRespostasRequest {
  respostas: RespostaItemRequest[];
}

export interface QuestaoResultadoResponse {
  questaoId: string;
  enunciado: string;
  letraEscolhida: AlternativaLetra;
  gabarito: AlternativaLetra;
  acertou: boolean;
  pontuacao: number;
}

export interface ResultadoProvaResponse {
  provaId: string;
  provaTitle: string;
  totalQuestoes: number;
  totalAcertos: number;
  notaFinal: number;
  respondidoEm: string;
  questoes: QuestaoResultadoResponse[];
}

export interface AlunoProvaResumoPorDisciplinaItem {
  disciplina: string;
  totalProvas: number;
  totalRespondidas: number;
  mediaNota: number | null;
}

export interface AlunoProvaResumoResponse {
  totalProvas: number;
  totalRespondidas: number;
  totalPendentes: number;
  mediaNota: number | null;
  porDisciplina: AlunoProvaResumoPorDisciplinaItem[];
}
