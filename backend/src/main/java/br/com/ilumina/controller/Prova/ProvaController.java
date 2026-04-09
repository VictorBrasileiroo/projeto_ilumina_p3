package br.com.ilumina.controller.Prova;

import br.com.ilumina.dto.prova.AlternativaResponse;
import br.com.ilumina.dto.prova.CreateProvaRequest;
import br.com.ilumina.dto.prova.CreateQuestaoRequest;
import br.com.ilumina.dto.prova.ProvaDetalheResponse;
import br.com.ilumina.dto.prova.ProvaResponse;
import br.com.ilumina.dto.prova.QuestaoResponse;
import br.com.ilumina.dto.prova.UpdateAlternativaRequest;
import br.com.ilumina.dto.prova.UpdateProvaRequest;
import br.com.ilumina.dto.prova.UpdateQuestaoRequest;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Prova.ProvaService;
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
@RequestMapping("/api/v1/provas")
@SecurityRequirement(name = "bearerAuth")
public class ProvaController {

    private final ProvaService provaService;

    public ProvaController(ProvaService provaService) {
        this.provaService = provaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ProvaResponse>> criar(
            @Valid @RequestBody CreateProvaRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaResponse response = provaService.criar(request, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProvaResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Prova criada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<List<ProvaResponse>>> listar(
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        List<ProvaResponse> response = provaService.listar(authentication.getName(), isAdmin(authentication));

        ApiResponse<List<ProvaResponse>> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Provas listadas com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ProvaDetalheResponse>> detalhar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaDetalheResponse response = provaService.detalhar(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProvaDetalheResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Prova detalhada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ProvaResponse>> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProvaRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaResponse response = provaService.atualizar(id, request, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProvaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Prova atualizada com sucesso.",
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
        provaService.excluir(id, authentication.getName(), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{provaId}/questoes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<QuestaoResponse>> adicionarQuestao(
            @PathVariable UUID provaId,
            @Valid @RequestBody CreateQuestaoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        QuestaoResponse response = provaService.adicionarQuestao(
                provaId,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<QuestaoResponse> body = ApiResponse.sucess(
                HttpStatus.CREATED.value(),
                "Questão adicionada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{provaId}/questoes/{questaoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<QuestaoResponse>> atualizarQuestao(
            @PathVariable UUID provaId,
            @PathVariable UUID questaoId,
            @Valid @RequestBody UpdateQuestaoRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        QuestaoResponse response = provaService.atualizarQuestao(
                provaId,
                questaoId,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<QuestaoResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Questão atualizada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/{provaId}/questoes/{questaoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<Void> removerQuestao(
            @PathVariable UUID provaId,
            @PathVariable UUID questaoId,
            Authentication authentication
    ) {
        provaService.removerQuestao(provaId, questaoId, authentication.getName(), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{provaId}/questoes/{questaoId}/alternativas/{altId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<AlternativaResponse>> atualizarAlternativa(
            @PathVariable UUID provaId,
            @PathVariable UUID questaoId,
            @PathVariable UUID altId,
            @Valid @RequestBody UpdateAlternativaRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        AlternativaResponse response = provaService.atualizarAlternativa(
                provaId,
                questaoId,
                altId,
                request,
                authentication.getName(),
                isAdmin(authentication)
        );

        ApiResponse<AlternativaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Alternativa atualizada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/publicar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ProvaResponse>> publicar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaResponse response = provaService.publicar(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProvaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Prova publicada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/{id}/despublicar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ProvaResponse>> despublicar(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        ProvaResponse response = provaService.despublicar(id, authentication.getName(), isAdmin(authentication));

        ApiResponse<ProvaResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Prova despublicada com sucesso.",
                response,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
