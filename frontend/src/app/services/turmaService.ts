import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type {
  AlunoResponse,
  CreateTurmaRequest,
  TurmaResponse,
  UpdateTurmaRequest,
} from "../types/school";

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

export const turmaService = {
  async list(): Promise<TurmaResponse[]> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse[]>>("turmas"));
  },

  async getById(id: string): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>(`turmas/${id}`));
  },

  async create(request: CreateTurmaRequest): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>("turmas", {
      method: "POST",
      body: request,
    }));
  },

  async update(id: string, request: UpdateTurmaRequest): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>(`turmas/${id}`, {
      method: "PUT",
      body: request,
    }));
  },

  async deactivate(id: string): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>(`turmas/${id}/deactivate`, {
      method: "PATCH",
    }));
  },

  async listStudents(id: string): Promise<AlunoResponse[]> {
    return unwrap(await httpRequest<ApiResponse<AlunoResponse[]>>(`turmas/${id}/matriculas`));
  },

  async listAvailableStudents(id: string, query: string): Promise<AlunoResponse[]> {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("query", query.trim());
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return unwrap(await httpRequest<ApiResponse<AlunoResponse[]>>(`turmas/${id}/alunos-disponiveis${suffix}`));
  },

  async enrollStudent(turmaId: string, alunoId: string): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>(`turmas/${turmaId}/matriculas`, {
      method: "POST",
      body: { alunoId },
    }));
  },

  async unenrollStudent(turmaId: string, alunoId: string): Promise<TurmaResponse> {
    return unwrap(await httpRequest<ApiResponse<TurmaResponse>>(`turmas/${turmaId}/matriculas/${alunoId}`, {
      method: "DELETE",
    }));
  },
};
