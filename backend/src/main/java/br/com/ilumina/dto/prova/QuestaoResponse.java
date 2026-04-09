package br.com.ilumina.dto.prova;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record QuestaoResponse(
        UUID id,
        String enunciado,
        String gabarito,
        BigDecimal pontuacao,
        int ordem,
        List<AlternativaResponse> alternativas,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
