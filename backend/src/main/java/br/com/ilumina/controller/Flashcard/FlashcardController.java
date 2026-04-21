package br.com.ilumina.controller.Flashcard;

import br.com.ilumina.dto.flashcard.ColecaoDetalheResponse;
import br.com.ilumina.dto.flashcard.ColecaoResponse;
import br.com.ilumina.dto.flashcard.CreateColecaoRequest;
import br.com.ilumina.dto.flashcard.CreateFlashcardRequest;
import br.com.ilumina.dto.flashcard.FlashcardResponse;
import br.com.ilumina.dto.flashcard.GerarFlashcardsRequest;
import br.com.ilumina.dto.flashcard.UpdateColecaoRequest;
import br.com.ilumina.dto.flashcard.UpdateFlashcardRequest;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Flashcard.FlashcardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/colecoes")
@SecurityRequirement(name = "bearerAuth")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoResponse>> criar(
            @Valid @RequestBody CreateColecaoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoResponse response = flashcardService.criar(request, authentication.getName(), isAdmin(authentication));

        ApiResponse<ColecaoResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Colecao criada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<List<ColecaoResponse>>> listar(
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<ColecaoResponse> response = flashcardService.listarPorProfessor(authentication.getName(), isAdmin(authentication));

        ApiResponse<List<ColecaoResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecoes listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoDetalheResponse>> detalhar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoDetalheResponse response = flashcardService.buscarDetalhePorId(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ColecaoDetalheResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecao detalhada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoResponse>> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateColecaoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoResponse response = flashcardService.atualizar(id, request, authentication.getName(), isAdmin(authentication));

        ApiResponse<ColecaoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecao atualizada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<Void> excluir(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        flashcardService.excluirColecao(id, authentication.getName(), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publicar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoResponse>> publicar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoResponse response = flashcardService.publicar(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ColecaoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecao publicada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/despublicar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoResponse>> despublicar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoResponse response = flashcardService.despublicar(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ColecaoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Colecao despublicada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PostMapping("/{colecaoId}/flashcards")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<FlashcardResponse>> adicionarFlashcard(
            @PathVariable UUID colecaoId,
            @Valid @RequestBody CreateFlashcardRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        FlashcardResponse response = flashcardService.adicionarFlashcard(
                colecaoId,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<FlashcardResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Flashcard adicionado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/{id}/gerar-flashcards")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ColecaoDetalheResponse>> gerarFlashcards(
            @PathVariable UUID id,
            @Valid @RequestBody GerarFlashcardsRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ColecaoDetalheResponse response = flashcardService.gerarFlashcards(
                id,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<ColecaoDetalheResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Flashcards gerados com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{colecaoId}/flashcards/{flashcardId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<FlashcardResponse>> editarFlashcard(
            @PathVariable UUID colecaoId,
            @PathVariable UUID flashcardId,
            @Valid @RequestBody UpdateFlashcardRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        FlashcardResponse response = flashcardService.editarFlashcard(
                colecaoId,
                flashcardId,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<FlashcardResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Flashcard atualizado com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/{colecaoId}/flashcards/{flashcardId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<Void> removerFlashcard(
            @PathVariable UUID colecaoId,
            @PathVariable UUID flashcardId,
            Authentication authentication
    ) {
        flashcardService.removerFlashcard(colecaoId, flashcardId, authentication.getName(), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
