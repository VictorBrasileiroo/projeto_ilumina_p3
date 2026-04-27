package br.com.ilumina.dto.busca;

import java.util.UUID;

public record BuscaItemResponse(
        UUID id,
        String tipo,
        String titulo,
        String subtitulo
) {
}
