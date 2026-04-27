import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type {
  AlunoProvaResumoResponse,
  ProvaAlunoResponse,
  ProvaDetalheAlunoResponse,
  ResultadoProvaResponse,
  SubmissaoRespostasRequest,
} from "../types/prova";

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

export const alunoProvaService = {
  async buscarResumo(): Promise<AlunoProvaResumoResponse> {
    return unwrap(await httpRequest<ApiResponse<AlunoProvaResumoResponse>>("aluno/provas/resumo"));
  },

  async listar(): Promise<ProvaAlunoResponse[]> {
    return unwrap(await httpRequest<ApiResponse<ProvaAlunoResponse[]>>("aluno/provas"));
  },

  async detalhar(id: string): Promise<ProvaDetalheAlunoResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaDetalheAlunoResponse>>(`aluno/provas/${id}`));
  },

  async responder(id: string, request: SubmissaoRespostasRequest): Promise<ResultadoProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ResultadoProvaResponse>>(`aluno/provas/${id}/respostas`, {
      method: "POST",
      body: request,
    }));
  },

  async buscarResultado(id: string): Promise<ResultadoProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ResultadoProvaResponse>>(`aluno/provas/${id}/resultado`));
  },
};
