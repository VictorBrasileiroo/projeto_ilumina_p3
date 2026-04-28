package br.com.ilumina.dto.prova;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlternativaResponse(
        UUID id,
        String letra,
        String texto,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
