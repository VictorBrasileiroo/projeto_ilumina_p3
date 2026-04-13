package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record RespostaItemRequest(
        @NotNull(message = "A questão é obrigatória.")
        UUID questaoId,

        @NotNull(message = "A letra escolhida é obrigatória.")
        @Pattern(regexp = "[ABCD]", message = "A letra escolhida deve ser A, B, C ou D.")
        String letraEscolhida
) {
}
