package br.com.ilumina.dto.busca;

import java.util.List;

public record BuscaGlobalResponse(
        List<BuscaItemResponse> turmas,
        List<BuscaItemResponse> provas,
        List<BuscaItemResponse> colecoes,
        List<BuscaItemResponse> alunos
) {
}
