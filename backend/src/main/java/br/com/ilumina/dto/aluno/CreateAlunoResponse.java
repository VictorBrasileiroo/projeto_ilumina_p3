package br.com.ilumina.dto.aluno;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record CreateAlunoResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String matricula,
        String sexo,
        boolean active,
        OffsetDateTime createdAt,
        String token,
        String refreshToken,
        String type,
        Set<String> roles
) {
}
