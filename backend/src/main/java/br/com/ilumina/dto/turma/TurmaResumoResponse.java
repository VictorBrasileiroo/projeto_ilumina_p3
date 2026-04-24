package br.com.ilumina.dto.turma;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TurmaResumoResponse(
        UUID turmaId,
        String turmaNome,
        int totalAlunos,
        int totalProvasPublicadas,
        int totalRespostas,
        BigDecimal mediaNota,
        List<MediaPorProvaItem> mediasPorProva
) {
    public record MediaPorProvaItem(
            UUID provaId,
            String titulo,
            String disciplina,
            int totalRespostas,
            BigDecimal mediaNota
    ) {}
}