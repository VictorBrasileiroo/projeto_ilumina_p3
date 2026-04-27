package br.com.ilumina.controller.Busca;

import br.com.ilumina.dto.busca.BuscaGlobalResponse;
import br.com.ilumina.dto.shared.ApiResponse;
import br.com.ilumina.service.Busca.BuscaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/busca")
@SecurityRequirement(name = "bearerAuth")
public class BuscaController {

    private final BuscaService buscaService;

    public BuscaController(BuscaService buscaService) {
        this.buscaService = buscaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'ALUNO')")
    public ResponseEntity<ApiResponse<BuscaGlobalResponse>> buscar(
            @RequestParam(defaultValue = "") String q,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        BuscaGlobalResponse resultado = buscaService.buscar(q, authentication);

        ApiResponse<BuscaGlobalResponse> body = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "Busca executada com sucesso.",
                resultado,
                servletRequest.getRequestURI()
        );

        return ResponseEntity.ok(body);
    }
}
