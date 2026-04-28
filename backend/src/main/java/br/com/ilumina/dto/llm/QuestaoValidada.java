package br.com.ilumina.dto.llm;

import java.math.BigDecimal;
import java.util.List;

public record QuestaoValidada(
        String enunciado,
        char gabarito,
        BigDecimal pontuacao,
        int ordem,
        List<AlternativaValidada> alternativas
) {
}
