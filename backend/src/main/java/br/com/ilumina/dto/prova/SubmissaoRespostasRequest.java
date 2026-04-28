package br.com.ilumina.dto.prova;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmissaoRespostasRequest(
        @NotEmpty(message = "É necessário informar as respostas.")
        @Valid
        List<RespostaItemRequest> respostas
) {
}
