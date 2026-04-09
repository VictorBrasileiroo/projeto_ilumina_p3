package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record GerarQuestoesRequest(
        @NotBlank(message = "O tema é obrigatório.")
        String tema,

        @Min(value = 1, message = "A quantidade deve ser no mínimo 1.")
        @Max(value = 20, message = "A quantidade deve ser no máximo 20.")
        Integer quantidade
) {
}
