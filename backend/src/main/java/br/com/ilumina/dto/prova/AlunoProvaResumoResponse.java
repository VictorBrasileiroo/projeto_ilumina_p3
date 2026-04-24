package br.com.ilumina.dto.prova;

import java.math.BigDecimal;
import java.util.List;

public record AlunoProvaResumoResponse(
        int totalProvas,
        int totalRespondidas,
        int totalPendentes,
        BigDecimal mediaNota,
        List<ResumoPorDisciplinaItem> porDisciplina
) {
    public record ResumoPorDisciplinaItem(
            String disciplina,
            int totalProvas,
            int totalRespondidas,
            BigDecimal mediaNota
    ) {}
}