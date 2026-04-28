import { httpRequest, invalidateAuthState } from "../lib/http";
import { mapAuthResponseToSession } from "../lib/mappings";
import { setAuthSession } from "../lib/storage";
import type { AuthSession } from "../types/auth";
import type { ApiResponse } from "../types/shared";
import type { CreateProfessorRequest, CreateProfessorResponse } from "../types/school";

export const professorService = {
  async register(request: CreateProfessorRequest): Promise<AuthSession> {
    const response = await httpRequest<ApiResponse<CreateProfessorResponse>>("professor", {
      method: "POST",
      body: request,
      auth: false,
      skipRefresh: true,
      retryOnAuthFailure: false,
    });

    const session = mapAuthResponseToSession({
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      type: response.data.type,
      userId: response.data.userId,
      professorId: response.data.id,
      alunoId: null,
      name: response.data.name,
      email: response.data.email,
      roles: response.data.roles,
    });

    invalidateAuthState();
    setAuthSession(session);
    return session;
  },
};
