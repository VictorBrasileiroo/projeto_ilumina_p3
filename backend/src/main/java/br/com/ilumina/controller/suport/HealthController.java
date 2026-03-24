package br.com.ilumina.controller.suport;

import br.com.ilumina.dto.shared.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> health(HttpServletRequest request){
        Map<String, String> data = Map.of(
                "status", "UP",
                "service", "ilumina-backend"
        );

        ApiResponse<Map<String, String>> response = ApiResponse.sucess(
                HttpStatus.OK.value(),
                "API em funcionamento",
                data,
                request.getRequestURI()
        );

        return ResponseEntity.ok(response);
    }
}


