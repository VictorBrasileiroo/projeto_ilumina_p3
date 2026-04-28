package br.com.ilumina.dto.prova;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProvaDetalheAlunoResponse(
        UUID id,
        String titulo,
        String descricao,
        String disciplina,
        UUID turmaId,
        String turmaNome,
        int totalQuestoes,
        List<QuestaoAlunoResponse> questoes,
        OffsetDateTime createdAt
) {
}
