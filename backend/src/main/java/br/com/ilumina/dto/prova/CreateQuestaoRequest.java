package br.com.ilumina.dto.prova;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateQuestaoRequest(
        @NotBlank(message = "O enunciado é obrigatório.")
        String enunciado,

        @NotNull(message = "O gabarito é obrigatório.")
        @Pattern(regexp = "[ABCD]", message = "O gabarito deve ser A, B, C ou D.")
        String gabarito,

        BigDecimal pontuacao,

        @NotNull(message = "A ordem é obrigatória.")
        @Min(value = 1, message = "A ordem deve ser no mínimo 1.")
        Integer ordem,

        @NotEmpty(message = "Deve haver ao menos uma alternativa.")
        @Size(min = 2, max = 4, message = "Deve haver entre 2 e 4 alternativas.")
        @Valid
        List<CreateAlternativaRequest> alternativas
) {
}
