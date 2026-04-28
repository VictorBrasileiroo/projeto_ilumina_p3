import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type {
  AlternativaResponse,
  CreateProvaRequest,
  CreateQuestaoRequest,
  GerarQuestoesRequest,
  ProvaDetalheResponse,
  ProvaResponse,
  QuestaoResponse,
  UpdateAlternativaRequest,
  UpdateProvaRequest,
  UpdateQuestaoRequest,
} from "../types/prova";

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

export const provaService = {
  async listar(): Promise<ProvaResponse[]> {
    return unwrap(await httpRequest<ApiResponse<ProvaResponse[]>>("provas"));
  },

  async detalhar(id: string): Promise<ProvaDetalheResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaDetalheResponse>>(`provas/${id}`));
  },

  async criar(request: CreateProvaRequest): Promise<ProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaResponse>>("provas", {
      method: "POST",
      body: request,
    }));
  },

  async atualizar(id: string, request: UpdateProvaRequest): Promise<ProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaResponse>>(`provas/${id}`, {
      method: "PUT",
      body: request,
    }));
  },

  async excluir(id: string): Promise<void> {
    await httpRequest<void>(`provas/${id}`, {
      method: "DELETE",
    });
  },

  async adicionarQuestao(provaId: string, request: CreateQuestaoRequest): Promise<QuestaoResponse> {
    return unwrap(await httpRequest<ApiResponse<QuestaoResponse>>(`provas/${provaId}/questoes`, {
      method: "POST",
      body: request,
    }));
  },

  async atualizarQuestao(provaId: string, questaoId: string, request: UpdateQuestaoRequest): Promise<QuestaoResponse> {
    return unwrap(await httpRequest<ApiResponse<QuestaoResponse>>(`provas/${provaId}/questoes/${questaoId}`, {
      method: "PUT",
      body: request,
    }));
  },

  async removerQuestao(provaId: string, questaoId: string): Promise<void> {
    await httpRequest<void>(`provas/${provaId}/questoes/${questaoId}`, {
      method: "DELETE",
    });
  },

  async atualizarAlternativa(
    provaId: string,
    questaoId: string,
    alternativaId: string,
    request: UpdateAlternativaRequest,
  ): Promise<AlternativaResponse> {
    return unwrap(await httpRequest<ApiResponse<AlternativaResponse>>(
      `provas/${provaId}/questoes/${questaoId}/alternativas/${alternativaId}`,
      {
        method: "PUT",
        body: request,
      },
    ));
  },

  async publicar(id: string): Promise<ProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaResponse>>(`provas/${id}/publicar`, {
      method: "PATCH",
    }));
  },

  async despublicar(id: string): Promise<ProvaResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaResponse>>(`provas/${id}/despublicar`, {
      method: "PATCH",
    }));
  },

  async gerarQuestoes(id: string, request: GerarQuestoesRequest): Promise<ProvaDetalheResponse> {
    return unwrap(await httpRequest<ApiResponse<ProvaDetalheResponse>>(`provas/${id}/gerar-questoes`, {
      method: "POST",
      body: request,
      timeoutMs: 60_000,
    }));
  },
};
