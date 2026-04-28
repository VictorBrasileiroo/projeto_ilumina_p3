package br.com.ilumina.dto.prova;

import java.math.BigDecimal;
import java.util.UUID;

public record QuestaoResultadoResponse(
        UUID questaoId,
        String enunciado,
        String letraEscolhida,
        String gabarito,
        boolean acertou,
        BigDecimal pontuacao
) {
}
