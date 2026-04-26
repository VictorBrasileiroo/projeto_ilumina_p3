export type ColecaoStatus = "RASCUNHO" | "PUBLICADA";

export interface ColecaoResponse {
  id: string;
  titulo: string;
  tema: string | null;
  qntCards: number | null;
  status: ColecaoStatus;
  turmaNome: string;
  totalFlashcards: number;
  createdAt: string;
}

export interface FlashcardResponse {
  id: string;
  frente: string;
  verso: string;
  ordem: number;
}

export interface ColecaoDetalheResponse extends ColecaoResponse {
  flashcards: FlashcardResponse[];
}

export interface CreateColecaoRequest {
  titulo: string;
  tema?: string | null;
  qntCards?: number | null;
  turmaId: string;
}

export type UpdateColecaoRequest = Partial<Omit<CreateColecaoRequest, "turmaId">>;

export interface CreateFlashcardRequest {
  frente: string;
  verso: string;
}

export interface UpdateFlashcardRequest {
  frente: string;
  verso: string;
}

export interface GerarFlashcardsRequest {
  tema: string;
  quantidade?: number;
}
