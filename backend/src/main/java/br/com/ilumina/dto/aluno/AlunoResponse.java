package br.com.ilumina.dto.aluno;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlunoResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String matricula,
        String sexo,
        boolean active,
        OffsetDateTime createdAt
) {
}
