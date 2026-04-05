package br.com.ilumina.dto.professor;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public record CreateProfessorResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String disciplina,
        String sexo,
        boolean active,
        OffsetDateTime createdAt,
        String token,
        String refreshToken,
        String type,
        Set<String> roles
) {
}