package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateQuestaoRequest(
        @Size(max = 5000, message = "O enunciado deve ter no máximo 5000 caracteres.")
        String enunciado,

        @Pattern(regexp = "[ABCD]", message = "O gabarito deve ser A, B, C ou D.")
        String gabarito,

        BigDecimal pontuacao,

        Integer ordem
) {
}
