package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateAlternativaRequest(
        @NotBlank(message = "O texto da alternativa é obrigatório.")
        String texto,

        @NotNull(message = "A letra da alternativa é obrigatória.")
        @Pattern(regexp = "[ABCD]", message = "A letra deve ser A, B, C ou D.")
        String letra
) {
}
