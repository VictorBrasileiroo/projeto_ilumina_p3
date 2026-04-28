import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type {
  ColecaoDetalheResponse,
  ColecaoResponse,
  CreateColecaoRequest,
  CreateFlashcardRequest,
  FlashcardResponse,
  GerarFlashcardsRequest,
  UpdateColecaoRequest,
  UpdateFlashcardRequest,
} from "../types/flashcard";

interface BackendFlashcardResponse {
  id: string;
  textoFrente: string;
  textoVerso: string;
  ordem: number;
}

interface BackendColecaoDetalheResponse extends Omit<ColecaoDetalheResponse, "flashcards"> {
  flashcards: BackendFlashcardResponse[];
}

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

function mapFlashcard(response: BackendFlashcardResponse): FlashcardResponse {
  return {
    id: response.id,
    frente: response.textoFrente,
    verso: response.textoVerso,
    ordem: response.ordem,
  };
}

function mapColecaoDetalhe(response: BackendColecaoDetalheResponse): ColecaoDetalheResponse {
  return {
    ...response,
    flashcards: response.flashcards.map(mapFlashcard),
  };
}

function toFlashcardBody(request: CreateFlashcardRequest | UpdateFlashcardRequest) {
  return {
    textoFrente: request.frente,
    textoVerso: request.verso,
  };
}

export const colecaoService = {
  async listar(): Promise<ColecaoResponse[]> {
    return unwrap(await httpRequest<ApiResponse<ColecaoResponse[]>>("colecoes"));
  },

  async detalhar(id: string): Promise<ColecaoDetalheResponse> {
    return mapColecaoDetalhe(
      unwrap(await httpRequest<ApiResponse<BackendColecaoDetalheResponse>>(`colecoes/${id}`)),
    );
  },

  async criar(request: CreateColecaoRequest): Promise<ColecaoResponse> {
    return unwrap(await httpRequest<ApiResponse<ColecaoResponse>>("colecoes", {
      method: "POST",
      body: request,
    }));
  },

  async atualizar(id: string, request: UpdateColecaoRequest): Promise<ColecaoResponse> {
    return unwrap(await httpRequest<ApiResponse<ColecaoResponse>>(`colecoes/${id}`, {
      method: "PUT",
      body: request,
    }));
  },

  async excluir(id: string): Promise<void> {
    await httpRequest<void>(`colecoes/${id}`, {
      method: "DELETE",
    });
  },

  async publicar(id: string): Promise<ColecaoResponse> {
    return unwrap(await httpRequest<ApiResponse<ColecaoResponse>>(`colecoes/${id}/publicar`, {
      method: "PATCH",
    }));
  },

  async despublicar(id: string): Promise<ColecaoResponse> {
    return unwrap(await httpRequest<ApiResponse<ColecaoResponse>>(`colecoes/${id}/despublicar`, {
      method: "PATCH",
    }));
  },

  async adicionarFlashcard(colecaoId: string, request: CreateFlashcardRequest): Promise<FlashcardResponse> {
    return mapFlashcard(
      unwrap(await httpRequest<ApiResponse<BackendFlashcardResponse>>(`colecoes/${colecaoId}/flashcards`, {
        method: "POST",
        body: toFlashcardBody(request),
      })),
    );
  },

  async atualizarFlashcard(
    colecaoId: string,
    flashcardId: string,
    request: UpdateFlashcardRequest,
  ): Promise<FlashcardResponse> {
    return mapFlashcard(
      unwrap(await httpRequest<ApiResponse<BackendFlashcardResponse>>(
        `colecoes/${colecaoId}/flashcards/${flashcardId}`,
        {
          method: "PUT",
          body: toFlashcardBody(request),
        },
      )),
    );
  },

  async removerFlashcard(colecaoId: string, flashcardId: string): Promise<void> {
    await httpRequest<void>(`colecoes/${colecaoId}/flashcards/${flashcardId}`, {
      method: "DELETE",
    });
  },

  async gerarFlashcards(id: string, request: GerarFlashcardsRequest): Promise<ColecaoDetalheResponse> {
    return mapColecaoDetalhe(
      unwrap(await httpRequest<ApiResponse<BackendColecaoDetalheResponse>>(`colecoes/${id}/gerar-flashcards`, {
        method: "POST",
        body: request,
        timeoutMs: 60_000,
      })),
    );
  },
};
