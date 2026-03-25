package br.com.ilumina.controller.Auth;

import br.com.ilumina.dto.auth.AuthResponse;
import br.com.ilumina.dto.auth.LoginRequest;
import br.com.ilumina.dto.auth.RegisterRequest;
import br.com.ilumina.service.Auth.AuthSeervice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthSeervice authService;

    @PostMapping("/register")
    public AuthResponse register(RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(LoginRequest request){
        return authService.login(request);
    }

}
