import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type {
  ColecaoAlunoResponse,
  ColecaoDetalheAlunoBackendResponse,
  ColecaoDetalheAlunoResponse,
  FlashcardAlunoBackendResponse,
  FlashcardAlunoResponse,
} from "../types/flashcard";

function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

function mapFlashcard(response: FlashcardAlunoBackendResponse): FlashcardAlunoResponse {
  return {
    id: response.id,
    frente: response.textoFrente,
    verso: response.textoVerso,
    ordem: response.ordem,
  };
}

function mapColecaoDetalhe(response: ColecaoDetalheAlunoBackendResponse): ColecaoDetalheAlunoResponse {
  return {
    ...response,
    flashcards: response.flashcards.map(mapFlashcard),
  };
}

export const alunoColecaoService = {
  async listar(): Promise<ColecaoAlunoResponse[]> {
    return unwrap(await httpRequest<ApiResponse<ColecaoAlunoResponse[]>>("aluno/colecoes"));
  },

  async detalhar(id: string): Promise<ColecaoDetalheAlunoResponse> {
    return mapColecaoDetalhe(
      unwrap(await httpRequest<ApiResponse<ColecaoDetalheAlunoBackendResponse>>(`aluno/colecoes/${id}`)),
    );
  },
};
