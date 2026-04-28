package br.com.ilumina.controller.Flashcard;

import br.com.ilumina.dto.flashcard.ColecaoAlunoResponse;
import br.com.ilumina.dto.flashcard.ColecaoDetalheAlunoResponse;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Flashcard.AlunoFlashcardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/aluno/colecoes")
@SecurityRequirement(name = "bearerAuth")
public class AlunoFlashcardController {

    private final AlunoFlashcardService alunoFlashcardService;

    public AlunoFlashcardController(AlunoFlashcardService alunoFlashcardService) {
        this.alunoFlashcardService = alunoFlashcardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<List<ColecaoAlunoResponse>>> listarColecoes(
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<ColecaoAlunoResponse> response = alunoFlashcardService.listarColecoesParaAluno(authentication.getName());

        ApiResponse<List<ColecaoAlunoResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecoes do aluno listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALUNO')")
    public ResponseEntity<ApiResponse<ColecaoDetalheAlunoResponse>> detalharColecao(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoDetalheAlunoResponse response = alunoFlashcardService.detalharColecaoParaAluno(id, authentication.getName());

        ApiResponse<ColecaoDetalheAlunoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecao detalhada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }
}
