package br.com.ilumina.dto.professor;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfessorResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String disciplina,
        String sexo,
        boolean active,
        OffsetDateTime createdAt
) {
}
