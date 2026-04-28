import { httpRequest } from "../lib/http";
import type { ApiResponse } from "../types/shared";
import type { BuscaGlobalResponse } from "../types/busca";

export const buscaService = {
  async buscar(query: string): Promise<BuscaGlobalResponse> {
    const params = new URLSearchParams({ q: query });
    const response = await httpRequest<ApiResponse<BuscaGlobalResponse>>(`busca?${params.toString()}`);
    return response.data;
  },
};
