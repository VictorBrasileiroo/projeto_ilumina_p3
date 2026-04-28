package br.com.ilumina.dto.prova;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ResultadoProvaResponse(
        UUID provaId,
        String provaTitle,
        int totalQuestoes,
        int totalAcertos,
        BigDecimal notaFinal,
        OffsetDateTime respondidoEm,
        List<QuestaoResultadoResponse> questoes
) {
}
