export type Turno = "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL";
export type Ensino = "INFANTIL" | "FUNDAMENTAL" | "MEDIO" | "SUPERIOR";

export interface CreateProfessorRequest {
  name: string;
  email: string;
  password: string;
  disciplina: string;
  sexo: string;
}

export interface CreateAlunoRequest {
  name: string;
  email: string;
  password: string;
  matricula: string;
  sexo: string;
}

export interface DomainAuthResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
  type: string;
  roles: string[];
}

export interface CreateProfessorResponse extends DomainAuthResponse {
  disciplina: string;
  sexo: string;
  active: boolean;
  createdAt: string;
}

export interface CreateAlunoResponse extends DomainAuthResponse {
  matricula: string;
  sexo: string;
  active: boolean;
  createdAt: string;
}

export interface AlunoResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  matricula: string;
  sexo: string;
  active: boolean;
  createdAt: string;
}

export interface TurmaProfessorResponse {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface TurmaResponse {
  id: string;
  nome: string;
  ano: number;
  turno: Turno;
  ensino: Ensino;
  qntAlunos: number;
  active: boolean;
  createdAt: string;
  professores: TurmaProfessorResponse[];
}

export interface CreateTurmaRequest {
  nome: string;
  ano: number;
  turno: Turno;
  ensino: Ensino;
  qntAlunos: number;
}

export type UpdateTurmaRequest = Partial<CreateTurmaRequest>;

export interface TurmaResumoMediaPorProvaItem {
  provaId: string;
  titulo: string;
  disciplina: string | null;
  totalRespostas: number;
  mediaNota: number | null;
}

export interface TurmaResumoAlunoItem {
  alunoId: string;
  totalRespostas: number;
  mediaNota: number | null;
}

export interface TurmaResumoResponse {
  turmaId: string;
  turmaNome: string;
  totalAlunos: number;
  totalProvasPublicadas: number;
  totalRespostas: number;
  mediaNota: number | null;
  mediasPorProva: TurmaResumoMediaPorProvaItem[];
  alunos: TurmaResumoAlunoItem[];
}
