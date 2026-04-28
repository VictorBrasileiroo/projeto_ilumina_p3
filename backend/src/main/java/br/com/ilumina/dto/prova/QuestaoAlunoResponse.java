package br.com.ilumina.dto.prova;

import java.util.List;
import java.util.UUID;

public record QuestaoAlunoResponse(
        UUID id,
        String enunciado,
        int ordem,
        List<AlternativaAlunoResponse> alternativas
) {
}
