package br.com.ilumina.dto.auth;

import java.util.Set;
import java.util.UUID;

public record AuthResponse(
        String token,
        String refreshToken,
        String type,
        UUID userId,
        UUID professorId,
        UUID alunoId,
        String name,
        String email,
        Set<String> roles
) {
}
