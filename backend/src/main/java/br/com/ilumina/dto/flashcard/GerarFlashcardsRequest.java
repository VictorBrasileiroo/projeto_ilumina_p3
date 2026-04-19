package br.com.ilumina.dto.flashcard;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GerarFlashcardsRequest(
        @NotBlank(message = "O tema e obrigatorio.")
        @Size(max = 255, message = "O tema deve ter no maximo 255 caracteres.")
        String tema,

        @NotNull(message = "A quantidade e obrigatoria.")
        @Min(value = 1, message = "A quantidade minima e 1.")
        @Max(value = 20, message = "A quantidade maxima e 20.")
        Integer quantidade
) {
}