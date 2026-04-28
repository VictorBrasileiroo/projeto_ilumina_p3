package br.com.ilumina.dto.prova;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProvaAlunoResponse(
        UUID id,
        String titulo,
        String disciplina,
        OffsetDateTime createdAt,
        String turmaNome,
        long totalQuestoes,
        boolean jaRespondeu
) {
}
